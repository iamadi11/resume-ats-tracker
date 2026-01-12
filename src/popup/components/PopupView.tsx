import React from 'react';
import { useApp } from '../context/AppContext';
import { useRealtimeScore } from '../hooks/useRealtimeScore';
import ResumeUpload from './ResumeUpload';
import JobDescriptionInput from './JobDescriptionInput';
import ScoreMeter from './ScoreMeter';
import ErrorMessage from './ErrorMessage';
import LoadingSpinner from './LoadingSpinner';
import ViewDetailsButton from './ViewDetailsButton';
import PerformanceIndicator from './PerformanceIndicator';
import PrivacyNotice from './PrivacyNotice';

export default function PopupView() {
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
      // Update context state when score is calculated
      // This ensures side panel gets updates
    }
  });

  // Use realtime score if available, otherwise use context score
  const displayScore = realtimeScore || state.score;
  const isCalculating = isRealtimeCalculating || state.loading;
  const displayError = realtimeError || state.error;

  return (
    <div className="w-full min-h-[500px] p-4 space-y-4">
      {/* Header */}
      <header className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Resume ATS Tracker
        </h1>
        <p className="text-sm text-gray-600">
          Optimize your resume for ATS compatibility
        </p>
      </header>

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
          <ViewDetailsButton />
        </>
      )}

      {/* Quick Actions */}
      {state.resume && state.jobDescription && !displayScore && !isCalculating && (
        <div className="text-center text-sm text-gray-500">
          Analyzing compatibility...
        </div>
      )}

      {/* Privacy Notice */}
      <PrivacyNotice />
    </div>
  );
}

