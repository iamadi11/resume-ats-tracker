/**
 * Feedback Engine
 * 
 * Generates actionable suggestions based on ATS analysis.
 * Combines all feedback rules and provides structured, prioritized feedback.
 */

import { detectMissingKeywords } from './rules/missing-keywords.js';
import { detectWeakActionVerbs } from './rules/action-verbs.js';
import { detectUnquantifiedBullets } from './rules/quantification.js';
import { detectOverusedWords } from './rules/word-usage.js';
import { detectFormattingViolations } from './rules/formatting-violations.js';

import {
  createMissingKeywordsSuggestions,
  createActionVerbSuggestions,
  createQuantificationSuggestions,
  createOverusedWordsSuggestions,
  createFormattingSuggestions,
  SEVERITY
} from './suggestion-templates.js';

/**
 * Generate comprehensive feedback
 * 
 * @param {string} resumeText - Resume text
 * @param {string} jobText - Job description text
 * @param {Object} resume - Parsed resume object (optional)
 * @returns {Object} Complete feedback with suggestions
 */
export function generateFeedback(resumeText, jobText, resume = null) {
  if (!resumeText || !jobText) {
    return {
      suggestions: [],
      summary: 'Unable to generate feedback: missing resume or job description',
      bySeverity: {
        critical: [],
        warning: [],
        improvement: []
      }
    };
  }

  // Run all detection rules
  const missingKeywords = detectMissingKeywords(resumeText, jobText);
  const actionVerbs = detectWeakActionVerbs(resumeText);
  const quantification = detectUnquantifiedBullets(resumeText);
  const overusedWords = detectOverusedWords(resumeText);
  const formattingViolations = detectFormattingViolations(resumeText, resume);

  // Generate suggestions from each category
  const allSuggestions = [
    ...createMissingKeywordsSuggestions(missingKeywords),
    ...createActionVerbSuggestions(actionVerbs),
    ...createQuantificationSuggestions(quantification),
    ...createOverusedWordsSuggestions(overusedWords),
    ...createFormattingSuggestions(formattingViolations)
  ];

  // Group by severity
  const bySeverity = {
    critical: allSuggestions.filter(s => s.severity === SEVERITY.CRITICAL),
    warning: allSuggestions.filter(s => s.severity === SEVERITY.WARNING),
    improvement: allSuggestions.filter(s => s.severity === SEVERITY.IMPROVEMENT)
  };

  // Generate summary
  const summary = generateSummary(bySeverity, {
    missingKeywords,
    actionVerbs,
    quantification,
    overusedWords,
    formattingViolations
  });

  // Prioritize suggestions (critical first, then by category importance)
  const prioritized = prioritizeSuggestions(allSuggestions);

  return {
    suggestions: prioritized,
    summary,
    bySeverity,
    statistics: {
      total: allSuggestions.length,
      critical: bySeverity.critical.length,
      warning: bySeverity.warning.length,
      improvement: bySeverity.improvement.length
    },
    details: {
      missingKeywords,
      actionVerbs,
      quantification,
      overusedWords,
      formattingViolations
    }
  };
}

/**
 * Generate summary text
 * 
 * @param {Object} bySeverity - Suggestions grouped by severity
 * @param {Object} details - Detailed analysis results
 * @returns {string} Summary text
 */
function generateSummary(bySeverity, details) {
  const parts = [];

  if (bySeverity.critical.length > 0) {
    parts.push(`Found ${bySeverity.critical.length} critical issue(s) that need immediate attention.`);
  }

  if (bySeverity.warning.length > 0) {
    parts.push(`${bySeverity.warning.length} warning(s) that should be addressed.`);
  }

  if (bySeverity.improvement.length > 0) {
    parts.push(`${bySeverity.improvement.length} improvement suggestion(s) to enhance your resume.`);
  }

  // Add specific highlights
  if (details.missingKeywords.critical.length > 0) {
    parts.push(`Missing ${details.missingKeywords.critical.length} critical keyword(s) from the job description.`);
  }

  if (details.actionVerbs.weak.length > 0) {
    parts.push(`Found ${details.actionVerbs.weak.length} weak action verb(s) that could be strengthened.`);
  }

  if (details.quantification.unquantifiedCount > 0) {
    const rate = (details.quantification.quantificationRate * 100).toFixed(0);
    parts.push(`Only ${rate}% of bullet points include quantifiable metrics.`);
  }

  if (details.formattingViolations.totalViolations > 0) {
    parts.push(`Found ${details.formattingViolations.totalViolations} formatting issue(s).`);
  }

  if (parts.length === 0) {
    return 'Your resume looks good! No major issues detected.';
  }

  return parts.join(' ');
}

/**
 * Prioritize suggestions
 * 
 * @param {Array} suggestions - All suggestions
 * @returns {Array} Prioritized suggestions
 */
function prioritizeSuggestions(suggestions) {
  const severityOrder = { [SEVERITY.CRITICAL]: 3, [SEVERITY.WARNING]: 2, [SEVERITY.IMPROVEMENT]: 1 };
  const categoryOrder = {
    'missing_keywords': 5,
    'formatting': 4,
    'action_verbs': 3,
    'quantification': 2,
    'word_usage': 1
  };

  return suggestions.sort((a, b) => {
    // First by severity
    const severityDiff = (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0);
    if (severityDiff !== 0) return severityDiff;

    // Then by category importance
    const categoryDiff = (categoryOrder[b.category] || 0) - (categoryOrder[a.category] || 0);
    if (categoryDiff !== 0) return categoryDiff;

    // Finally by title (alphabetical)
    return a.title.localeCompare(b.title);
  });
}

/**
 * Get feedback by category
 * 
 * @param {Object} feedback - Complete feedback object
 * @param {string} category - Category to filter by
 * @returns {Array} Filtered suggestions
 */
export function getFeedbackByCategory(feedback, category) {
  if (!feedback || !feedback.suggestions) {
    return [];
  }

  return feedback.suggestions.filter(s => s.category === category);
}

/**
 * Get feedback by severity
 * 
 * @param {Object} feedback - Complete feedback object
 * @param {string} severity - Severity level
 * @returns {Array} Filtered suggestions
 */
export function getFeedbackBySeverity(feedback, severity) {
  if (!feedback || !feedback.bySeverity) {
    return [];
  }

  return feedback.bySeverity[severity] || [];
}

