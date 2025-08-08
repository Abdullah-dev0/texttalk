// Simple message type for our chat application
export interface ChatMessage {
  id: string;
  text: string;
  isUserMessage: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: string | null;
  fileId: string;
}

export interface MessageLoadingStates {
  summarize?: boolean;
  paraphrase?: boolean;
  translate?: boolean;
}

export interface MessageUpdate {
  type: 'summarize' | 'paraphrase';
  content: string;
}
