import React, { useEffect, useState } from 'react';
import { AppState, ATSResult, Feedback } from '../popup/types';
import DetailedBreakdown from './components/DetailedBreakdown';
import FeedbackList from './components/FeedbackList';
import LoadingSpinner from '../popup/components/LoadingSpinner';

export default function SidePanelApp() {
  const [state, setState] = useState<Partial<AppState>>({
    score: null,
    feedback: null,
    loading: true
  });

  useEffect(() => {
    // Listen for score updates from popup
    const handleMessage = (message: any) => {
      if (message.type === 'SCORE_UPDATE') {
        setState({
          score: message.payload.score,
          feedback: message.payload.feedback,
          loading: false
        });
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);

    // Request current state
    chrome.runtime.sendMessage({ type: 'GET_CURRENT_STATE' })
      .then((response) => {
        if (response) {
          setState({
            score: response.score,
            feedback: response.feedback,
            loading: false
          });
        }
      })
      .catch(() => {
        setState({ loading: false });
      });

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);

  if (state.loading) {
    return (
      <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!state.score) {
    return (
      <div className="w-full min-h-screen bg-gray-50 p-6">
        <div className="text-center text-gray-500">
          <p>No analysis available</p>
          <p className="text-sm mt-2">Upload a resume and job description in the popup to see detailed analysis.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <header className="border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Detailed ATS Analysis
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Comprehensive breakdown and actionable feedback
          </p>
        </header>

        <DetailedBreakdown score={state.score} />

        {state.feedback && (
          <FeedbackList feedback={state.feedback} />
        )}
      </div>
    </div>
  );
}

