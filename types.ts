export interface LogEntry {
  id: string;
  date: string;
  food: string;
  water: number; // in glasses
  skinReaction: string;
  skinRating: number; // 1-5
  photo?: string; // base64 encoded string
  supplements?: string;
  intakeTime?: string; // e.g., "13:30"
  reactionTime?: string; // e.g., "18:00"
}

export interface InsightSections {
  foodCorrelations: string;
  supplementCorrelations: string;
  timingAnalysis: string;
  waterAnalysis: string;
  summary: string;
}