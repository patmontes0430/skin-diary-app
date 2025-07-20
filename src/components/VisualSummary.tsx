import { useState, FC } from 'react';
import { LogEntry } from '../types';

interface VisualSummaryProps {
  logs: LogEntry[];
}

const VisualSummary: FC<VisualSummaryProps> = ({ logs }) => {
  if (logs.length < 2) {
    return null; // Don't show the summary if there isn't enough data to plot
  }

  const sortedLogs = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const totalLogs = logs.length;
  const avgRating = (logs.reduce((sum, log) => sum + log.skinRating, 0) / totalLogs).toFixed(1);

  const width = 500;
  const height = 150;
  const padding = 20;
  const yAxisLabels = [1, 2, 3, 4, 5];
  
  const points = sortedLogs.map((log, i) => {
    const x = padding + (sortedLogs.length > 1 ? i * (width - 2 * padding) / (sortedLogs.length - 1) : (width - 2 * padding) / 2);
    const y = height - padding - ((log.skinRating - 1) / 4) * (height - 2 * padding);
    return { x, y, log };
  });

  const pathD = points.map((p, i) => (i === 0 ? 'M' : 'L') + `${p.x} ${p.y}`).join(' ');

  const [tooltip, setTooltip] = useState<{ x: number; y: number; log: LogEntry } | null>(null);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg my-8">
      <h2 className="text-2xl font-bold text-slate-800 mb-4">Your Progress At a Glance</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="space-y-3">
            <div className="flex items-center bg-slate-50 p-3 rounded-lg">
                <i className="fa-solid fa-calendar-check text-2xl text-teal-500 mr-4 w-8 text-center"></i>
                <div>
                    <div className="font-bold text-slate-700">{totalLogs} Days Tracked</div>
                    <p className="text-sm text-slate-500">Keep up the great work!</p>
                </div>
            </div>
             <div className="flex items-center bg-slate-50 p-3 rounded-lg">
                <i className="fa-solid fa-star-half-stroke text-2xl text-yellow-400 mr-4 w-8 text-center"></i>
                <div>
                    <div className="font-bold text-slate-700">Avg. {avgRating} / 5 Skin Rating</div>
                    <p className="text-sm text-slate-500">Tracking trends over time.</p>
                </div>
            </div>
        </div>
        
        <div className="relative">
          <h3 className="font-semibold text-slate-700 mb-2 text-center">Skin Rating Over Time</h3>
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" onMouseLeave={() => setTooltip(null)}>
            {yAxisLabels.map(label => {
                const y = height - padding - ((label - 1) / 4) * (height - 2 * padding);
                return <line key={label} x1={padding} y1={y} x2={width - padding} y2={y} stroke="#e2e8f0" strokeDasharray="2,2" />;
            })}

            <path d={pathD} fill="none" stroke="#2dd4bf" strokeWidth="2" />
            
            {points.map((p) => (
              <g key={p.log.id} onMouseEnter={() => setTooltip(p)}>
                <circle cx={p.x} cy={p.y} r="8" fill="transparent" />
                <circle cx={p.x} cy={p.y} r="3" fill="#14b8a6" className="pointer-events-none" />
              </g>
            ))}
          </svg>
          {tooltip && (
            <div
              className="absolute bg-slate-800 text-white text-xs rounded py-1 px-2 pointer-events-none transform -translate-x-1/2 -translate-y-full z-10"
              style={{ left: tooltip.x, top: tooltip.y - 8 }}
            >
              <div>{new Date(tooltip.log.date).toLocaleDateString('en-CA', {timeZone: 'UTC'})}</div>
              <div>Rating: {tooltip.log.skinRating}/5</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisualSummary;