/**
 * ATS Scoring Engine
 * 
 * Main scoring engine that combines all scoring factors:
 * - Keyword match (35%)
 * - Skills alignment (25%)
 * - Formatting compliance (20%)
 * - Impact & metrics (10%)
 * - Readability & length (10%)
 * 
 * Provides explainable scoring with detailed breakdowns.
 */

import { matchKeywords } from './rules/keyword-matcher.js';
import { matchSkills } from './rules/skills-matcher.js';
import { checkFormatting } from './rules/formatting-checker.js';
import { detectImpact } from './rules/impact-detector.js';
import { checkReadability } from './rules/readability-checker.js';

/**
 * Scoring weights
 */
const WEIGHTS = {
  KEYWORD_MATCH: 0.35,      // 35%
  SKILLS_ALIGNMENT: 0.25,    // 25%
  FORMATTING: 0.20,          // 20%
  IMPACT_METRICS: 0.10,      // 10%
  READABILITY: 0.10          // 10%
};

/**
 * Calculate ATS compatibility score
 * 
 * @param {string} resumeText - Resume text
 * @param {string} jobText - Job description text
 * @param {Object} resume - Parsed resume object (optional)
 * @returns {Object} Complete scoring result with breakdown
 */
export function calculateATSScore(resumeText, jobText, resume = null) {
  if (!resumeText || !jobText) {
    return {
      overallScore: 0,
      breakdown: {},
      explanation: 'Missing resume or job description text',
      recommendations: []
    };
  }

  // Calculate individual scores
  const keywordResult = matchKeywords(resumeText, jobText);
  const skillsResult = matchSkills(resumeText, jobText);
  const formattingResult = checkFormatting(resumeText, resume);
  const impactResult = detectImpact(resumeText);
  const readabilityResult = checkReadability(resumeText);

  // Calculate weighted overall score
  const overallScore = (
    keywordResult.score * WEIGHTS.KEYWORD_MATCH +
    skillsResult.score * WEIGHTS.SKILLS_ALIGNMENT +
    formattingResult.score * WEIGHTS.FORMATTING +
    impactResult.score * WEIGHTS.IMPACT_METRICS +
    readabilityResult.score * WEIGHTS.READABILITY
  ) * 100; // Convert to 0-100 scale

  // Build detailed breakdown
  const breakdown = {
    keywordMatch: {
      score: keywordResult.score * 100,
      weight: WEIGHTS.KEYWORD_MATCH * 100,
      weightedScore: keywordResult.score * WEIGHTS.KEYWORD_MATCH * 100,
      details: {
        matchedKeywords: keywordResult.matchedKeywords.length,
        missingKeywords: keywordResult.missingKeywords.length,
        similarity: keywordResult.similarity,
        stuffingDetected: keywordResult.stuffing?.isStuffing || false,
        stuffingPenalty: keywordResult.details?.stuffingPenalty || 0
      }
    },
    skillsAlignment: {
      score: skillsResult.score * 100,
      weight: WEIGHTS.SKILLS_ALIGNMENT * 100,
      weightedScore: skillsResult.score * WEIGHTS.SKILLS_ALIGNMENT * 100,
      details: {
        hardSkills: {
          matched: skillsResult.hardSkills.matched.length,
          missing: skillsResult.hardSkills.missing.length,
          score: skillsResult.hardSkills.score * 100
        },
        softSkills: {
          matched: skillsResult.softSkills.matched.length,
          missing: skillsResult.softSkills.missing.length,
          score: skillsResult.softSkills.score * 100
        },
        tools: {
          matched: skillsResult.tools.matched.length,
          missing: skillsResult.tools.missing.length,
          score: skillsResult.tools.score * 100
        }
      }
    },
    formatting: {
      score: formattingResult.score * 100,
      weight: WEIGHTS.FORMATTING * 100,
      weightedScore: formattingResult.score * WEIGHTS.FORMATTING * 100,
      details: {
        issues: formattingResult.issues.length,
        warnings: formattingResult.warnings.length,
        issuesList: formattingResult.issues,
        warningsList: formattingResult.warnings
      }
    },
    impactMetrics: {
      score: impactResult.score * 100,
      weight: WEIGHTS.IMPACT_METRICS * 100,
      weightedScore: impactResult.score * WEIGHTS.IMPACT_METRICS * 100,
      details: {
        metricsCount: impactResult.metrics.length,
        impactStatements: impactResult.impactStatements.length,
        metrics: impactResult.metrics.slice(0, 10) // Top 10 metrics
      }
    },
    readability: {
      score: readabilityResult.score * 100,
      weight: WEIGHTS.READABILITY * 100,
      weightedScore: readabilityResult.score * WEIGHTS.READABILITY * 100,
      details: {
        wordCount: readabilityResult.wordCount,
        issues: readabilityResult.issues.length,
        warnings: readabilityResult.warnings.length,
        issuesList: readabilityResult.issues,
        warningsList: readabilityResult.warnings
      }
    }
  };

  // Generate explanation
  const explanation = generateExplanation(breakdown, overallScore);

  // Generate recommendations
  const recommendations = generateRecommendations(breakdown, keywordResult, skillsResult);

  return {
    overallScore: Math.round(overallScore * 100) / 100, // Round to 2 decimals
    breakdown,
    explanation,
    recommendations,
    rawScores: {
      keywordMatch: keywordResult.score,
      skillsAlignment: skillsResult.score,
      formatting: formattingResult.score,
      impactMetrics: impactResult.score,
      readability: readabilityResult.score
    }
  };
}

/**
 * Generate human-readable explanation
 * 
 * @param {Object} breakdown - Score breakdown
 * @param {number} overallScore - Overall score
 * @returns {string} Explanation text
 */
function generateExplanation(breakdown, overallScore) {
  const parts = [];

  // Overall assessment
  if (overallScore >= 80) {
    parts.push('Excellent ATS compatibility. Your resume is well-optimized for ATS systems.');
  } else if (overallScore >= 60) {
    parts.push('Good ATS compatibility. Some improvements could enhance your score.');
  } else if (overallScore >= 40) {
    parts.push('Moderate ATS compatibility. Several areas need improvement.');
  } else {
    parts.push('Low ATS compatibility. Significant improvements needed.');
  }

  // Category highlights
  if (breakdown.keywordMatch.score >= 70) {
    parts.push('Strong keyword alignment with the job description.');
  } else if (breakdown.keywordMatch.score < 50) {
    parts.push('Keyword matching needs improvement. Consider adding more relevant keywords from the job description.');
  }

  if (breakdown.skillsAlignment.score >= 70) {
    parts.push('Good skills alignment with job requirements.');
  } else if (breakdown.skillsAlignment.score < 50) {
    parts.push('Skills alignment could be improved. Highlight more required skills from the job description.');
  }

  if (breakdown.formatting.score < 70) {
    parts.push('Formatting issues detected that may affect ATS parsing.');
  }

  if (breakdown.impactMetrics.score < 50) {
    parts.push('Consider adding more quantifiable achievements and metrics.');
  }

  return parts.join(' ');
}

/**
 * Generate actionable recommendations
 * 
 * @param {Object} breakdown - Score breakdown
 * @param {Object} keywordResult - Keyword matching result
 * @param {Object} skillsResult - Skills matching result
 * @returns {string[]} Array of recommendations
 */
function generateRecommendations(breakdown, keywordResult, skillsResult) {
  const recommendations = [];

  // Keyword recommendations
  if (breakdown.keywordMatch.score < 70) {
    if (keywordResult.missingKeywords.length > 0) {
      const topMissing = keywordResult.missingKeywords
        .slice(0, 5)
        .map(k => k.term)
        .join(', ');
      recommendations.push(`Add these keywords from the job description: ${topMissing}`);
    }

    if (keywordResult.stuffing?.isStuffing) {
      recommendations.push('Reduce keyword repetition (keyword stuffing detected). Use keywords naturally throughout your resume.');
    }
  }

  // Skills recommendations
  if (breakdown.skillsAlignment.score < 70) {
    if (skillsResult.hardSkills.missing.length > 0) {
      const topMissing = skillsResult.hardSkills.missing.slice(0, 3).join(', ');
      recommendations.push(`Highlight these required technical skills: ${topMissing}`);
    }

    if (skillsResult.softSkills.missing.length > 0) {
      const topMissing = skillsResult.softSkills.missing.slice(0, 3).join(', ');
      recommendations.push(`Consider emphasizing these soft skills: ${topMissing}`);
    }
  }

  // Formatting recommendations
  if (breakdown.formatting.details.issues.length > 0) {
    breakdown.formatting.details.issuesList.forEach(issue => {
      recommendations.push(`Fix formatting issue: ${issue.message}`);
    });
  }

  // Impact recommendations
  if (breakdown.impactMetrics.score < 50) {
    recommendations.push('Add quantifiable achievements with numbers, percentages, and metrics.');
    recommendations.push('Use action verbs like "increased", "improved", "reduced" with specific results.');
  }

  // Readability recommendations
  if (breakdown.readability.details.issues.length > 0) {
    breakdown.readability.details.issuesList.forEach(issue => {
      recommendations.push(`Improve readability: ${issue.message}`);
    });
  }

  // General recommendations if score is low
  if (breakdown.overallScore < 60) {
    recommendations.push('Review the job description carefully and align your resume more closely with the requirements.');
    recommendations.push('Ensure your resume is ATS-friendly: use standard fonts, clear section headers, and avoid complex formatting.');
  }

  return recommendations;
}

/**
 * Get weight justification
 * 
 * @returns {Object} Weight justification
 */
export function getWeightJustification() {
  return {
    keywordMatch: {
      weight: WEIGHTS.KEYWORD_MATCH,
      percentage: WEIGHTS.KEYWORD_MATCH * 100,
      justification: 'Keywords are the primary way ATS systems match resumes to job descriptions. High weight ensures relevant resumes are identified.'
    },
    skillsAlignment: {
      weight: WEIGHTS.SKILLS_ALIGNMENT,
      percentage: WEIGHTS.SKILLS_ALIGNMENT * 100,
      justification: 'Skills directly indicate candidate qualifications. Strong alignment shows fit for the role.'
    },
    formatting: {
      weight: WEIGHTS.FORMATTING,
      percentage: WEIGHTS.FORMATTING * 100,
      justification: 'ATS systems must parse resumes correctly. Poor formatting can cause information loss or parsing errors.'
    },
    impactMetrics: {
      weight: WEIGHTS.IMPACT_METRICS,
      percentage: WEIGHTS.IMPACT_METRICS * 100,
      justification: 'Quantifiable achievements demonstrate value and results. Recruiters and ATS systems value metrics.'
    },
    readability: {
      weight: WEIGHTS.READABILITY,
      percentage: WEIGHTS.READABILITY * 100,
      justification: 'Readable resumes are easier for both ATS systems and humans to process. Appropriate length ensures completeness without overwhelming.'
    }
  };
}
