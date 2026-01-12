/**
 * Worker Utilities
 * 
 * Helper functions for worker communication and management
 */

export interface WorkerMessage {
  type: string;
  id: string;
  payload?: any;
  error?: string;
  performance?: {
    duration: number;
    timestamp: number;
  };
}

export function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function createWorker(url: string): Worker {
  return new Worker(new URL(url, import.meta.url), { type: 'module' });
}

