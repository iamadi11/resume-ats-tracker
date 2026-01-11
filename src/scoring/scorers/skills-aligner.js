/**
 * Skills Alignment Scorer (25% weight)
 * 
 * Scores resume based on skills match with job requirements.
 * 
 * Strategy:
 * 1. Extract and categorize skills from resume and job description
 * 2. Compare hard skills, soft skills, and tools separately
 * 3. Calculate match percentage for each category
 * 4. Weight categories (hard skills > tools > soft skills)
 * 5. Consider skill importance (frequency in job description)
 */

import { extractFromResume, extractFromJobDescription } from '../extraction/index.js';

/**
 * Calculate skills alignment score
 * 
 * @param {string} resumeText - Resume text
 * @param {string} jobText - Job description text
 * @returns {Object} Skills alignment score and details
 */
export function calculateSkillsAlignmentScore(resumeText, jobText) {
  if (!resumeText || !jobText) {
    return {
      score: 0,
      hardSkillsScore: 0,
      softSkillsScore: 0,
      toolsScore: 0,
      hardSkills: { common: [], missing: [], extra: [] },
      softSkills: { common: [], missing: [], extra: [] },
      tools: { common: [], missing: [], extra: [] },
      explanation: 'No text provided for comparison'
    };
  }

  // Extract skills from both texts
  const resumeData = extractFromResume(resumeText, {
    includeProximity: false,
    includeCategoryBreakdown: true
  });

  const jobData = extractFromJobDescription(jobText, {
    includeProximity: false,
    includeCategoryBreakdown: true
  });

  // Compare skills by category
  const hardSkillsComparison = compareSkillsCategory(
    resumeData.skills.hard || [],
    jobData.skills.hard || []
  );

  const softSkillsComparison = compareSkillsCategory(
    resumeData.skills.soft || [],
    jobData.skills.soft || []
  );

  const toolsComparison = compareSkillsCategory(
    resumeData.skills.tools || [],
    jobData.skills.tools || []
  );

  // Calculate category scores
  // Hard skills are most important (60% weight)
  // Tools are important (30% weight)
  // Soft skills are nice-to-have (10% weight)
  const hardSkillsScore = hardSkillsComparison.matchScore * 100;
  const softSkillsScore = softSkillsComparison.matchScore * 100;
  const toolsScore = toolsComparison.matchScore * 100;

  // Weighted overall score
  const weightedScore = (
    hardSkillsScore * 0.60 +
    toolsScore * 0.30 +
    softSkillsScore * 0.10
  );

  // Bonus for covering all required skills
  let completenessBonus = 0;
  const totalRequired = (jobData.skills.hard?.length || 0) + 
                       (jobData.skills.tools?.length || 0);
  const totalMatched = hardSkillsComparison.common.length + 
                      toolsComparison.common.length;
  
  if (totalRequired > 0 && totalMatched === totalRequired) {
    completenessBonus = 5; // Bonus for 100% coverage
  } else if (totalRequired > 0) {
    const coverageRatio = totalMatched / totalRequired;
    if (coverageRatio >= 0.9) {
      completenessBonus = 3; // Bonus for 90%+ coverage
    }
  }

  const finalScore = Math.min(100, weightedScore + completenessBonus);

  // Build explanation
  const explanation = buildSkillsAlignmentExplanation(
    finalScore,
    hardSkillsComparison,
    softSkillsComparison,
    toolsComparison,
    completenessBonus
  );

  return {
    score: Math.round(finalScore * 100) / 100,
    hardSkillsScore: Math.round(hardSkillsScore * 100) / 100,
    softSkillsScore: Math.round(softSkillsScore * 100) / 100,
    toolsScore: Math.round(toolsScore * 100) / 100,
    hardSkills: {
      common: hardSkillsComparison.common,
      missing: hardSkillsComparison.unique2,
      extra: hardSkillsComparison.unique1
    },
    softSkills: {
      common: softSkillsComparison.common,
      missing: softSkillsComparison.unique2,
      extra: softSkillsComparison.unique1
    },
    tools: {
      common: toolsComparison.common,
      missing: toolsComparison.unique2,
      extra: toolsComparison.unique1
    },
    completenessBonus: Math.round(completenessBonus * 100) / 100,
    explanation
  };
}

/**
 * Compare skills in a single category
 * 
 * @param {string[]} resumeSkills - Skills from resume
 * @param {string[]} jobSkills - Required skills from job
 * @returns {Object} Comparison result
 */
function compareSkillsCategory(resumeSkills, jobSkills) {
  const resumeSet = new Set(resumeSkills);
  const jobSet = new Set(jobSkills);

  const common = resumeSkills.filter(skill => jobSet.has(skill));
  const unique1 = resumeSkills.filter(skill => !jobSet.has(skill));
  const unique2 = jobSkills.filter(skill => !resumeSet.has(skill));

  // Match score: Jaccard similarity
  // J(A, B) = |A ∩ B| / |A ∪ B|
  const intersection = common.length;
  const union = new Set([...resumeSkills, ...jobSkills]).size;
  const matchScore = union > 0 ? intersection / union : 0;

  return {
    common,
    unique1,
    unique2,
    matchScore
  };
}

/**
 * Build explanation for skills alignment score
 * 
 * @param {number} score - Final score
 * @param {Object} hardSkills - Hard skills comparison
 * @param {Object} softSkills - Soft skills comparison
 * @param {Object} tools - Tools comparison
 * @param {number} completenessBonus - Completeness bonus
 * @returns {string} Explanation text
 */
function buildSkillsAlignmentExplanation(score, hardSkills, softSkills, tools, completenessBonus) {
  const parts = [];

  parts.push(`Skills alignment: ${Math.round(score)}/100.`);

  // Hard skills (most important)
  if (hardSkills.common.length > 0) {
    parts.push(`Hard skills match: ${hardSkills.common.length} of ${hardSkills.common.length + hardSkills.unique2.length} required.`);
  }
  if (hardSkills.unique2.length > 0) {
    parts.push(`Missing hard skills: ${hardSkills.unique2.slice(0, 5).join(', ')}${hardSkills.unique2.length > 5 ? '...' : ''}.`);
  }

  // Tools
  if (tools.common.length > 0 || tools.unique2.length > 0) {
    parts.push(`Tools match: ${tools.common.length} of ${tools.common.length + tools.unique2.length} required.`);
    if (tools.unique2.length > 0) {
      parts.push(`Missing tools: ${tools.unique2.slice(0, 3).join(', ')}${tools.unique2.length > 3 ? '...' : ''}.`);
    }
  }

  // Soft skills
  if (softSkills.common.length > 0) {
    parts.push(`Soft skills match: ${softSkills.common.length} found.`);
  }

  // Bonus
  if (completenessBonus > 0) {
    parts.push(`✓ Completeness bonus: +${completenessBonus.toFixed(1)} points for covering all/most required skills.`);
  }

  return parts.join(' ');
}

