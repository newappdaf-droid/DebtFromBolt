// AI Agent Types for CollectPro Platform
// Professional AI assistant for debt collection platform support

export interface AIMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: string;
  metadata?: {
    confidence?: number;
    sources?: string[];
    suggestedActions?: SuggestedAction[];
  };
}

export interface SuggestedAction {
  id: string;
  label: string;
  action: 'navigate' | 'execute' | 'copy';
  value: string;
  icon?: string;
}

export interface AIConversation {
  id: string;
  title: string;
  messages: AIMessage[];
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface AIContext {
  userRole: string;
  currentPage?: string;
  caseId?: string;
  clientId?: string;
  permissions: string[];
}

export interface AIResponse {
  content: string;
  confidence: number;
  sources?: string[];
  suggestedActions?: SuggestedAction[];
  followUpQuestions?: string[];
}