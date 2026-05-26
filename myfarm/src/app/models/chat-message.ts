export interface ChatMessage {
  id?: string;
  senderId: number;
  receiverId: number;
  content: string;
  timestamp?: Date;
}
