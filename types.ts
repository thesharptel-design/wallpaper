export interface GeneratedImage {
  id: string;
  url: string; // Base64 data URL
  prompt: string;
  createdAt: number;
}

export interface ApiKeyConfig {
  key: string;
  isValid: boolean;
}

export enum AppState {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS',
}