export type AIIntentHint = 'PLAN_DAY' | 'ANALYZE_EXPENSE' | 'SUMMARIZE_NOTE' | 'GENERAL_CHAT';

export interface AIMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  imageUri?: string;
  intent?: AIIntentHint;
  isStreaming?: boolean;
}

export interface PromptPayload {
  prompt?: string;
  audioBase64?: string;
  imageUri?: string;
  intentHint?: AIIntentHint;
}

export interface AIUsageMetrics {
  promptTokens: number;
  completionTokens: number;
  latencyMs: number;
  model: string;
}
