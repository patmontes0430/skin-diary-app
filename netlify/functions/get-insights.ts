import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import type { LogEntry, InsightSections } from '../../src/types';

// This is the main handler for the Netlify serverless function.
// It's an async function that receives event data and must return a response object.
export const handler = async (event: { httpMethod: string; body: string | null }) => {
  // Ensure the request is a POST request, as we're sending data.
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  // Securely access the API key from Netlify's environment variables.
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY is not set in the Netlify environment.");
    return { statusCode: 500, body: JSON.stringify({ error: "Server configuration error: API key is missing." }) };
  }

  const ai = new GoogleGenAI({ apiKey });

  // Parse the log entries and optional question from the frontend.
  let logs: LogEntry[];
  let question: string | undefined;

  try {
    if (!event.body) {
      return { statusCode: 400, body: JSON.stringify({ error: "Request body is empty." }) };
    }
    const body = JSON.parse(event.body);
    logs = body.logs;
    question = body.question;

    if (!Array.isArray(logs)) {
      return { statusCode: 400, body: JSON.stringify({ error: "Invalid data format: 'logs' must be an array." }) };
    }

    if (logs.length === 0) {
      return { statusCode: 400, body: JSON.stringify({ error: "Cannot analyze an empty log history." }) };
    }
    
    // An initial analysis requires at least two data points to find patterns.
    if (!question && logs.length < 2) {
      return { statusCode: 400, body: JSON.stringify({ error: "Please provide at least two log entries for an initial analysis." }) };
    }
  } catch (e) {
    console.error("Error parsing request body:", e);
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid data format in request." }) };
  }
  
  const model = 'gemini-2.5-flash';

  // --- Handle Drill-down Question ---
  if (question) {
    const systemInstruction = "You are a helpful wellness assistant. Based ONLY on the JSON log data provided, answer the user's follow-up question directly and concisely. Do not give medical advice. Do not repeat the question back in your answer. Frame your analysis as observations of potential patterns, not definitive causes. Use markdown for formatting if needed (like lists or bolding).";
    const prompt = `Analyze these logs: ${JSON.stringify(logs, null, 2)}. Now, answer this question: "${question}"`;
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.3,
            }
        });
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ answer: response.text }),
        };
    } catch (error) {
        console.error("Error calling Gemini API for drill-down:", error);
        const message = error instanceof Error ? error.message : "An unknown error occurred during AI analysis.";
        return {
            statusCode: 502,
            body: JSON.stringify({ error: `Failed to get answer from the AI assistant. ${message}` }),
        };
    }
  } 
  // --- Handle Initial Insights Generation ---
  else {
    const systemInstruction = `You are a helpful wellness assistant analyzing a user's food and skin diary. Your goal is to find potential connections between their logged food, supplements, water intake, timing, and their skin's condition. You must provide clear, concise, and encouraging insights based ONLY on the data provided. Your response MUST be a valid JSON object following the defined schema. Each key should contain a brief analysis. For keys where there isn't enough data, return an empty string. IMPORTANT: DO NOT provide medical advice. Start your summary with encouragement. Frame your analysis as observations of potential patterns, not definitive causes. Base your analysis strictly on the log data.`;
    const prompt = `Analyze these logs and provide insights.\nLogs:\n${JSON.stringify(logs, null, 2)}`;
    const insightsSchema = {
      type: Type.OBJECT,
      properties: {
        foodCorrelations: { type: Type.STRING },
        supplementCorrelations: { type: Type.STRING },
        timingAnalysis: { type: Type.STRING },
        waterAnalysis: { type: Type.STRING },
        summary: { type: Type.STRING },
      },
      required: ["foodCorrelations", "supplementCorrelations", "timingAnalysis", "waterAnalysis", "summary"],
    };


    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.5,
                responseMimeType: "application/json",
                responseSchema: insightsSchema,
            }
        });

        // The response is already a guaranteed JSON string based on the schema
        const parsedData = JSON.parse(response.text) as InsightSections;
        
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsedData),
        };

    } catch (error) {
        console.error("Error calling Gemini API for initial insights:", error);
        const message = error instanceof Error ? error.message : "An unknown error occurred during AI analysis.";
        return {
          statusCode: 502,
          body: JSON.stringify({ error: `Failed to get insights from the AI assistant. ${message}` }),
        };
    }
  }
};
