/**
 * Type declarations for error-handler.js
 */

export const ERROR_TYPES: {
  [key: string]: string;
};

export function handleError(error: any, errorType?: string, context?: any): {
  userMessage: string;
  technicalDetails: string;
  errorType: string;
  timestamp: number;
  context: any;
};

