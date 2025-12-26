
export interface UserProfile {
  id: string;
  username: string;
  role: 'admin' | 'user';
  points: number;
  word_count: number;
  avatar_url?: string; // Optional URL or string identifier for an avatar
  created_at?: string;
}

export interface Word {
  id: string;
  user_id: string;
  english: string;
  turkish: string;
  example_sentence?: string;
  example_turkish?: string; // New field for translated example
  status: 'new' | 'learning' | 'mastered';
  created_at: string;
}

// Joined type for activity feed
export interface RecentWord extends Word {
  profiles: {
    username: string;
    avatar_url: string;
  }
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface AIWordAnalysis {
  turkish: string;
  definition: string;
  example: string;
  example_turkish: string; // New field
}

export type ViewState = 'login' | 'dashboard' | 'words' | 'study' | 'admin';
