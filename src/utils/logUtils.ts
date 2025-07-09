import { LogEntry } from '../types';

/**
 * Consolidates multiple log entries for the same day into a single summary entry.
 * - Food, supplements, and skin reactions are concatenated.
 * - Water intake is summed.
 * - Skin rating is averaged.
 * - The last photo of the day is kept.
 * @param logs - An array of raw LogEntry objects.
 * @returns A new array of LogEntry objects, with one entry per date.
 */
export const consolidateLogsByDate = (logs: LogEntry[]): LogEntry[] => {
  if (!logs || logs.length === 0) {
    return [];
  }

  // 1. Group logs by date string (YYYY-MM-DD)
  const groupedByDate = logs.reduce<Record<string, LogEntry[]>>((acc, log) => {
    const dateKey = log.date;
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(log);
    return acc;
  }, {});

  // 2. Process each group into a single consolidated log
  const consolidated = Object.values(groupedByDate).map(dailyLogs => {
    // Sort logs within the day by time to handle them chronologically
    dailyLogs.sort((a, b) => {
      const timeA = a.intakeTime || '00:00';
      const timeB = b.intakeTime || '00:00';
      return timeA.localeCompare(timeB);
    });

    // Combine text fields with a separator for readability
    const food = dailyLogs.map(l => l.food.trim()).filter(Boolean).join('; ');
    const supplements = dailyLogs.map(l => l.supplements?.trim()).filter(Boolean).join('; ');
    const skinReaction = dailyLogs.map(l => l.skinReaction.trim()).filter(Boolean).join('; ');
    
    // Sum numerical fields
    const water = dailyLogs.reduce((sum, l) => sum + l.water, 0);
    
    // Average the skin rating and round to nearest whole number
    const totalRating = dailyLogs.reduce((sum, l) => sum + l.skinRating, 0);
    const skinRating = Math.round(totalRating / dailyLogs.length);
    
    // Find the last log entry of the day that has a photo
    const lastLogWithPhoto = [...dailyLogs].reverse().find(l => l.photo);

    const firstLog = dailyLogs[0];

    return {
      id: firstLog.date, // Use the date as a stable ID for the consolidated entry
      date: firstLog.date,
      food,
      water,
      skinReaction,
      skinRating,
      photo: lastLogWithPhoto?.photo,
      supplements,
      // Combine timing fields for context, could be useful for AI
      intakeTime: dailyLogs.map(l => l.intakeTime).filter(Boolean).join(', '),
      reactionTime: dailyLogs.map(l => l.reactionTime).filter(Boolean).join(', '),
    };
  });

  return consolidated;
};
