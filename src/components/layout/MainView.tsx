import React from 'react';
import { useApp } from '../../context/AppContext';
import { useRealtimeScore } from '../../hooks/useRealtimeScore';
import ResumeUpload from '../resume/ResumeUpload';
import JobDescriptionInput from '../resume/JobDescriptionInput';
import ScoreMeter from '../scoring/ScoreMeter';
import ErrorMessage from '../ui/ErrorMessage';
import LoadingSpinner from '../ui/LoadingSpinner';
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
          {/* Error Message */}
          {displayError && <ErrorMessage message={displayError} />}

          {/* Loading Spinner */}
          {isCalculating && <LoadingSpinner />}

          {/* Resume Upload */}
          <ResumeUpload />

          {/* Job Description Input */}
          <JobDescriptionInput />

          {/* Score Meter */}
          {displayScore && displayScore.breakdown && (
            <>
              <ScoreMeter score={displayScore.overallScore} breakdown={displayScore.breakdown} />
              <PerformanceIndicator 
                duration={metrics.lastDuration} 
                isCalculating={isCalculating}
              />
            </>
          )}

          {/* Quick Actions */}
          {state.resume && state.jobDescription && !displayScore && !isCalculating && (
            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              Analyzing compatibility...
            </div>
          )}

          {/* Privacy Notice */}
          <PrivacyNotice />
        </div>
      </main>
    </div>
  );
}

