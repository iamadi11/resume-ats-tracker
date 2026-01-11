import React from 'react';
import { Feedback, FeedbackSuggestion } from '../../popup/types';

interface FeedbackListProps {
  feedback: Feedback;
}

export default function FeedbackList({ feedback }: FeedbackListProps) {
  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="card bg-gray-50">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Feedback Summary
        </h2>
        <p className="text-sm text-gray-600">{feedback.summary}</p>
        <div className="mt-4 flex space-x-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Total: </span>
            <span className="text-gray-600">{feedback.statistics.total}</span>
          </div>
          <div>
            <span className="font-medium text-error-600">Critical: </span>
            <span className="text-gray-600">{feedback.statistics.critical}</span>
          </div>
          <div>
            <span className="font-medium text-warning-600">Warnings: </span>
            <span className="text-gray-600">{feedback.statistics.warning}</span>
          </div>
          <div>
            <span className="font-medium text-primary-600">Improvements: </span>
            <span className="text-gray-600">{feedback.statistics.improvement}</span>
          </div>
        </div>
      </div>

      {/* Critical Issues */}
      {feedback.bySeverity.critical.length > 0 && (
        <FeedbackSection
          title="Critical Issues"
          severity="critical"
          suggestions={feedback.bySeverity.critical}
        />
      )}

      {/* Warnings */}
      {feedback.bySeverity.warning.length > 0 && (
        <FeedbackSection
          title="Warnings"
          severity="warning"
          suggestions={feedback.bySeverity.warning}
        />
      )}

      {/* Improvements */}
      {feedback.bySeverity.improvement.length > 0 && (
        <FeedbackSection
          title="Improvements"
          severity="improvement"
          suggestions={feedback.bySeverity.improvement}
        />
      )}
    </div>
  );
}

interface FeedbackSectionProps {
  title: string;
  severity: 'critical' | 'warning' | 'improvement';
  suggestions: FeedbackSuggestion[];
}

function FeedbackSection({ title, severity, suggestions }: FeedbackSectionProps) {
  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'critical':
        return {
          border: 'border-error-200',
          bg: 'bg-error-50',
          icon: 'text-error-600',
          title: 'text-error-900'
        };
      case 'warning':
        return {
          border: 'border-warning-200',
          bg: 'bg-warning-50',
          icon: 'text-warning-600',
          title: 'text-warning-900'
        };
      default:
        return {
          border: 'border-primary-200',
          bg: 'bg-primary-50',
          icon: 'text-primary-600',
          title: 'text-primary-900'
        };
    }
  };

  const styles = getSeverityStyles(severity);

  return (
    <div className={`card border-2 ${styles.border} ${styles.bg}`}>
      <h3 className={`text-lg font-semibold ${styles.title} mb-4 flex items-center space-x-2`}>
        <SeverityIcon severity={severity} className={styles.icon} />
        <span>{title}</span>
        <span className="text-sm font-normal text-gray-600">
          ({suggestions.length})
        </span>
      </h3>

      <div className="space-y-4">
        {suggestions.map((suggestion, index) => (
          <FeedbackItem key={index} suggestion={suggestion} />
        ))}
      </div>
    </div>
  );
}

interface FeedbackItemProps {
  suggestion: FeedbackSuggestion;
}

function FeedbackItem({ suggestion }: FeedbackItemProps) {
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <h4 className="font-medium text-gray-900 mb-2">{suggestion.title}</h4>
      <p className="text-sm text-gray-600 mb-3">{suggestion.message}</p>
      <div className="bg-gray-50 rounded p-3">
        <p className="text-sm text-gray-800 font-medium mb-1">Suggestion:</p>
        <p className="text-sm text-gray-700">{suggestion.suggestion}</p>
      </div>
      {suggestion.keywords && (
        <div className="mt-3 flex flex-wrap gap-2">
          {suggestion.keywords.slice(0, 5).map((keyword, idx) => (
            <span
              key={idx}
              className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded"
            >
              {keyword}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

interface SeverityIconProps {
  severity: string;
  className: string;
}

function SeverityIcon({ severity, className }: SeverityIconProps) {
  if (severity === 'critical') {
    return (
      <svg className={`w-5 h-5 ${className}`} fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clipRule="evenodd"
        />
      </svg>
    );
  }

  if (severity === 'warning') {
    return (
      <svg className={`w-5 h-5 ${className}`} fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
    );
  }

  return (
    <svg className={`w-5 h-5 ${className}`} fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
        clipRule="evenodd"
        />
    </svg>
  );
}

