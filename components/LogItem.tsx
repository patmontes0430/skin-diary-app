import React from 'react';
import { LogEntry } from '../types';

interface LogItemProps {
  log: LogEntry;
  onDelete: (id: string) => void;
  onEdit: (log: LogEntry) => void;
}

const StaticStarRating: React.FC<{ rating: number }> = ({ rating }) => {
  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <i
          key={star}
          className={`fa-solid fa-star ${
            star <= rating ? 'text-yellow-400' : 'text-gray-300'
          }`}
        />
      ))}
       <span className="text-xs text-slate-500 ml-2">({rating}/5)</span>
    </div>
  );
};

const LogItem: React.FC<LogItemProps> = ({ log, onDelete, onEdit }) => {
  const formattedDate = new Date(log.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });

  const formatTime = (timeString?: string): string => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="bg-slate-100 p-4 border-b border-slate-200 flex justify-between items-center">
        <div>
            <h3 className="font-bold text-lg text-slate-800">{formattedDate}</h3>
            <StaticStarRating rating={log.skinRating} />
        </div>
        <div className="flex items-center space-x-4">
             <button onClick={() => onEdit(log)} className="text-slate-400 hover:text-teal-500 transition-colors">
                <i className="fas fa-pencil-alt"></i>
            </button>
             <button onClick={() => onDelete(log.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                <i className="fas fa-trash-alt"></i>
            </button>
        </div>
      </div>

      <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-teal-600 flex items-center"><i className="fa-solid fa-utensils mr-2"></i>Food Eaten</h4>
            <p className="text-slate-700 whitespace-pre-wrap mt-1">{log.food || 'Not logged'}</p>
          </div>
          {log.supplements && (
            <div>
              <h4 className="font-semibold text-teal-600 flex items-center"><i className="fa-solid fa-pills mr-2"></i>Supplements / Medicine</h4>
              <p className="text-slate-700 whitespace-pre-wrap mt-1">{log.supplements}</p>
            </div>
          )}
           {log.intakeTime && (
            <div>
              <h4 className="font-semibold text-teal-600 flex items-center"><i className="fa-regular fa-clock mr-2"></i>Intake Time</h4>
              <p className="text-slate-700 mt-1">{formatTime(log.intakeTime)}</p>
            </div>
          )}
          <div>
            <h4 className="font-semibold text-teal-600 flex items-center"><i className="fa-solid fa-droplet mr-2"></i>Water Intake</h4>
            <p className="text-slate-700 mt-1">{log.water} glasses</p>
          </div>
        </div>

        <div className="space-y-4">
            <div>
                <h4 className="font-semibold text-teal-600 flex items-center"><i className="fa-solid fa-notes-medical mr-2"></i>Skin Notes</h4>
                <p className="text-slate-700 whitespace-pre-wrap mt-1">{log.skinReaction}</p>
            </div>
            {log.reactionTime && (
            <div>
              <h4 className="font-semibold text-teal-600 flex items-center"><i className="fa-regular fa-clock mr-2"></i>Reaction Time</h4>
              <p className="text-slate-700 mt-1">{formatTime(log.reactionTime)}</p>
            </div>
          )}
            {log.photo && (
            <div>
              <h4 className="font-semibold text-teal-600 flex items-center"><i className="fa-solid fa-camera mr-2"></i>Photo</h4>
              <img src={log.photo} alt={`Skin condition on ${formattedDate}`} className="mt-2 rounded-lg max-h-48 w-auto cursor-pointer" onClick={() => window.open(log.photo)}/>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogItem;