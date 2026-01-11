import React from 'react';
import { ScoreBreakdown } from '../types';

interface ScoreMeterProps {
  score: number;
  breakdown: ScoreBreakdown;
}

export default function ScoreMeter({ score, breakdown }: ScoreMeterProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success-600';
    if (score >= 60) return 'text-primary-600';
    if (score >= 40) return 'text-warning-600';
    return 'text-error-600';
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

  return (
    <div className="card">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
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
              className="text-gray-200"
            />
            {/* Progress circle */}
            <circle
              cx="64"
              cy="64"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className={`transition-all duration-500 ${getScoreColor(score)}`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className={`text-3xl font-bold ${getScoreColor(score)}`}>
                {Math.round(score)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {getScoreLabel(score)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="space-y-3">
        <ScoreBreakdownItem
          label="Keyword Match"
          score={breakdown.keywordMatch.score}
          weight={breakdown.keywordMatch.weight}
          details={breakdown.keywordMatch.details}
        />
        <ScoreBreakdownItem
          label="Skills Alignment"
          score={breakdown.skillsAlignment.score}
          weight={breakdown.skillsAlignment.weight}
          details={breakdown.skillsAlignment.details}
        />
        <ScoreBreakdownItem
          label="Formatting"
          score={breakdown.formatting.score}
          weight={breakdown.formatting.weight}
          details={breakdown.formatting.details}
        />
        <ScoreBreakdownItem
          label="Impact & Metrics"
          score={breakdown.impactMetrics.score}
          weight={breakdown.impactMetrics.weight}
          details={breakdown.impactMetrics.details}
        />
        <ScoreBreakdownItem
          label="Readability"
          score={breakdown.readability.score}
          weight={breakdown.readability.weight}
          details={breakdown.readability.details}
        />
      </div>
    </div>
  );
}

interface ScoreBreakdownItemProps {
  label: string;
  score: number;
  weight: number;
  details: any;
}

function ScoreBreakdownItem({ label, score, weight, details }: ScoreBreakdownItemProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-success-500';
    if (score >= 60) return 'bg-primary-500';
    if (score >= 40) return 'bg-warning-500';
    return 'bg-error-500';
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-700">{label}</span>
        <span className="font-medium text-gray-900">
          {Math.round(score)} / 100
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${getScoreColor(score)}`}
          style={{ width: `${score}%` }}
          role="progressbar"
          aria-valuenow={score}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${label} score: ${Math.round(score)}%`}
        />
      </div>
      {details.matchedKeywords !== undefined && (
        <div className="text-xs text-gray-500">
          {details.matchedKeywords} matched, {details.missingKeywords} missing
        </div>
      )}
      {details.hardSkills && (
        <div className="text-xs text-gray-500">
          Hard: {details.hardSkills.matched}/{details.hardSkills.matched + details.hardSkills.missing} • 
          Soft: {details.softSkills.matched}/{details.softSkills.matched + details.softSkills.missing} • 
          Tools: {details.tools.matched}/{details.tools.matched + details.tools.missing}
        </div>
      )}
    </div>
  );
}

