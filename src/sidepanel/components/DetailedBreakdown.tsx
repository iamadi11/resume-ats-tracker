import React from 'react';
import { ATSResult } from '../../popup/types';

interface DetailedBreakdownProps {
  score: ATSResult;
}

export default function DetailedBreakdown({ score }: DetailedBreakdownProps) {
  return (
    <div className="space-y-6">
      {/* Overall Score Card */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Overall Score
          </h2>
          <div className={`text-3xl font-bold ${
            score.overallScore >= 80 ? 'text-success-600' :
            score.overallScore >= 60 ? 'text-primary-600' :
            score.overallScore >= 40 ? 'text-warning-600' :
            'text-error-600'
          }`}>
            {Math.round(score.overallScore)}/100
          </div>
        </div>
        <p className="text-gray-600 text-sm">{score.explanation}</p>
      </div>

      {/* Category Breakdowns */}
      <div className="space-y-4">
        <CategoryBreakdown
          title="Keyword Match"
          breakdown={score.breakdown.keywordMatch}
          description="How well your resume keywords match the job description"
        />
        <CategoryBreakdown
          title="Skills Alignment"
          breakdown={score.breakdown.skillsAlignment}
          description="Alignment of your skills with job requirements"
        />
        <CategoryBreakdown
          title="Formatting Compliance"
          breakdown={score.breakdown.formatting}
          description="ATS-friendly formatting and structure"
        />
        <CategoryBreakdown
          title="Impact & Metrics"
          breakdown={score.breakdown.impactMetrics}
          description="Quantifiable achievements and results"
        />
        <CategoryBreakdown
          title="Readability"
          breakdown={score.breakdown.readability}
          description="Clarity, length, and structure"
        />
      </div>

      {/* Recommendations */}
      {score.recommendations && score.recommendations.length > 0 && (
        <div className="card bg-primary-50 border-primary-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Recommendations
          </h3>
          <ul className="space-y-2">
            {score.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start space-x-2 text-sm text-gray-700">
                <span className="text-primary-600 mt-1">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

interface CategoryBreakdownProps {
  title: string;
  breakdown: any;
  description: string;
}

function CategoryBreakdown({ title, breakdown, description }: CategoryBreakdownProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success-600 bg-success-50';
    if (score >= 60) return 'text-primary-600 bg-primary-50';
    if (score >= 40) return 'text-warning-600 bg-warning-50';
    return 'text-error-600 bg-error-50';
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(breakdown.score)}`}>
          {Math.round(breakdown.score)}/100
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Score</span>
          <span className="font-medium text-gray-900">{Math.round(breakdown.score)}%</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Weight</span>
          <span className="font-medium text-gray-900">{breakdown.weight}%</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Weighted Contribution</span>
          <span className="font-medium text-gray-900">
            {Math.round(breakdown.weightedScore)} points
          </span>
        </div>
      </div>

      {/* Additional Details */}
      {breakdown.details && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Details</h4>
          <div className="text-xs text-gray-600 space-y-1">
            {breakdown.details.matchedKeywords !== undefined && (
              <div>
                Matched: {breakdown.details.matchedKeywords} keywords • 
                Missing: {breakdown.details.missingKeywords} keywords
              </div>
            )}
            {breakdown.details.hardSkills && (
              <div>
                Hard Skills: {breakdown.details.hardSkills.matched} matched, {breakdown.details.hardSkills.missing} missing
              </div>
            )}
            {breakdown.details.issues !== undefined && (
              <div>
                Issues: {breakdown.details.issues} • Warnings: {breakdown.details.warnings}
              </div>
            )}
            {breakdown.details.metricsCount !== undefined && (
              <div>
                Metrics Found: {breakdown.details.metricsCount}
              </div>
            )}
            {breakdown.details.wordCount !== undefined && (
              <div>
                Word Count: {breakdown.details.wordCount}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

