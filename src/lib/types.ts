export interface ChatMessage {
  role: string;
  content: string;
}

export interface ChatResponse {
  response: string;
}

export interface SessionInfo {
  session_id: string;
  created_at: string;
  last_message?: string;
  last_updated: string;
}

export interface SessionsResponse {
  sessions: SessionInfo[];
}

export interface MessagesResponse {
  messages: ChatMessage[];
}

export interface FilterRequest {
  exams: string[];
  ranks: { [key: string]: number };
  min_average_placement?: number;
  min_median_placement?: number;
  min_highest_placement?: number;
  sort_by?: string; // cutoff_rank_asc, average_placement_desc, median_placement_desc, highest_placement_desc
}

export interface CollegeEntry {
  exam: string;
  college: string;
  branch: string;
  cutoff_rank: number;
  average_placement?: number;
  median_placement?: number;
  highest_placement?: number;
}