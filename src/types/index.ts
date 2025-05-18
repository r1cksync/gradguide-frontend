export interface ChatMessage {
  role: string;
  content: string;
}

export interface CollegeEntry {
  exam: string;
  college: string;
  branch: string;
  cutoff_rank: number;
  average_placement: number; // Integer, e.g., 25
  median_placement: number; // Integer, e.g., 22
  highest_placement: number; // Integer, e.g., 60
}

export interface FilterRequest {
  exams: string[];
  ranks: Record<string, number>;
  min_average_placement?: number; // Integer
  min_median_placement?: number; // Integer
  min_highest_placement?: number; // Integer
}

export interface ChatRequest {
  messages: ChatMessage[];
  user_id: string | null;
}

export interface ChatResponse {
  response: string;
}