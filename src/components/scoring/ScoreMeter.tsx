import React from 'react';
import { motion } from 'framer-motion';
import { ScoreBreakdown } from '../../types';

interface ScoreMeterProps {
  score: number;
  breakdown: ScoreBreakdown;
}

export default function ScoreMeter({ score, breakdown }: ScoreMeterProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success-600 dark:text-success-400';
    if (score >= 60) return 'text-primary-600 dark:text-primary-400';
    if (score >= 40) return 'text-warning-600 dark:text-warning-400';
    return 'text-error-600 dark:text-error-400';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-success-500';
    if (score >= 60) return 'bg-primary-500';
    if (score >= 40) return 'bg-warning-500';
    return 'bg-error-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  // Calculate circumference for circular progress
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  // Check if breakdown is valid
  const hasValidBreakdown = breakdown && 
    breakdown.keywordMatch && 
    breakdown.skillsAlignment && 
    breakdown.formatting && 
    breakdown.impactMetrics && 
    breakdown.readability;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="card"
    >
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        ATS Compatibility Score
      </h2>

      {/* Circular Score Meter */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-32 h-32">
          <svg className="transform -rotate-90 w-32 h-32">
            {/* Background circle */}
            <circle
              cx="64"
              cy="64"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-gray-200 dark:text-gray-700"
            />
            {/* Progress circle */}
            <motion.circle
              cx="64"
              cy="64"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={circumference}
              strokeLinecap="round"
              className={`${getScoreColor(score)}`}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              className="text-center"
            >
              <div className={`text-3xl font-bold ${getScoreColor(score)}`}>
                {Math.round(score)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {getScoreLabel(score)}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Score Breakdown */}
      {hasValidBreakdown ? (
        <div className="space-y-3">
          <ScoreBreakdownItem
            label="Keyword Match"
            score={breakdown.keywordMatch.score}
            weight={breakdown.keywordMatch.weight}
            details={breakdown.keywordMatch.details}
            delay={0.1}
          />
          <ScoreBreakdownItem
            label="Skills Alignment"
            score={breakdown.skillsAlignment.score}
            weight={breakdown.skillsAlignment.weight}
            details={breakdown.skillsAlignment.details}
            delay={0.2}
          />
          <ScoreBreakdownItem
            label="Formatting"
            score={breakdown.formatting.score}
            weight={breakdown.formatting.weight}
            details={breakdown.formatting.details}
            delay={0.3}
          />
          <ScoreBreakdownItem
            label="Impact & Metrics"
            score={breakdown.impactMetrics.score}
            weight={breakdown.impactMetrics.weight}
            details={breakdown.impactMetrics.details}
            delay={0.4}
          />
          <ScoreBreakdownItem
            label="Readability"
            score={breakdown.readability.score}
            weight={breakdown.readability.weight}
            details={breakdown.readability.details}
            delay={0.5}
          />
        </div>
      ) : (
        <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">
          Score breakdown is not available. Please try recalculating the score.
        </div>
      )}
    </motion.div>
  );
}

interface ScoreBreakdownItemProps {
  label: string;
  score: number;
  weight: number;
  details: any;
  delay?: number;
}

function ScoreBreakdownItem({ label, score, weight, details, delay = 0 }: ScoreBreakdownItemProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-success-500';
    if (score >= 60) return 'bg-primary-500';
    if (score >= 40) return 'bg-warning-500';
    return 'bg-error-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="space-y-1"
    >
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-700 dark:text-gray-300">{label}</span>
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {Math.round(score)} / 100
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
        <motion.div
          className={`h-2 rounded-full ${getScoreColor(score)}`}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ delay: delay + 0.2, duration: 0.6, ease: 'easeOut' }}
          role="progressbar"
          aria-valuenow={score}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${label} score: ${Math.round(score)}%`}
        />
      </div>
      {details.matchedKeywords !== undefined && (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {details.matchedKeywords} matched, {details.missingKeywords} missing
        </div>
      )}
      {details.hardSkills && (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Hard: {details.hardSkills.matched}/{details.hardSkills.matched + details.hardSkills.missing} • 
          Soft: {details.softSkills.matched}/{details.softSkills.matched + details.softSkills.missing} • 
          Tools: {details.tools.matched}/{details.tools.matched + details.tools.missing}
        </div>
      )}
    </motion.div>
  );
}
