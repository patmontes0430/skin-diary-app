import React, { useState } from 'react';
import { LogEntry } from './types';
import useLocalStorage from './hooks/useLocalStorage';
import Header from './components/Header';
import LogEntryForm from './components/LogEntryForm';
import LogHistory from './components/LogHistory';
import AIAssistant from './components/AIAssistant';
import AdBanner from './components/AdBanner';
import VisualSummary from './components/VisualSummary';

const App: React.FC = () => {
  const [logs, setLogs] = useLocalStorage<LogEntry[]>('skin-diary-logs', []);
  const [editingLog, setEditingLog] = useState<LogEntry | null>(null);

  const addLog = (newLog: Omit<LogEntry, 'id'>) => {
    const logWithId: LogEntry = {
      ...newLog,
      id: new Date().getTime().toString(),
    };
    setLogs(prevLogs => [...prevLogs, logWithId]);
  };

  const updateLog = (updatedLog: LogEntry) => {
    setLogs(prevLogs => prevLogs.map(log => log.id === updatedLog.id ? updatedLog : log));
    setEditingLog(null); // Clear editing state
  };

  const deleteLog = (id: string) => {
    if(window.confirm('Are you sure you want to delete this log?')) {
        setLogs(prevLogs => prevLogs.filter(log => log.id !== id));
    }
  };

  const handleEditLog = (log: LogEntry) => {
    setEditingLog(log);
    // Scroll to the form for a better user experience
    const formElement = document.getElementById('log-form');
    if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCancelEdit = () => {
      setEditingLog(null);
  }


  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Header />
      <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <LogEntryForm 
            onAddLog={addLog}
            onUpdateLog={updateLog}
            editingLog={editingLog}
            onCancelEdit={handleCancelEdit}
        />
        <VisualSummary logs={logs} />
        {/* 
            IMPORTANT: Google AdSense Banner
            Replace the adClient and adSlot with your own from your AdSense account.
        */}
        <AdBanner adClient="ca-pub-XXXXXXXXXXXXXXXX" adSlot="YYYYYYYYYY" />
        <AIAssistant logs={logs} />
        <LogHistory logs={logs} onDeleteLog={deleteLog} onEditLog={handleEditLog}/>
        <div className="mt-8">
             {/* 
                IMPORTANT: Google AdSense Banner
                Replace the adClient and adSlot with your own from your AdSense account.
            */}
            <AdBanner adClient="ca-pub-XXXXXXXXXXXXXXXX" adSlot="ZZZZZZZZZZ" />
        </div>
      </main>
      <footer className="text-center py-4 text-xs text-slate-400">
        <p>Disclaimer: This app is for tracking purposes only and is not a substitute for professional medical advice.</p>
        <p>&copy; 2024 Skin & Gut Diary. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default App;