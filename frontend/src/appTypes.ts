export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: Source[];
  reasoning?: ReasoningStep[];
  tokens?: number;
  model?: string;
}

export interface Source {
  title: string;
  page?: number;
  excerpt?: string;
}

export interface ReasoningStep {
  label: string;
  detail: string;
  status: 'complete' | 'active' | 'pending';
  duration?: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  model: string;
}
