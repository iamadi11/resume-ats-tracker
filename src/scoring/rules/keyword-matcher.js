/**
 * Keyword Matching Rules
 * 
 * Matches keywords between resume and job description.
 * Uses TF-IDF and cosine similarity for semantic matching.
 * Detects keyword stuffing and penalizes it.
 */

import { calculateSimilarity, extractKeywordsWithTFIDF } from '../utils/tfidf.js';
import { extractKeywords } from '../extraction/keyword-extractor.js';

/**
 * Detect keyword stuffing in text
 * Keyword stuffing: excessive repetition of keywords to game ATS systems
 * 
 * @param {string} text - Text to analyze
 * @param {string[]} keywords - Keywords to check for stuffing
 * @returns {Object} Stuffing detection result
 */
export function detectKeywordStuffing(text, keywords) {
  if (!text || !keywords || keywords.length === 0) {
    return {
      isStuffing: false,
      score: 0,
      stuffedKeywords: [],
      details: {}
    };
  }

  const words = text.toLowerCase().split(/\s+/);
  const totalWords = words.length;
  const stuffedKeywords = [];
  const details = {};

  // Threshold: if a keyword appears more than 5% of total words, it's likely stuffing
  const stuffingThreshold = Math.max(0.05, 10 / totalWords); // At least 10 occurrences or 5%

  keywords.forEach(keyword => {
    const keywordLower = keyword.toLowerCase();
    const keywordWords = keywordLower.split(/\s+/);
    
    // Count occurrences (handle multi-word keywords)
    let occurrences = 0;
    for (let i = 0; i <= words.length - keywordWords.length; i++) {
      const window = words.slice(i, i + keywordWords.length).join(' ');
      if (window === keywordLower) {
        occurrences++;
      }
    }

    const frequency = occurrences / totalWords;

    if (frequency > stuffingThreshold) {
      stuffedKeywords.push({
        keyword,
        occurrences,
        frequency,
        threshold: stuffingThreshold
      });
      
      details[keyword] = {
        occurrences,
        frequency,
        threshold: stuffingThreshold,
        isStuffing: true
      };
    } else {
      details[keyword] = {
        occurrences,
        frequency,
        threshold: stuffingThreshold,
        isStuffing: false
      };
    }
  });

  // Calculate stuffing score (0-1, higher = more stuffing)
  const stuffingScore = stuffedKeywords.length > 0
    ? Math.min(1, stuffedKeywords.reduce((sum, item) => sum + item.frequency, 0) / 0.2)
    : 0;

  return {
    isStuffing: stuffedKeywords.length > 0,
    score: stuffingScore,
    stuffedKeywords,
    details
  };
}

/**
 * Match keywords between resume and job description
 * 
 * @param {string} resumeText - Resume text
 * @param {string} jobText - Job description text
 * @returns {Object} Keyword matching result
 */
export function matchKeywords(resumeText, jobText) {
  if (!resumeText || !jobText) {
    return {
      score: 0,
      matchedKeywords: [],
      missingKeywords: [],
      similarity: 0,
      stuffing: null,
      details: {}
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

  // Convert to word arrays for TF-IDF
  const resumeWords = resumeText.toLowerCase().split(/\s+/);
  const jobWords = jobText.toLowerCase().split(/\s+/);

  // Calculate TF-IDF similarity
  const similarity = calculateSimilarity(resumeWords, jobWords);

  // Find matched and missing keywords
  const resumeTerms = new Set(resumeKeywords.keywords.map(k => k.term.toLowerCase()));
  const jobTerms = new Set(jobKeywords.keywords.map(k => k.term.toLowerCase()));

  const matchedKeywords = jobKeywords.keywords
    .filter(k => resumeTerms.has(k.term.toLowerCase()))
    .map(k => ({
      term: k.term,
      frequency: k.frequency,
      category: k.category,
      resumeFrequency: resumeKeywords.keywords.find(rk => 
        rk.term.toLowerCase() === k.term.toLowerCase()
      )?.frequency || 0
    }));

  const missingKeywords = jobKeywords.keywords
    .filter(k => !resumeTerms.has(k.term.toLowerCase()))
    .map(k => ({
      term: k.term,
      frequency: k.frequency,
      category: k.category
    }));

  // Detect keyword stuffing in resume
  const stuffing = detectKeywordStuffing(
    resumeText,
    resumeKeywords.keywords.map(k => k.term)
  );

  // Calculate match score
  // Base score: percentage of job keywords found
  const baseScore = jobTerms.size > 0 
    ? matchedKeywords.length / jobTerms.size 
    : 0;

  // Combine with TF-IDF similarity
  // Weight: 70% base match, 30% similarity
  const matchScore = (baseScore * 0.7) + (similarity * 0.3);

  // Apply stuffing penalty
  // Penalty: reduce score by stuffing score (max 20% reduction)
  const stuffingPenalty = stuffing.score * 0.2;
  const finalScore = Math.max(0, matchScore * (1 - stuffingPenalty));

  return {
    score: finalScore,
    matchedKeywords,
    missingKeywords,
    similarity,
    stuffing,
    details: {
      totalJobKeywords: jobTerms.size,
      matchedCount: matchedKeywords.length,
      missingCount: missingKeywords.length,
      matchPercentage: baseScore,
      tfidfSimilarity: similarity,
      stuffingPenalty: stuffingPenalty,
      finalScore
    }
  };
}

