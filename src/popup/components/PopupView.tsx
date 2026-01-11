import React from 'react';
import { useApp } from '../context/AppContext';
import ResumeUpload from './ResumeUpload';
import JobDescriptionInput from './JobDescriptionInput';
import ScoreMeter from './ScoreMeter';
import ErrorMessage from './ErrorMessage';
import LoadingSpinner from './LoadingSpinner';
import ViewDetailsButton from './ViewDetailsButton';

export default function PopupView() {
  const { state } = useApp();

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
      {state.error && <ErrorMessage message={state.error} />}

      {/* Loading Spinner */}
      {state.loading && <LoadingSpinner />}

      {/* Resume Upload */}
      <ResumeUpload />

      {/* Job Description Input */}
      <JobDescriptionInput />

      {/* Score Meter */}
      {state.score && (
        <>
          <ScoreMeter score={state.score.overallScore} breakdown={state.score.breakdown} />
          <ViewDetailsButton />
        </>
      )}

      {/* Quick Actions */}
      {state.resume && state.jobDescription && !state.score && !state.loading && (
        <div className="text-center text-sm text-gray-500">
          Analyzing compatibility...
        </div>
      )}
    </div>
  );
}

