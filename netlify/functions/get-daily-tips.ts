import { GoogleGenAI } from "@google/genai";

export const handler = async () => {
  // Securely access the API key from Netlify's environment variables.
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is not set in the Netlify environment.");
    return { statusCode: 500, body: JSON.stringify({ error: "Server configuration error: API key is missing." }) };
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = 'gemini-2.5-flash';

  const systemInstruction = "You are a wellness expert providing daily tips. Your tone is positive, encouraging, and easy to understand. You do not give medical advice.";
  const prompt = "Provide one short, actionable skin health tip. It should be no more than 2-3 sentences. Focus on topics like diet, hydration, lifestyle, or simple skincare routines. Do not add any conversational text, titles, or markdown formatting. Just return the raw text of the tip.";

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.8, // A bit of creativity for variety
      }
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tip: response.text }),
    };
  } catch (error) {
    console.error("Error calling Gemini API for daily tip:", error);
    const message = error instanceof Error ? error.message : "An unknown error occurred during AI analysis.";
    return {
      statusCode: 502,
      body: JSON.stringify({ error: `Failed to get tip from the AI assistant. ${message}` }),
    };
  }
};
