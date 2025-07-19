import { GoogleGenAI, Type } from "@google/genai";
import type { LogEntry, InsightSections } from '../types';

// The instructions state: "The API key must be obtained exclusively from the environment variable process.env.API_KEY. Assume this variable is pre-configured, valid, and accessible in the execution context where the API client is initialized."
// "Strict Prohibition: ... Do not define process.env or request that the user update the API_KEY in the code."
// We assume Vite is configured to make `process.env.API_KEY` available. A client-side check is useful for developers but must not prompt the user.
if (!process.env.API_KEY) {
  // This will be visible in the developer console if the key is not set.
  // It is a developer-facing error, not a user-facing one.
  console.error("Gemini API key is missing. Please set the API_KEY environment variable.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
const model = 'gemini-2.5-flash';

export const getInsights = async (logs: LogEntry[]): Promise<InsightSections> => {
  if (logs.length < 2) {
    throw new Error("Please provide at least two log entries for an initial analysis.");
  }
  
  const systemInstruction = `You are a helpful wellness assistant analyzing a user's food and skin diary. Your goal is to find potential connections between their logged food, supplements, water intake, timing, and their skin's condition. You must provide clear, concise, and encouraging insights based ONLY on the data provided. IMPORTANT: DO NOT provide medical advice. Start your summary with encouragement. Frame your analysis as observations of potential patterns, not definitive causes. Base your analysis strictly on the log data. For sections where there isn't enough data, return an empty string.`;
  const prompt = `Analyze these logs and provide insights.\nLogs:\n${JSON.stringify(logs, null, 2)}`;
  const insightsSchema = {
      type: Type.OBJECT,
      properties: {
          foodCorrelations: { type: Type.STRING, description: "Analysis of food intake and skin reactions." },
          supplementCorrelations: { type: Type.STRING, description: "Analysis of supplements/medicine and skin reactions." },
          timingAnalysis: { type: Type.STRING, description: "Analysis of intake/reaction timing and skin reactions." },
          waterAnalysis: { type: Type.STRING, description: "Analysis of water intake and skin condition." },
          summary: { type: Type.STRING, description: "An overall summary and encouraging message." },
      },
      required: ["foodCorrelations", "supplementCorrelations", "timingAnalysis", "waterAnalysis", "summary"]
  };

  try {
      const response = await ai.models.generateContent({
          model: model,
          contents: prompt,
          config: {
              systemInstruction: systemInstruction,
              temperature: 0.5,
              responseMimeType: "application/json",
              responseSchema: insightsSchema,
          }
      });
      
      const parsedData = JSON.parse(response.text) as InsightSections;
      if (!parsedData.foodCorrelations && !parsedData.summary) {
          parsedData.summary = parsedData.summary || "The AI returned a response, but it was not in the expected format. You could try again.";
      }
      return parsedData;
  } catch (error) {
      console.error("Error calling Gemini API for initial insights:", error);
      const message = error instanceof Error ? error.message : "An unknown error occurred during AI analysis.";
      throw new Error(`Failed to get insights from the AI assistant. ${message}`);
  }
};

export const getDrillDownAnswer = async (logs: LogEntry[], question: string): Promise<string> => {
  const systemInstruction = "You are a helpful wellness assistant. Based ONLY on the JSON log data provided, answer the user's follow-up question directly and concisely. Do not give medical advice. Do not repeat the question back in your answer. Frame your analysis as observations of potential patterns, not definitive causes. Use markdown for formatting if needed (like lists or bolding).";
  const prompt = `Analyze these logs: ${JSON.stringify(logs, null, 2)}. Now, answer this question: "${question}"`;
  
  try {
      const response = await ai.models.generateContent({
          model: model,
          contents: prompt,
          config: {
              systemInstruction: systemInstruction,
              temperature: 0.3,
          }
      });
      return response.text;
  } catch (error) {
      console.error("Error calling Gemini API for drill-down:", error);
      const message = error instanceof Error ? error.message : "An unknown error occurred during AI analysis.";
      throw new Error(`Failed to get answer from the AI assistant. ${message}`);
  }
};

export const getDailyTip = async (): Promise<string> => {
    const systemInstruction = "You are a wellness expert providing daily tips. Your tone is positive, encouraging, and easy to understand. You do not give medical advice.";
    const prompt = "Provide one short, actionable skin health tip. It should be no more than 2-3 sentences. Focus on topics like diet, hydration, lifestyle, or simple skincare routines. Do not add any conversational text, titles, or markdown formatting. Just return the raw text of the tip.";

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.8,
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API for daily tip:", error);
        const message = error instanceof Error ? error.message : "An unknown error occurred during AI analysis.";
        throw new Error(`Failed to get tip from the AI assistant. ${message}`);
    }
};
