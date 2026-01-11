/**
 * Optimized Scorer
 * 
 * Optimized version of scoring engine for Web Worker execution.
 * Focuses on performance and avoiding unnecessary computations.
 */

import { matchKeywords } from './rules/keyword-matcher.js';
import { matchSkills } from './rules/skills-matcher.js';
import { checkFormatting } from './rules/formatting-checker.js';
import { detectImpact } from './rules/impact-detector.js';
import { checkReadability } from './rules/readability-checker.js';

const WEIGHTS = {
  KEYWORD_MATCH: 0.35,
  SKILLS_ALIGNMENT: 0.25,
  FORMATTING: 0.20,
  IMPACT_METRICS: 0.10,
  READABILITY: 0.10
};

/**
 * Optimized score calculation
 * Uses memoization and caching for repeated calculations
 * 
 * @param {string} resumeText - Resume text
 * @param {string} jobText - Job description text
 * @param {Object} resume - Parsed resume object
 * @param {Object} cache - Optional cache for intermediate results
 * @returns {Object} Score result
 */
export function calculateATSScoreOptimized(resumeText, jobText, resume = null, cache = new Map()) {
  const startTime = performance.now();

  // Check cache first
  const cacheKey = `${resumeText.length}-${jobText.length}-${resumeText.substring(0, 50)}-${jobText.substring(0, 50)}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  if (!resumeText || !jobText) {
    return {
      overallScore: 0,
      breakdown: {},
      explanation: 'Missing resume or job description text',
      recommendations: [],
      performance: { duration: performance.now() - startTime }
    };
  }

  // Calculate scores in parallel where possible
  const results = {
    keyword: null,
    skills: null,
    formatting: null,
    impact: null,
    readability: null
  };

  // Parallel calculations (where independent)
  const calculations = [
    Promise.resolve(matchKeywords(resumeText, jobText)).then(r => { results.keyword = r; }),
    Promise.resolve(matchSkills(resumeText, jobText)).then(r => { results.skills = r; }),
    Promise.resolve(checkFormatting(resumeText, resume)).then(r => { results.formatting = r; }),
    Promise.resolve(detectImpact(resumeText)).then(r => { results.impact = r; }),
    Promise.resolve(checkReadability(resumeText)).then(r => { results.readability = r; })
  ];

  // Wait for all calculations (though they're synchronous, this structure allows for async if needed)
  Promise.all(calculations).then(() => {
    // All calculations complete
  });

  // Calculate weighted score
  const overallScore = (
    results.keyword.score * WEIGHTS.KEYWORD_MATCH +
    results.skills.score * WEIGHTS.SKILLS_ALIGNMENT +
    results.formatting.score * WEIGHTS.FORMATTING +
    results.impact.score * WEIGHTS.IMPACT_METRICS +
    results.readability.score * WEIGHTS.READABILITY
  ) * 100;

  const duration = performance.now() - startTime;

  const result = {
    overallScore: Math.round(overallScore * 100) / 100,
    breakdown: {
      keywordMatch: {
        score: results.keyword.score * 100,
        weight: WEIGHTS.KEYWORD_MATCH * 100,
        weightedScore: results.keyword.score * WEIGHTS.KEYWORD_MATCH * 100,
        details: results.keyword.details || {}
      },
      skillsAlignment: {
        score: results.skills.score * 100,
        weight: WEIGHTS.SKILLS_ALIGNMENT * 100,
        weightedScore: results.skills.score * WEIGHTS.SKILLS_ALIGNMENT * 100,
        details: results.skills.details || {}
      },
      formatting: {
        score: results.formatting.score * 100,
        weight: WEIGHTS.FORMATTING * 100,
        weightedScore: results.formatting.score * WEIGHTS.FORMATTING * 100,
        details: results.formatting.details || {}
      },
      impactMetrics: {
        score: results.impact.score * 100,
        weight: WEIGHTS.IMPACT_METRICS * 100,
        weightedScore: results.impact.score * WEIGHTS.IMPACT_METRICS * 100,
        details: results.impact.details || {}
      },
      readability: {
        score: results.readability.score * 100,
        weight: WEIGHTS.READABILITY * 100,
        weightedScore: results.readability.score * WEIGHTS.READABILITY * 100,
        details: results.readability.details || {}
      }
    },
    explanation: generateExplanation(results, overallScore),
    recommendations: generateRecommendations(results),
    performance: { duration }
  };

  // Cache result (limit cache size)
  if (cache.size < 10) {
    cache.set(cacheKey, result);
  }

  return result;
}

function generateExplanation(results, overallScore) {
  const parts = [];
  
  if (overallScore >= 80) {
    parts.push('Excellent ATS compatibility.');
  } else if (overallScore >= 60) {
    parts.push('Good ATS compatibility.');
  } else if (overallScore >= 40) {
    parts.push('Moderate ATS compatibility.');
  } else {
    parts.push('Low ATS compatibility.');
  }

  return parts.join(' ');
}

function generateRecommendations(results) {
  const recommendations = [];
  
  if (results.keyword.score < 0.7) {
    recommendations.push('Add more keywords from the job description.');
  }
  
  if (results.skills.score < 0.7) {
    recommendations.push('Highlight more required skills.');
  }
  
  if (results.formatting.score < 0.7) {
    recommendations.push('Fix formatting issues for better ATS parsing.');
  }
  
  if (results.impact.score < 0.5) {
    recommendations.push('Add quantifiable achievements and metrics.');
  }

  return recommendations;
}

