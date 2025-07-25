import { GoogleGenAI, Type } from "@google/genai";
import type { LogEntry, InsightSections } from '../types';

// The API key is injected at build time by Vite. If it's missing, the app will fail when making an API call.
// This check provides a clearer error if the environment variable is not set.
if (!process.env.API_KEY) {
  throw new Error("API key is not configured. Please set the GEMINI_API_KEY environment variable in your deployment settings.");
}
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = 'gemini-2.5-flash';

export const getInsights = async (logs: LogEntry[]): Promise<InsightSections> => {
  if (logs.length < 2) {
    throw new Error("Please provide at least two log entries for an initial analysis.");
  }
  
  const systemInstruction = `You are a helpful wellness assistant analyzing a user's food and skin diary. Your goal is to find potential connections between their logged food, supplements, water intake, timing, and their skin's condition. You must provide clear, concise, and encouraging insights based ONLY on the data provided. IMPORTANT: DO NOT provide medical advice. Start your summary with encouragement. Frame your analysis as observations of potential patterns, not definitive causes. Base your analysis strictly on the log data. For sections where there isn't enough data, state that more data is needed to find a pattern. Your tone should be supportive and helpful. Use markdown for formatting lists or bolding text.`;

  // Remove photo and id to save tokens and avoid sending unnecessary data.
  const logsString = JSON.stringify(logs.map(({ id, photo, ...rest }) => rest), null, 2);
  const prompt = `Here are the user's logs:\n${logsString}\n\nPlease analyze these logs and provide insights.`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      foodCorrelations: {
        type: Type.STRING,
        description: 'Analysis of potential correlations between food intake and skin reactions. Note any foods that appear on both good and bad skin days.'
      },
      supplementCorrelations: {
        type: Type.STRING,
        description: 'Analysis of potential correlations between supplement/medicine intake and skin reactions.'
      },
      timingAnalysis: {
        type: Type.STRING,
        description: 'Analysis of any patterns related to the timing of intake vs. the timing of skin reactions.'
      },
      waterAnalysis: {
        type: Type.STRING,
        description: 'Analysis of hydration levels and their potential impact on skin ratings.'
      },
      summary: {
        type: Type.STRING,
        description: 'A high-level summary of the findings and some encouraging words for the user to continue logging.'
      }
    },
    required: ['foodCorrelations', 'supplementCorrelations', 'timingAnalysis', 'waterAnalysis', 'summary'],
  };

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
  } catch (error) {
    console.error('Error getting insights from Gemini:', error);
    throw new Error('Failed to generate insights. The AI assistant may be temporarily unavailable.');
  }
};


export const getDrillDownAnswer = async (logs: LogEntry[], question: string): Promise<string> => {
    if (logs.length < 2) {
        throw new Error("Not enough log data to answer.");
    }

    const systemInstruction = `You are a helpful wellness assistant analyzing a user's food and skin diary. Your goal is to answer a specific follow-up question based on the provided logs. Be concise and base your answer strictly on the log data. Do not provide medical advice. Frame your analysis as observations of potential patterns. Use markdown for formatting.`;

    // Remove photo and id to save tokens and avoid sending unnecessary data.
    const logsString = JSON.stringify(logs.map(({ id, photo, ...rest }) => rest), null, 2);
    const prompt = `Here are the user's logs:\n${logsString}\n\nPlease answer the following question based on these logs:\nQuestion: "${question}"`;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
            },
        });
        return response.text;
    } catch (error) {
        console.error('Error getting drill-down answer from Gemini:', error);
        throw new Error('Failed to get an answer. The AI assistant may be temporarily unavailable.');
    }
};

export const getDailyTip = async (): Promise<string> => {
    const systemInstruction = "You are a wellness expert providing a single, concise, actionable daily tip for improving skin health from the inside out (e.g., related to diet, hydration, lifestyle). The tip should be encouraging and easy to understand. Do not include any intro or outro text, just the tip itself. The tip should be a single sentence, or two at most.";
    const prompt = "Give me a skin health tip for today.";

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
            },
        });

        // Clean up the response to remove potential quotation marks
        return response.text.trim().replace(/^"|"$/g, '');
    } catch (error) {
        console.error('Error getting daily tip from Gemini:', error);
        throw new Error('Failed to fetch daily tip. Please try again later.');
    }
};
