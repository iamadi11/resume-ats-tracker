/**
 * Missing Keywords Detection
 * 
 * Identifies important keywords from job description that are missing from resume.
 */

import { extractKeywords } from '../../extraction/keyword-extractor.js';
import { normalizeSkill } from '../../extraction/skill-normalizer.js';

/**
 * Detect missing keywords
 * 
 * @param {string} resumeText - Resume text
 * @param {string} jobText - Job description text
 * @returns {Object} Missing keywords analysis
 */
export function detectMissingKeywords(resumeText, jobText) {
  if (!resumeText || !jobText) {
    return {
      missing: [],
      suggestions: []
    };
  }

  // Extract keywords from both texts
  const resumeKeywords = extractKeywords(resumeText, {
    minFrequency: 1,
    maxKeywords: 100,
    includeNGrams: true,
    removeStopwords: true
  });

  const jobKeywords = extractKeywords(jobText, {
    minFrequency: 1,
    maxKeywords: 100,
    includeNGrams: true,
    removeStopwords: true
  });

  // Normalize and compare
  const resumeTerms = new Set(
    resumeKeywords.keywords.map(k => normalizeSkill(k.term).toLowerCase())
  );

  const missing = jobKeywords.keywords
    .filter(k => {
      const normalized = normalizeSkill(k.term).toLowerCase();
      return !resumeTerms.has(normalized);
    })
    .sort((a, b) => b.frequency - a.frequency) // Sort by frequency in job description
    .slice(0, 10); // Top 10 missing keywords

  // Categorize by importance
  const critical = missing.filter(k => k.frequency >= 3 || k.category === 'hard');
  const important = missing.filter(k => k.frequency >= 2 && k.category !== 'hard');
  const suggested = missing.filter(k => k.frequency === 1);

  return {
    missing,
    critical,
    important,
    suggested,
    totalMissing: missing.length
  };
}

