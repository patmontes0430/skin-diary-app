// This serverless function is deprecated.
// The daily tip logic has been moved to the client-side at src/services/geminiService.ts
// to resolve API key and deployment issues.
export const handler = async () => {
  return {
    statusCode: 410, // Gone
    body: JSON.stringify({ error: "This endpoint is no longer in use." }),
  };
};
