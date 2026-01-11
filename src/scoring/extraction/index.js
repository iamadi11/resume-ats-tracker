/**
 * Keyword and Skill Extraction
 * 
 * Unified interface for extracting keywords and skills from:
 * - Resume text
 * - Job description text
 * 
 * Provides:
 * - Keyword extraction with frequency
 * - Skill normalization
 * - Skill categorization
 * - Proximity analysis
 * - Comparison utilities
 */

import { extractKeywords, extractKeywordsWithProximity, extractKeywordsByCategory, compareKeywords } from './keyword-extractor.js';
import { normalizeSkill, normalizeSkills } from './skill-normalizer.js';
import { categorizeSkill, categorizeSkills, getSkillDictionaries } from './skill-categorizer.js';
import { removeStopwords, filterStopwords, isStopword } from './stopwords.js';

/**
 * Extract keywords and skills from resume text
 * 
 * @param {string} text - Resume text
 * @param {Object} options - Extraction options
 * @returns {Object} Extracted data
 */
export function extractFromResume(text, options = {}) {
  const {
    includeProximity = true,
    includeCategoryBreakdown = true,
    ...extractionOptions
  } = options;

  let keywordData;

  if (includeProximity) {
    keywordData = extractKeywordsWithProximity(text, extractionOptions);
  } else if (includeCategoryBreakdown) {
    keywordData = extractKeywordsByCategory(text, extractionOptions);
  } else {
    keywordData = extractKeywords(text, extractionOptions);
  }

  // Extract and normalize skills
  const allKeywords = keywordData.keywords.map(k => k.term);
  const normalizedSkills = normalizeSkills(allKeywords);
  const categorizedSkills = categorizeSkills(normalizedSkills);

  return {
    keywords: keywordData.keywords,
    skills: categorizedSkills,
    statistics: {
      totalKeywords: keywordData.uniqueKeywords,
      totalWords: keywordData.totalWords,
      byCategory: includeCategoryBreakdown ? keywordData.byCategory : undefined
    },
    proximity: includeProximity ? keywordData.proximity : undefined,
    positions: includeProximity ? keywordData.positions : undefined
  };
}

/**
 * Extract keywords and skills from job description text
 * 
 * @param {string} text - Job description text
 * @param {Object} options - Extraction options
 * @returns {Object} Extracted data
 */
export function extractFromJobDescription(text, options = {}) {
  // Job descriptions might benefit from different extraction strategies
  // For now, use same logic as resume
  return extractFromResume(text, {
    ...options,
    // Job descriptions often have requirements sections - might want to weight those
    includeProximity: options.includeProximity !== false,
    includeCategoryBreakdown: options.includeCategoryBreakdown !== false
  });
}

/**
 * Extract and compare keywords between resume and job description
 * 
 * @param {string} resumeText - Resume text
 * @param {string} jobText - Job description text
 * @param {Object} options - Extraction options
 * @returns {Object} Comparison results
 */
export function extractAndCompare(resumeText, jobText, options = {}) {
  const resumeData = extractFromResume(resumeText, options);
  const jobData = extractFromJobDescription(jobText, options);

  // Compare keywords
  const comparison = compareKeywords(
    {
      keywords: resumeData.keywords,
      frequency: new Map(resumeData.keywords.map(k => [k.term, k.frequency]))
    },
    {
      keywords: jobData.keywords,
      frequency: new Map(jobData.keywords.map(k => [k.term, k.frequency]))
    }
  );

  // Compare skills by category
  const skillComparison = {
    hard: compareSkillSets(
      resumeData.skills.hard || [],
      jobData.skills.hard || []
    ),
    soft: compareSkillSets(
      resumeData.skills.soft || [],
      jobData.skills.soft || []
    ),
    tools: compareSkillSets(
      resumeData.skills.tools || [],
      jobData.skills.tools || []
    )
  };

  return {
    resume: resumeData,
    job: jobData,
    keywordComparison: comparison,
    skillComparison
  };
}

/**
 * Compare two skill sets
 * 
 * @param {string[]} skills1 - First skill set
 * @param {string[]} skills2 - Second skill set
 * @returns {Object} Comparison result
 */
function compareSkillSets(skills1, skills2) {
  const set1 = new Set(skills1);
  const set2 = new Set(skills2);

  const common = skills1.filter(skill => set2.has(skill));
  const unique1 = skills1.filter(skill => !set2.has(skill));
  const unique2 = skills2.filter(skill => !set1.has(skill));

  const matchScore = set1.size + set2.size > 0
    ? (common.length * 2) / (set1.size + set2.size)
    : 0;

  return {
    common,
    unique1,
    unique2,
    matchScore,
    coverage: set2.size > 0 ? common.length / set2.size : 0 // How much of set2 is covered by set1
  };
}

// Export all utilities
export {
  // Keyword extraction
  extractKeywords,
  extractKeywordsWithProximity,
  extractKeywordsByCategory,
  compareKeywords,
  
  // Skill normalization
  normalizeSkill,
  normalizeSkills,
  
  // Skill categorization
  categorizeSkill,
  categorizeSkills,
  getSkillDictionaries,
  
  // Stopwords
  removeStopwords,
  filterStopwords,
  isStopword
};

