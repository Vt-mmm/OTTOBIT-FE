/**
 * Communication Types for Phaser Integration
 */

export interface MessageHandler {
  (message: any): void;
}

export interface MessageValidator {
  (message: any): boolean;
}

export interface CommunicationConfig {
  allowedOrigins: string[];
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

export interface MessageQueueItem {
  id: string;
  message: any;
  timestamp: number;
  retries: number;
  resolve: (value: any) => void;
  reject: (error: any) => void;
}

export interface CommunicationState {
  isConnected: boolean;
  isReady: boolean;
  lastMessageTime: number;
  messageCount: number;
  errorCount: number;
  queueSize: number;
}

export type MessageType =
  | "LOAD_MAP"
  | "RUN_PROGRAM"
  | "GET_STATUS"
  | "PAUSE_PROGRAM"
  | "STOP_PROGRAM"
  | "READY"
  | "VICTORY"
  | "PROGRESS"
  | "ERROR"
  | "STATUS"
  | "PROGRAM_STARTED"
  | "PROGRAM_PAUSED"
  | "PROGRAM_STOPPED";

export interface MessageEvent {
  type: MessageType;
  data: any;
  timestamp: number;
  source: string;
}
