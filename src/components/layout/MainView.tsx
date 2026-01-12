import React from 'react';
import { useApp } from '../../context/AppContext';
import { useRealtimeScore } from '../../hooks/useRealtimeScore';
import ResumeUpload from '../resume/ResumeUpload';
import JobDescriptionInput from '../resume/JobDescriptionInput';
import JobRoleSelector from '../resume/JobRoleSelector';
import ScoreMeter from '../scoring/ScoreMeter';
import FeedbackSuggestions from '../scoring/FeedbackSuggestions';
import ErrorMessage from '../ui/ErrorMessage';
import LoadingSpinner from '../ui/LoadingSpinner';
import ProgressBar from '../ui/ProgressBar';
import PerformanceIndicator from '../ui/PerformanceIndicator';
import PrivacyNotice from '../ui/PrivacyNotice';
import Header from './Header';

export default function MainView() {
  const { state } = useApp();
  
  // Real-time score calculation with debouncing
  const { 
    score: realtimeScore, 
    isCalculating: isRealtimeCalculating,
    metrics = { lastDuration: 0 },
    error: realtimeError
  } = useRealtimeScore({
    debounceDelay: 500,
    minTextLength: 50,
    enabled: true,
    onScoreUpdate: (score) => {
      // Score updates handled by context
    }
  });

  // Use realtime score if available, otherwise use context score
  const displayScore = realtimeScore || state.score;
  const isCalculating = isRealtimeCalculating || state.loading;
  const displayError = realtimeError || state.error;

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Error Message - Always show errors prominently */}
          {displayError && (
            <ErrorMessage message={displayError} />
          )}

          {/* Resume Upload */}
          <ResumeUpload />

          {/* Job Role Selector - Primary method: Select role, experience, and tech stack */}
          <JobRoleSelector />

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                OR
              </span>
            </div>
          </div>

          {/* Job Description Input - Alternative method: Paste URL */}
          <JobDescriptionInput />

          {/* Progress Bar - shows during analysis instead of results */}
          {state.progress && state.loading && state.resume && state.jobDescription && (
            <ProgressBar
              progress={state.progress.progress}
              currentStep={state.progress.currentStep}
              steps={state.progress.steps}
            />
          )}

          {/* Score Meter - only show when analysis is complete and not loading */}
          {displayScore && displayScore.breakdown && !state.loading && !state.progress && (
            <>
              <ScoreMeter score={displayScore.overallScore} breakdown={displayScore.breakdown} />
              <PerformanceIndicator 
                duration={metrics.lastDuration} 
                isCalculating={isCalculating}
              />
            </>
          )}

          {/* Feedback Suggestions - show improvement suggestions */}
          {state.feedback && !state.loading && !state.progress && (
            <FeedbackSuggestions feedback={state.feedback} />
          )}

          {/* Waiting state - when resume and job are ready but analysis hasn't started */}
          {state.resume && state.jobDescription && !displayScore && !isCalculating && !state.progress && (
            <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">
              Ready to analyze. Analysis will start automatically...
            </div>
          )}

          {/* Privacy Notice */}
          <PrivacyNotice />
        </div>
      </main>
    </div>
  );
}

