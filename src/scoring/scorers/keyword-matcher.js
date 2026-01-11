/**
 * Keyword Matching Scorer (35% weight)
 * 
 * Scores resume based on keyword match with job description.
 * Uses TF-IDF and cosine similarity for sophisticated matching.
 * 
 * Strategy:
 * 1. Extract keywords from both resume and job description
 * 2. Calculate TF-IDF vectors for both
 * 3. Compute cosine similarity
 * 4. Detect and penalize keyword stuffing
 * 5. Consider keyword importance (IDF-weighted)
 */

import { extractKeywords, compareKeywords } from '../extraction/index.js';
import { calculateTextSimilarity, calculateTFIDFVector, buildVocabulary, cosineSimilarity } from '../utils/tf-idf.js';

/**
 * Detect keyword stuffing in text
 * 
 * Keyword stuffing: Excessive repetition of keywords to manipulate scoring
 * Threshold: If a keyword appears more than 3% of total words, it's likely stuffing
 * 
 * @param {string} text - Text to analyze
 * @param {number} threshold - Percentage threshold (default: 0.03 = 3%)
 * @returns {Object} Stuffing detection results
 */
export function detectKeywordStuffing(text, threshold = 0.03) {
  if (!text || typeof text !== 'string') {
    return {
      isStuffing: false,
      stuffedKeywords: [],
      maxFrequency: 0,
      threshold
    };
  }

  const keywords = extractKeywords(text, {
    minFrequency: 1,
    maxKeywords: 100,
    removeStopwords: true
  });

  const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 0);
  const totalWords = words.length;

  if (totalWords === 0) {
    return {
      isStuffing: false,
      stuffedKeywords: [],
      maxFrequency: 0,
      threshold
    };
  }

  const stuffedKeywords = [];
  let maxFrequency = 0;

  keywords.keywords.forEach(({ term, frequency }) => {
    const frequencyRatio = frequency / totalWords;
    
    if (frequencyRatio > threshold) {
      stuffedKeywords.push({
        term,
        frequency,
        frequencyRatio,
        percentage: (frequencyRatio * 100).toFixed(2)
      });
      maxFrequency = Math.max(maxFrequency, frequencyRatio);
    }
  });

  return {
    isStuffing: stuffedKeywords.length > 0,
    stuffedKeywords,
    maxFrequency,
    threshold
  };
}

/**
 * Calculate keyword match score using TF-IDF cosine similarity
 * 
 * @param {string} resumeText - Resume text
 * @param {string} jobText - Job description text
 * @returns {Object} Keyword match score and details
 */
export function calculateKeywordMatchScore(resumeText, jobText) {
  if (!resumeText || !jobText) {
    return {
      score: 0,
      similarity: 0,
      matchPercentage: 0,
      commonKeywords: [],
      missingKeywords: [],
      stuffedKeywords: [],
      explanation: 'No text provided for comparison'
    };
  }

  // Extract keywords from both texts
  const resumeKeywords = extractKeywords(resumeText, {
    minFrequency: 1,
    maxKeywords: 100,
    removeStopwords: true,
    includeNGrams: true
  });

  const jobKeywords = extractKeywords(jobText, {
    minFrequency: 1,
    maxKeywords: 100,
    removeStopwords: true,
    includeNGrams: true
  });

  // Calculate TF-IDF cosine similarity
  const similarity = calculateTextSimilarity(resumeText, jobText);

  // Compare keywords
  const comparison = compareKeywords(resumeKeywords, jobKeywords);

  // Detect keyword stuffing in resume
  const stuffingDetection = detectKeywordStuffing(resumeText, 0.03);

  // Calculate base score from cosine similarity (0-100)
  let baseScore = similarity * 100;

  // Penalty for keyword stuffing
  let stuffingPenalty = 0;
  if (stuffingDetection.isStuffing) {
    // Penalty: 5 points per stuffed keyword, max 30 points
    stuffingPenalty = Math.min(stuffingDetection.stuffedKeywords.length * 5, 30);
    baseScore = Math.max(0, baseScore - stuffingPenalty);
  }

  // Bonus for high keyword coverage
  const coverageBonus = comparison.matchScore * 10; // Additional 0-10 points
  const finalScore = Math.min(100, baseScore + coverageBonus);

  // Prepare explanation
  const explanation = buildKeywordMatchExplanation(
    finalScore,
    similarity,
    comparison,
    stuffingDetection,
    stuffingPenalty,
    coverageBonus
  );

  return {
    score: Math.round(finalScore * 100) / 100,
    similarity: Math.round(similarity * 1000) / 1000,
    matchPercentage: Math.round(comparison.matchScore * 100),
    commonKeywords: comparison.common,
    missingKeywords: comparison.unique2.map(k => ({
      term: k.term,
      frequency: k.frequency,
      category: k.category
    })),
    stuffedKeywords: stuffingDetection.stuffedKeywords,
    stuffingPenalty,
    coverageBonus: Math.round(coverageBonus * 100) / 100,
    explanation
  };
}

/**
 * Build explanation for keyword match score
 * 
 * @param {number} score - Final score
 * @param {number} similarity - Cosine similarity
 * @param {Object} comparison - Keyword comparison result
 * @param {Object} stuffingDetection - Stuffing detection result
 * @param {number} stuffingPenalty - Penalty applied
 * @param {number} coverageBonus - Bonus applied
 * @returns {string} Explanation text
 */
function buildKeywordMatchExplanation(score, similarity, comparison, stuffingDetection, stuffingPenalty, coverageBonus) {
  const parts = [];

  parts.push(`Keyword similarity: ${Math.round(similarity * 100)}% based on TF-IDF cosine similarity.`);

  if (comparison.common.length > 0) {
    parts.push(`Found ${comparison.common.length} common keywords between resume and job description.`);
  }

  if (comparison.unique2.length > 0) {
    parts.push(`${comparison.unique2.length} important keywords from job description are missing.`);
  }

  if (stuffingDetection.isStuffing) {
    parts.push(`⚠️ Keyword stuffing detected: ${stuffingDetection.stuffedKeywords.length} keywords repeated excessively (penalty: -${stuffingPenalty.toFixed(1)} points).`);
  } else {
    parts.push('✓ No keyword stuffing detected.');
  }

  if (coverageBonus > 0) {
    parts.push(`High keyword coverage bonus: +${coverageBonus.toFixed(1)} points.`);
  }

  return parts.join(' ');
}

