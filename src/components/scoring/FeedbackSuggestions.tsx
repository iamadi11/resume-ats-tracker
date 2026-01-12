import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, AlertTriangle, Lightbulb, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import { Feedback } from '../../types';

interface FeedbackSuggestionsProps {
  feedback: Feedback;
}

export default function FeedbackSuggestions({ feedback }: FeedbackSuggestionsProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    critical: true,
    warning: true,
    improvement: true
  });

  const toggleSection = (severity: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [severity]: !prev[severity]
    }));
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="w-5 h-5 text-error-600 dark:text-error-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-warning-600 dark:text-warning-400" />;
      case 'improvement':
        return <Lightbulb className="w-5 h-5 text-primary-600 dark:text-primary-400" />;
      default:
        return null;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-error-200 dark:border-error-800 bg-error-50 dark:bg-error-900/20';
      case 'warning':
        return 'border-warning-200 dark:border-warning-800 bg-warning-50 dark:bg-warning-900/20';
      case 'improvement':
        return 'border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/20';
      default:
        return 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const getSeverityTextColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-error-800 dark:text-error-200';
      case 'warning':
        return 'text-warning-800 dark:text-warning-200';
      case 'improvement':
        return 'text-primary-800 dark:text-primary-200';
      default:
        return 'text-gray-800 dark:text-gray-200';
    }
  };

  const renderSuggestion = (suggestion: any, index: number) => {
    return (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-3"
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {suggestion.severity === 'critical' && (
              <AlertCircle className="w-5 h-5 text-error-600 dark:text-error-400" />
            )}
            {suggestion.severity === 'warning' && (
              <AlertTriangle className="w-5 h-5 text-warning-600 dark:text-warning-400" />
            )}
            {suggestion.severity === 'improvement' && (
              <Lightbulb className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            )}
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
              {suggestion.title}
            </h4>
            {suggestion.message && (
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                {suggestion.message}
              </p>
            )}
            <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                💡 Suggestion:
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {suggestion.suggestion}
              </p>
            </div>
            {/* Show category-specific details */}
            {suggestion.keywords && suggestion.keywords.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Missing Keywords:
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestion.keywords.slice(0, 10).map((keyword: any, idx: number) => {
                    // Handle both string and object formats
                    const keywordText = typeof keyword === 'string' ? keyword : (keyword.term || keyword.keyword || keyword);
                    return (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                      >
                        {keywordText}
                      </span>
                    );
                  })}
                  {suggestion.keywords.length > 10 && (
                    <span className="px-2 py-1 text-gray-500 dark:text-gray-400 text-xs">
                      +{suggestion.keywords.length - 10} more
                    </span>
                  )}
                </div>
              </div>
            )}
            {/* Show weak verbs if available */}
            {suggestion.weakVerbs && suggestion.weakVerbs.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Weak Verbs Found:
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestion.weakVerbs.slice(0, 8).map((verb: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-warning-100 dark:bg-warning-900/30 text-warning-700 dark:text-warning-300 rounded text-xs"
                    >
                      {verb}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {suggestion.mediumVerbs && suggestion.mediumVerbs.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Verbs to Strengthen:
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestion.mediumVerbs.slice(0, 8).map((verb: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded text-xs"
                    >
                      {verb}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {/* Show examples if available */}
            {suggestion.examples && suggestion.examples.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Examples:
                </p>
                <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  {suggestion.examples.slice(0, 3).map((example: any, idx: number) => {
                    const exampleText = typeof example === 'string' ? example : (example.verb || example.text || JSON.stringify(example));
                    return <li key={idx}>{exampleText}</li>;
                  })}
                </ul>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  const renderSection = (severity: 'critical' | 'warning' | 'improvement', label: string) => {
    const suggestions = feedback.bySeverity[severity];
    const count = suggestions.length;
    const isExpanded = expandedSections[severity];

    if (count === 0) return null;

    return (
      <div
        className={`border-2 rounded-lg p-4 mb-4 ${getSeverityColor(severity)}`}
      >
        <button
          onClick={() => toggleSection(severity)}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-3">
            {getSeverityIcon(severity)}
            <div>
              <h3 className={`font-semibold ${getSeverityTextColor(severity)}`}>
                {label} ({count})
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                {severity === 'critical' && 'Must fix immediately'}
                {severity === 'warning' && 'Should address soon'}
                {severity === 'improvement' && 'Recommended enhancements'}
              </p>
            </div>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          )}
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-4"
            >
              {suggestions.map((suggestion, index) => renderSuggestion(suggestion, index))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  if (!feedback || feedback.statistics.total === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="flex items-center gap-3 text-success-600 dark:text-success-400">
          <CheckCircle2 className="w-6 h-6" />
          <div>
            <h3 className="font-semibold">Excellent Resume!</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              No major issues detected. Your resume is well-optimized for ATS systems.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="card"
    >
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Resume Improvement Suggestions
        </h2>
        {feedback.summary && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {feedback.summary}
          </p>
        )}
      </div>

      <div className="space-y-4">
        {/* Critical Issues */}
        {renderSection('critical', 'Critical Issues')}

        {/* Warnings */}
        {renderSection('warning', 'Warnings')}

        {/* Improvements */}
        {renderSection('improvement', 'Improvement Suggestions')}
      </div>

      {/* Statistics Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Total Suggestions:</span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {feedback.statistics.total}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-error-600 dark:text-error-400">
              {feedback.statistics.critical}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Critical</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-warning-600 dark:text-warning-400">
              {feedback.statistics.warning}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Warnings</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {feedback.statistics.improvement}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Improvements</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

