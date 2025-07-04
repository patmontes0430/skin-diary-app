import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import type { LogEntry, InsightSections } from '../../types';

// This is the main handler for the Netlify serverless function.
// It's an async function that receives event data and must return a response object.
export const handler = async (event: { httpMethod: string; body: string | null }) => {
  // Ensure the request is a POST request, as we're sending data.
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  // Securely access the API key from Netlify's environment variables.
  // The key is set in the Netlify UI, not in the code.
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY is not set in the Netlify environment.");
    return { statusCode: 500, body: JSON.stringify({ error: "Server configuration error: API key is missing." }) };
  }

  const ai = new GoogleGenAI({ apiKey });

  // Parse the log entries sent from the frontend.
  let logs: LogEntry[];
  try {
    if (!event.body) {
         return { statusCode: 400, body: JSON.stringify({ error: "Request body is empty." }) };
    }
    logs = JSON.parse(event.body);
    if (!Array.isArray(logs) || logs.length < 2) {
      return { statusCode: 400, body: JSON.stringify({ error: "Please provide at least two log entries for analysis." }) };
    }
  } catch (e) {
    console.error("Error parsing request body:", e);
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid data format in request." }) };
  }

  // The logic for interacting with the Gemini API, now running securely on the server.
  const model = 'gemini-2.5-flash-preview-04-17';
  const systemInstruction = `You are a helpful wellness assistant analyzing a user's food and skin diary. Your goal is to find potential connections between their logged food, supplements, water intake, timing, and their skin's condition. You must provide clear, concise, and encouraging insights based ONLY on the data provided. Your response MUST be a valid JSON object following this structure: { "foodCorrelations": string, "supplementCorrelations": string, "timingAnalysis": string, "waterAnalysis": string, "summary": string }. Each key should contain a brief analysis. For keys where there isn't enough data, return an empty string. IMPORTANT: DO NOT provide medical advice. Start your summary with encouragement. Frame your analysis as observations of potential patterns, not definitive causes. Base your analysis strictly on the log data.`;
  const prompt = `Analyze these logs and provide insights as a JSON object with keys: "foodCorrelations", "supplementCorrelations", "timingAnalysis", "waterAnalysis", "summary".\nLogs:\n${JSON.stringify(logs, null, 2)}`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
            systemInstruction: systemInstruction,
            temperature: 0.5,
            responseMimeType: "application/json",
        }
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }
    
    // Validate that the parsed data is in the expected format.
    const parsedData = JSON.parse(jsonStr) as InsightSections;
     if (!parsedData.foodCorrelations || !parsedData.summary) {
        throw new Error("AI response is missing required sections.");
    }
    
    // Return a successful response with the insights.
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsedData),
    };

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    const message = error instanceof Error ? error.message : "An unknown error occurred during AI analysis.";
    return {
      statusCode: 502, // Bad Gateway, indicating an error from an upstream server (Gemini).
      body: JSON.stringify({ error: `Failed to get insights from the AI assistant. ${message}` }),
    };
  }
};
