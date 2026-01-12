import React from 'react';
import { useApp } from '../../popup/context/AppContext';
import { useRealtimeScore } from '../../popup/hooks/useRealtimeScore';
import ResumeUpload from '../../popup/components/ResumeUpload';
import JobDescriptionInput from '../../popup/components/JobDescriptionInput';
import ScoreMeter from '../../popup/components/ScoreMeter';
import ErrorMessage from '../../popup/components/ErrorMessage';
import LoadingSpinner from '../../popup/components/LoadingSpinner';
import ViewDetailsButton from '../../popup/components/ViewDetailsButton';
import PerformanceIndicator from '../../popup/components/PerformanceIndicator';
import PrivacyNotice from '../../popup/components/PrivacyNotice';

interface DrawerViewProps {
  isMinimized: boolean;
  onToggleMinimize: () => void;
  onClose?: () => void;
}

export default function DrawerView({ isMinimized, onToggleMinimize, onClose }: DrawerViewProps) {
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
    }
  });

  // Use realtime score if available, otherwise use context score
  const displayScore = realtimeScore || state.score;
  const isCalculating = isRealtimeCalculating || state.loading;
  const displayError = realtimeError || state.error;

  if (isMinimized) {
    return (
      <div className="ats-drawer-minimized">
        <div className="ats-drawer-minimized-header">
          <button
            onClick={onToggleMinimize}
            className="ats-drawer-button"
            aria-label="Expand drawer"
            title="Expand Resume ATS Tracker"
          >
            <svg className="ats-drawer-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <span className="ats-drawer-title-minimized">ATS Tracker</span>
        </div>
      </div>
    );
  }

  return (
    <div className="ats-drawer">
      {/* Header with controls */}
      <div className="ats-drawer-header">
        <div className="ats-drawer-header-content">
          <h2 className="ats-drawer-title">Resume ATS Tracker</h2>
          <div className="ats-drawer-controls">
            <button
              onClick={onToggleMinimize}
              className="ats-drawer-button"
              aria-label="Minimize drawer"
              title="Minimize to sidebar"
            >
              <svg className="ats-drawer-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="ats-drawer-button"
                aria-label="Close drawer"
                title="Close drawer"
              >
                <svg className="ats-drawer-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="ats-drawer-content">
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
    </div>
  );
}

