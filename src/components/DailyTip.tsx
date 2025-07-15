import React, { useState, useEffect } from 'react';

const DailyTip: React.FC = () => {
    const [tip, setTip] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTip = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Check local storage first
                const cachedTipData = localStorage.getItem('dailySkinTip');
                const today = new Date().toISOString().split('T')[0];

                if (cachedTipData) {
                    const { tip: cachedTip, date } = JSON.parse(cachedTipData);
                    if (date === today) {
                        setTip(cachedTip);
                        setIsLoading(false);
                        return;
                    }
                }

                // If no valid cache, fetch from the serverless function
                const response = await fetch('/.netlify/functions/get-daily-tip');
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to fetch tip.');
                }

                if (data.tip) {
                    setTip(data.tip);
                    // Cache the new tip with today's date
                    localStorage.setItem('dailySkinTip', JSON.stringify({ tip: data.tip, date: today }));
                }

            } catch (err: any) {
                console.error("Failed to fetch daily tip:", err);
                setError("Couldn't fetch a fresh tip right now. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchTip();
    }, []);

    const TipContent = () => {
        if (isLoading) {
            return (
                 <div className="flex items-center justify-center text-slate-500">
                    <i className="fas fa-spinner fa-spin mr-3"></i>
                    <span>Fetching a fresh tip for you...</span>
                </div>
            );
        }
        if (error) {
            return <p className="text-center text-red-500 font-medium">{error}</p>;
        }
        if (tip) {
            return <p className="text-center text-slate-700 italic">"{tip}"</p>;
        }
        return <p className="text-center text-slate-500">No tip available today. Please check back tomorrow!</p>;
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg my-8 border-l-4 border-teal-400">
            <h2 className="text-xl font-bold text-slate-800 text-center mb-4 flex items-center justify-center">
                <i className="fa-regular fa-lightbulb text-yellow-400 mr-3"></i>
                Daily Skin Health Tip
            </h2>
            <div className="h-12 flex items-center justify-center">
                <TipContent />
            </div>
        </div>
    );
};

export default DailyTip;
