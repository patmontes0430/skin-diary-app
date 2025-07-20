import type { FC } from 'react';
import { LogEntry } from '../types';
import LogItem from './LogItem';

interface LogHistoryProps {
  logs: LogEntry[];
  onDeleteLog: (id: string) => void;
  onEditLog: (log: LogEntry) => void;
}

const LogHistory: FC<LogHistoryProps> = ({ logs, onDeleteLog, onEditLog }) => {
  if (logs.length === 0) {
    return (
      <div className="text-center py-12 px-4 bg-white rounded-lg shadow-md">
        <i className="fa-solid fa-book-open text-4xl text-slate-400 mb-4"></i>
        <h3 className="text-xl font-semibold text-slate-700">No Logs Yet</h3>
        <p className="text-slate-500 mt-2">Start by adding a new log to track your progress.</p>
      </div>
    );
  }

  const sortedLogs = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
       <h2 className="text-2xl font-bold text-slate-800 pb-2 border-b-2 border-teal-200">Log History</h2>
      {sortedLogs.map((log) => (
        <LogItem key={log.id} log={log} onDelete={onDeleteLog} onEdit={onEditLog} />
      ))}
    </div>
  );
};

export default LogHistory;