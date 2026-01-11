import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { AppState, Resume, JobDescription, ATSResult, Feedback } from '../types';
import { sendMessage } from '../../shared/messaging.js';
import { MESSAGE_TYPES } from '../../shared/constants.js';
import { handleError, ERROR_TYPES } from '../../shared/error-handler.js';
import { clearAllData } from '../../shared/privacy-utils.js';

interface AppContextType {
  state: AppState;
  uploadResume: (file: File) => Promise<void>;
  setJobDescription: (text: string) => Promise<void>;
  calculateScore: () => Promise<void>;
  clearData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

type AppAction =
  | { type: 'SET_RESUME'; payload: Resume }
  | { type: 'SET_JOB_DESCRIPTION'; payload: JobDescription }
  | { type: 'SET_SCORE'; payload: ATSResult }
  | { type: 'SET_FEEDBACK'; payload: Feedback }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_DATA' };

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_RESUME':
      return { ...state, resume: action.payload, error: null };
    case 'SET_JOB_DESCRIPTION':
      return { ...state, jobDescription: action.payload, error: null };
    case 'SET_SCORE':
      return { ...state, score: action.payload, error: null };
    case 'SET_FEEDBACK':
      return { ...state, feedback: action.payload, error: null };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'CLEAR_DATA':
      return {
        resume: null,
        jobDescription: null,
        score: null,
        feedback: null,
        loading: false,
        error: null
      };
    default:
      return state;
  }
}

const initialState: AppState = {
  resume: null,
  jobDescription: null,
  score: null,
  feedback: null,
  loading: false,
  error: null
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const uploadResume = useCallback(async (file: File) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      // Process file in popup context (has window object, supports PDF.js)
      // This avoids service worker limitations with PDF.js
      const { processResumeFile } = await import('../../processors/file-processor.js');
      const result = await processResumeFile(file);

      if (result.success) {
        dispatch({ type: 'SET_RESUME', payload: result.resume });
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.error || 'Failed to process resume' });
      }
    } catch (error) {
      console.error('[AppContext] Resume processing error:', error);
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to process resume' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const setJobDescription = useCallback(async (text: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const jobDesc: JobDescription = {
        text,
        extractedAt: Date.now()
      };

      dispatch({ type: 'SET_JOB_DESCRIPTION', payload: jobDesc });

      // Process job description in background
      await sendMessage({
        type: MESSAGE_TYPES.PROCESS_JOB_DESC,
        payload: { text }
      });
    } catch (error) {
      const handledError = handleError(error, ERROR_TYPES.JOB_EXTRACTION);
      dispatch({ type: 'SET_ERROR', payload: handledError.userMessage });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const calculateScore = useCallback(async () => {
    if (!state.resume || !state.jobDescription) {
      dispatch({ type: 'SET_ERROR', payload: 'Resume and job description are required' });
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const response = await sendMessage({
        type: MESSAGE_TYPES.CALCULATE_SCORE,
        payload: {
          resume: state.resume,
          jobDescription: state.jobDescription
        }
      });

      if (response.type === MESSAGE_TYPES.SCORE_CALCULATED) {
        dispatch({ type: 'SET_SCORE', payload: response.payload });
        
        // Also get feedback
        try {
          const feedbackResponse = await sendMessage({
            type: 'GET_FEEDBACK',
            payload: {
              resumeText: state.resume.rawText,
              jobText: state.jobDescription.text,
              resume: state.resume
            }
          });

        if (feedbackResponse && feedbackResponse.type === 'FEEDBACK_GENERATED') {
          dispatch({ type: 'SET_FEEDBACK', payload: feedbackResponse.payload });
          
          // Update side panel with feedback
          try {
            chrome.runtime.sendMessage({
              type: 'SCORE_UPDATE',
              payload: {
                score: response.payload,
                feedback: feedbackResponse.payload
              }
            });
          } catch (error) {
            // Side panel might not be open, ignore
          }
        }
        } catch (error) {
          // Feedback generation is optional, don't fail if it errors
          console.warn('Failed to generate feedback:', error);
        }

        // Send update to side panel if open
        try {
          chrome.runtime.sendMessage({
            type: 'SCORE_UPDATE',
            payload: {
              score: response.payload,
              feedback: null // Will be set if feedback generation succeeds
            }
          });
        } catch (error) {
          // Side panel might not be open, ignore
        }
      } else if (response.type === MESSAGE_TYPES.SCORE_CALCULATE_ERROR) {
        dispatch({ type: 'SET_ERROR', payload: response.payload.error });
      }
    } catch (error) {
      const handledError = handleError(error, ERROR_TYPES.SCORE_CALCULATION);
      dispatch({ type: 'SET_ERROR', payload: handledError.userMessage });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.resume, state.jobDescription]);

  const clearData = useCallback(() => {
    dispatch({ type: 'CLEAR_DATA' });
    // Clear all data for privacy compliance
    clearAllData();
  }, []);

  // Auto-calculate score when both resume and job description are available
  useEffect(() => {
    if (state.resume && state.jobDescription && !state.score && !state.loading) {
      calculateScore();
    }
  }, [state.resume, state.jobDescription, state.score, state.loading, calculateScore]);

  return (
    <AppContext.Provider
      value={{
        state,
        uploadResume,
        setJobDescription,
        calculateScore,
        clearData
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

