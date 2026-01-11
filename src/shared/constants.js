/**
 * Extension-wide constants
 */

// Message types for communication between extension components
export const MESSAGE_TYPES = {
  // Resume processing
  PROCESS_RESUME: 'PROCESS_RESUME',
  RESUME_PROCESSED: 'RESUME_PROCESSED',
  RESUME_PROCESS_ERROR: 'RESUME_PROCESS_ERROR',
  
  // Job description processing
  PROCESS_JOB_DESC: 'PROCESS_JOB_DESC',
  JOB_EXTRACTED: 'JOB_EXTRACTED',
  JOB_PROCESSED: 'JOB_PROCESSED',
  JOB_PROCESS_ERROR: 'JOB_PROCESS_ERROR',
  
  // Scoring
  CALCULATE_SCORE: 'CALCULATE_SCORE',
  SCORE_CALCULATED: 'SCORE_CALCULATED',
  SCORE_CALCULATE_ERROR: 'SCORE_CALCULATE_ERROR',
  
  // Content script communication
  EXTRACT_JOB_FROM_PAGE: 'EXTRACT_JOB_FROM_PAGE',
  INJECT_WIDGET: 'INJECT_WIDGET',
  REMOVE_WIDGET: 'REMOVE_WIDGET',
  
  // General
  PING: 'PING',
  PONG: 'PONG',
  ERROR: 'ERROR'
};

// Storage keys
export const STORAGE_KEYS = {
  SESSION_RESUME: 'session:resume',
  SESSION_JOB: 'session:job',
  SESSION_SCORE: 'session:score',
  SETTINGS: 'settings'
};

// Supported file types
export const FILE_TYPES = {
  PDF: 'application/pdf',
  DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  TEXT: 'text/plain'
};

// Content script context identifier
export const CONTENT_SCRIPT_ID = 'resume-ats-tracker-content';

