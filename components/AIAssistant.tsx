import React, { useState } from 'react';
import { LogEntry, InsightSections } from '../types';

interface AIAssistantProps {
  logs: LogEntry[];
}

// Helper to render markdown-like strings to HTML
const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
    const formattedContent = content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/^- (.*$)/gim, '<li class="ml-4 list-disc">$1</li>') // Basic list support
        .replace(/\n/g, '<br />')
        .replace(/<br \/><li/g, '<li'); // Fix for lists
    return <div dangerouslySetInnerHTML={{ __html: formattedContent }} />;
};

// Metadata for styling insight cards
const insightMetadata: Record<keyof InsightSections, { title: string; icon: string; color: string }> = {
  foodCorrelations: { title: "Food & Skin", icon: "fa-utensils", color: "text-orange-500" },
  supplementCorrelations: { title: "Supplements", icon: "fa-pills", color: "text-sky-500" },
  timingAnalysis: { title: "Timing Patterns", icon: "fa-regular fa-clock", color: "text-indigo-500" },
  waterAnalysis: { title: "Hydration Habits", icon: "fa-droplet", color: "text-blue-500" },
  summary: { title: "Summary & Encouragement", icon: "fa-lightbulb", color: "text-teal-500" },
};


const AIAssistant: React.FC<AIAssistantProps> = ({ logs }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [insights, setInsights] = useState<InsightSections | null>(null);
  const [error, setError] = useState('');

  const handleGetInsights = async () => {
    setIsLoading(true);
    setError('');
    setInsights(null);
    try {
      // Call the secure Netlify Function endpoint instead of the Gemini service directly.
      const response = await fetch('/.netlify/functions/get-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logs),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        // If the server returns an error, use the error message from the response body.
        throw new Error(responseData.error || `Request failed with status ${response.status}`);
      }
      
      setInsights(responseData);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-teal-50 border-2 border-teal-200 p-6 rounded-lg shadow-md my-8">
      <div className="flex items-center mb-4">
        <i className="fa-solid fa-wand-magic-sparkles text-3xl text-teal-500 mr-4"></i>
        <div>
            <h2 className="text-2xl font-bold text-teal-800">AI Assistant</h2>
            <p className="text-teal-600">Find patterns in your logs.</p>
        </div>
      </div>
      
      <button
        onClick={handleGetInsights}
        disabled={isLoading || logs.length < 2}
        className="w-full bg-teal-500 text-white font-bold py-2 px-4 rounded-md shadow-sm hover:bg-teal-600 transition duration-300 disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isLoading ? (
          <>
            <i className="fas fa-spinner fa-spin mr-2"></i>
            <span>Analyzing...</span>
          </>
        ) : (
          <>
           <i className="fa-solid fa-lightbulb mr-2"></i>
           <span>Generate Insights</span>
          </>
        )}
      </button>
      {logs.length < 2 && <p className="text-sm text-center text-teal-600 mt-2">Add at least 2 logs to enable AI analysis.</p>}

      {error && <p className="text-red-500 mt-4 text-center font-medium bg-red-100 p-3 rounded-md">{error}</p>}
      
      {insights && (
        <div className="mt-6 space-y-4">
          {(Object.keys(insights) as Array<keyof InsightSections>).map((key) => {
            const meta = insightMetadata[key];
            const content = insights[key];
            if (!content) return null;
            
            return (
              <div key={key} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                <div className="flex items-center mb-2">
                  <i className={`fa-solid ${meta.icon} ${meta.color} mr-3 fa-lg w-6 text-center`}></i>
                  <h3 className="font-bold text-lg text-slate-700">{meta.title}</h3>
                </div>
                <div className="text-slate-600 pl-9 text-sm">
                  <MarkdownRenderer content={content} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AIAssistant;