export interface Task {
  id: string;
  title: string;
  deadline: string;
  complexity: 'low' | 'medium' | 'high';
  completed: boolean;
  dailyGoals: string[];
}

export interface StressEntry {
  id: string;
  level: number; // 1-5
  timestamp: string;
  note?: string;
}

export interface UserStats {
  points: number;
  streak: number;
  focusMinutes: number;
}

export interface ChatMessage {
  id: string;
  room: string;
  text: string;
  user: string;
  timestamp: string;
}
