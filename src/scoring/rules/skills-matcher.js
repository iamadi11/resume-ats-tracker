/**
 * Skills Alignment Rules
 * 
 * Matches skills between resume and job description.
 * Categorizes skills and calculates alignment score.
 */

import { normalizeSkills, categorizeSkills } from '../extraction/skill-categorizer.js';
import { extractFromResume, extractFromJobDescription } from '../extraction/index.js';

/**
 * Match skills between resume and job description
 * 
 * @param {string} resumeText - Resume text
 * @param {string} jobText - Job description text
 * @returns {Object} Skills matching result
 */
export function matchSkills(resumeText, jobText) {
  if (!resumeText || !jobText) {
    return {
      score: 0,
      hardSkills: { matched: [], missing: [], score: 0 },
      softSkills: { matched: [], missing: [], score: 0 },
      tools: { matched: [], missing: [], score: 0 },
      details: {}
    };
  }

  // Extract and categorize skills
  const resumeSkills = extractFromResume(resumeText, {
    includeProximity: false,
    includeCategoryBreakdown: true
  });

  const jobSkills = extractFromJobDescription(jobText, {
    includeProximity: false,
    includeCategoryBreakdown: true
  });

  // Match skills by category
  const hardSkills = matchSkillCategory(
    resumeSkills.skills.hard || [],
    jobSkills.skills.hard || []
  );

  const softSkills = matchSkillCategory(
    resumeSkills.skills.soft || [],
    jobSkills.skills.soft || []
  );

  const tools = matchSkillCategory(
    resumeSkills.skills.tools || [],
    jobSkills.skills.tools || []
  );

  // Calculate overall score
  // Weights: Hard skills 60%, Soft skills 25%, Tools 15%
  const overallScore = (
    hardSkills.score * 0.6 +
    softSkills.score * 0.25 +
    tools.score * 0.15
  );

  return {
    score: overallScore,
    hardSkills,
    softSkills,
    tools,
    details: {
      resumeHardCount: resumeSkills.skills.hard?.length || 0,
      jobHardCount: jobSkills.skills.hard?.length || 0,
      resumeSoftCount: resumeSkills.skills.soft?.length || 0,
      jobSoftCount: jobSkills.skills.soft?.length || 0,
      resumeToolsCount: resumeSkills.skills.tools?.length || 0,
      jobToolsCount: jobSkills.skills.tools?.length || 0
    }
  };
}

/**
 * Match skills in a specific category
 * 
 * @param {string[]} resumeSkills - Skills from resume
 * @param {string[]} jobSkills - Skills from job description
 * @returns {Object} Category matching result
 */
function matchSkillCategory(resumeSkills, jobSkills) {
  if (jobSkills.length === 0) {
    return {
      matched: [],
      missing: [],
      score: 1.0, // Perfect score if no requirements
      coverage: 1.0
    };
  }

  if (resumeSkills.length === 0) {
    return {
      matched: [],
      missing: jobSkills,
      score: 0,
      coverage: 0
    };
  }

  // Normalize skills for comparison
  const normalizedResume = normalizeSkills(resumeSkills);
  const normalizedJob = normalizeSkills(jobSkills);

  const resumeSet = new Set(normalizedResume.map(s => s.toLowerCase()));
  const jobSet = new Set(normalizedJob.map(s => s.toLowerCase()));

  // Find matches
  const matched = normalizedJob.filter(skill => 
    resumeSet.has(skill.toLowerCase())
  );

  // Find missing
  const missing = normalizedJob.filter(skill => 
    !resumeSet.has(skill.toLowerCase())
  );

  // Calculate score: percentage of required skills present
  const score = matched.length / normalizedJob.length;
  const coverage = score; // Same as score for skills

  return {
    matched,
    missing,
    score,
    coverage
  };
}

