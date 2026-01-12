import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import { AppState, Resume, JobDescription, ATSResult, Feedback, AnalysisProgress } from '../types';
import { processResumeFile } from '../processors/file-processor';
import { workerManager } from '../utils/worker-manager';
import { generateFeedback } from '../scoring/feedback/feedback-engine';

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
  | { type: 'SET_PROGRESS'; payload: AnalysisProgress | null }
  | { type: 'CLEAR_DATA' };

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_RESUME':
      return { ...state, resume: action.payload, error: null };
    case 'SET_JOB_DESCRIPTION':
      return { ...state, jobDescription: action.payload, error: null };
    case 'SET_SCORE':
      return { ...state, score: action.payload, error: null, progress: null };
    case 'SET_FEEDBACK':
      return { ...state, feedback: action.payload, error: null };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false, progress: null };
    case 'SET_PROGRESS':
      return { ...state, progress: action.payload };
    case 'CLEAR_DATA':
      return {
        resume: null,
        jobDescription: null,
        score: null,
        feedback: null,
        loading: false,
        error: null,
        progress: null
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
  error: null,
  progress: null
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const uploadResume = useCallback(async (file: File) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

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

  const setJobDescription = useCallback(async (input: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      let jobText = input;
      let jobTitle: string | undefined;
      let company: string | undefined;

      // Check if input is a URL
      const { isUrl, fetchJobDescription } = await import('../utils/job-description-fetcher');
      
      if (isUrl(input.trim())) {
        // Fetch job description from URL
        const result = await fetchJobDescription(input.trim());
        
        if (!result.success) {
          dispatch({ type: 'SET_ERROR', payload: result.error || 'Failed to fetch job description from URL' });
          return;
        }
        
        jobText = result.text || input;
        jobTitle = result.title;
        company = result.company;
      }

      const jobDesc: JobDescription = {
        text: jobText,
        title: jobTitle,
        company: company,
        extractedAt: Date.now()
      };

      dispatch({ type: 'SET_JOB_DESCRIPTION', payload: jobDesc });
    } catch (error) {
      console.error('[AppContext] Job description error:', error);
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to set job description' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const calculateScore = useCallback(async () => {
    if (!state.resume || !state.jobDescription) {
      dispatch({ type: 'SET_ERROR', payload: 'Resume and job description are required' });
      return;
    }

    const steps = [
      { label: 'Initializing analysis', completed: false },
      { label: 'Extracting keywords', completed: false },
      { label: 'Matching skills', completed: false },
      { label: 'Checking formatting', completed: false },
      { label: 'Analyzing impact metrics', completed: false },
      { label: 'Evaluating readability', completed: false },
      { label: 'Calculating final score', completed: false },
      { label: 'Generating feedback', completed: false }
    ];

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      // Initialize progress
      dispatch({ 
        type: 'SET_PROGRESS', 
        payload: { 
          currentStep: steps[0].label, 
          progress: 5, 
          steps: steps.map(s => ({ ...s })) 
        } 
      });

      // Initialize worker if needed
      if (!workerManager.isAvailable()) {
        workerManager.initialize();
      }

      // Update progress: Initializing
      dispatch({ 
        type: 'SET_PROGRESS', 
        payload: { 
          currentStep: steps[0].label, 
          progress: 10, 
          steps: steps.map((s, i) => ({ ...s, completed: i === 0 })) 
        } 
      });

      // Simulate progress updates during calculation
      let currentProgress = 10;
      let currentStepIndex = 0;
      
      progressIntervalRef.current = setInterval(() => {
        currentProgress = Math.min(90, currentProgress + 8);
        
        // Move to next step based on progress
        const targetStepIndex = Math.floor((currentProgress / 90) * (steps.length - 1));
        if (targetStepIndex > currentStepIndex && targetStepIndex < steps.length) {
          currentStepIndex = targetStepIndex;
        }
        
        const updatedSteps = steps.map((s, i) => ({ 
          ...s, 
          completed: i < currentStepIndex 
        }));
        
        dispatch({ 
          type: 'SET_PROGRESS', 
          payload: { 
            currentStep: steps[currentStepIndex].label, 
            progress: currentProgress, 
            steps: updatedSteps 
          } 
        });
      }, 600);

      // Calculate score using worker
      dispatch({ 
        type: 'SET_PROGRESS', 
        payload: { 
          currentStep: steps[1].label, 
          progress: 20, 
          steps: steps.map((s, i) => ({ ...s, completed: i < 2 })) 
        } 
      });

      const response = await workerManager.sendMessage('CALCULATE_SCORE', {
        resumeText: state.resume.rawText,
        jobText: state.jobDescription.text,
        resume: state.resume
      });

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }

      // Update progress: Score calculated
      dispatch({ 
        type: 'SET_PROGRESS', 
        payload: { 
          currentStep: steps[6].label, 
          progress: 85, 
          steps: steps.map((s, i) => ({ ...s, completed: i < 7 })) 
        } 
      });

      if (response.payload) {
        dispatch({ type: 'SET_SCORE', payload: response.payload });
        
        // Generate feedback
        dispatch({ 
          type: 'SET_PROGRESS', 
          payload: { 
            currentStep: steps[7].label, 
            progress: 95, 
            steps: steps.map((s, i) => ({ ...s, completed: i < 8 })) 
          } 
        });

        try {
          const feedback = generateFeedback(
            state.resume.rawText,
            state.jobDescription.text,
            state.resume
          ) as Feedback;
          dispatch({ type: 'SET_FEEDBACK', payload: feedback });
        } catch (error) {
          // Feedback generation is optional, don't fail if it errors
          console.warn('Failed to generate feedback:', error);
        }

        // Complete progress
        dispatch({ 
          type: 'SET_PROGRESS', 
          payload: { 
            currentStep: 'Analysis complete', 
            progress: 100, 
            steps: steps.map(s => ({ ...s, completed: true })) 
          } 
        });

        // Clear progress after a brief moment
        setTimeout(() => {
          dispatch({ type: 'SET_PROGRESS', payload: null });
        }, 500);
      }
    } catch (error) {
      console.error('[AppContext] Score calculation error:', error);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to calculate score' });
      dispatch({ type: 'SET_PROGRESS', payload: null });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.resume, state.jobDescription]);

  const clearData = useCallback(() => {
    dispatch({ type: 'CLEAR_DATA' });
    // Clear localStorage if needed
    try {
      localStorage.removeItem('resume-ats-tracker-resume');
      localStorage.removeItem('resume-ats-tracker-job');
      localStorage.removeItem('resume-ats-tracker-score');
    } catch (error) {
      // Ignore localStorage errors
    }
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
