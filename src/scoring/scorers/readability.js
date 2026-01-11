/**
 * Readability & Length Scorer (10% weight)
 * 
 * Scores resume based on:
 * 1. Readability (sentence length, complexity)
 * 2. Length (appropriate resume length)
 * 3. Clarity (concise language)
 * 4. Structure (well-organized)
 */

/**
 * Calculate readability metrics
 * 
 * @param {string} text - Resume text
 * @returns {Object} Readability metrics
 */
export function calculateReadabilityMetrics(text) {
  if (!text || typeof text !== 'string') {
    return {
      wordCount: 0,
      sentenceCount: 0,
      avgWordsPerSentence: 0,
      avgCharsPerWord: 0,
      fleschScore: 0
    };
  }

  // Word count
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;

  // Sentence count (split by periods, exclamation, question marks)
  const sentences = text.split(/[.!?]+\s+/).filter(s => s.trim().length > 0);
  const sentenceCount = sentences.length;

  // Average words per sentence
  const avgWordsPerSentence = sentenceCount > 0 ? wordCount / sentenceCount : 0;

  // Average characters per word
  const totalChars = words.join('').length;
  const avgCharsPerWord = wordCount > 0 ? totalChars / wordCount : 0;

  // Flesch Reading Ease (simplified)
  // Formula: 206.835 - (1.015 * ASL) - (84.6 * ASW)
  // ASL = Average Sentence Length (words per sentence)
  // ASW = Average Syllables per Word (simplified: chars per word / 2.5)
  const avgSyllablesPerWord = avgCharsPerWord / 2.5; // Approximation
  const fleschScore = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);

  return {
    wordCount,
    sentenceCount,
    avgWordsPerSentence,
    avgCharsPerWord,
    fleschScore: Math.max(0, Math.min(100, fleschScore))
  };
}

/**
 * Calculate readability & length score
 * 
 * @param {string} resumeText - Resume text
 * @returns {Object} Readability & length score
 */
export function calculateReadabilityScore(resumeText) {
  if (!resumeText || typeof resumeText !== 'string') {
    return {
      score: 0,
      metrics: {},
      issues: [],
      explanation: 'No resume text provided'
    };
  }

  const metrics = calculateReadabilityMetrics(resumeText);
  const issues = [];
  let score = 100;

  // Check word count (resume should be 400-800 words for ATS)
  // Ideal: 500-700 words
  if (metrics.wordCount < 300) {
    issues.push({
      type: 'too_short',
      severity: 'medium',
      message: `Resume is too short (${metrics.wordCount} words). ATS prefers 400-800 words.`,
      penalty: 15
    });
    score -= 15;
  } else if (metrics.wordCount < 400) {
    issues.push({
      type: 'short',
      severity: 'low',
      message: `Resume is slightly short (${metrics.wordCount} words). Consider expanding to 400-800 words.`,
      penalty: 8
    });
    score -= 8;
  } else if (metrics.wordCount > 1200) {
    issues.push({
      type: 'too_long',
      severity: 'medium',
      message: `Resume is too long (${metrics.wordCount} words). ATS prefers 400-800 words.`,
      penalty: 15
    });
    score -= 15;
  } else if (metrics.wordCount > 800) {
    issues.push({
      type: 'long',
      severity: 'low',
      message: `Resume is slightly long (${metrics.wordCount} words). Consider condensing to 400-800 words.`,
      penalty: 8
    });
    score -= 8;
  }

  // Check sentence length (average should be 10-20 words)
  if (metrics.avgWordsPerSentence > 25) {
    issues.push({
      type: 'long_sentences',
      severity: 'medium',
      message: `Average sentence length is ${metrics.avgWordsPerSentence.toFixed(1)} words. Aim for 10-20 words.`,
      penalty: 10
    });
    score -= 10;
  } else if (metrics.avgWordsPerSentence > 20) {
    issues.push({
      type: 'slightly_long_sentences',
      severity: 'low',
      message: `Average sentence length is ${metrics.avgWordsPerSentence.toFixed(1)} words. Consider shorter sentences.`,
      penalty: 5
    });
    score -= 5;
  }

  // Check Flesch score (should be 60+ for good readability)
  if (metrics.fleschScore < 50) {
    issues.push({
      type: 'low_readability',
      severity: 'high',
      message: `Readability score is ${metrics.fleschScore.toFixed(1)}. Aim for 60+ for better clarity.`,
      penalty: 15
    });
    score -= 15;
  } else if (metrics.fleschScore < 60) {
    issues.push({
      type: 'moderate_readability',
      severity: 'medium',
      message: `Readability score is ${metrics.fleschScore.toFixed(1)}. Consider simpler language.`,
      penalty: 8
    });
    score -= 8;
  }

  // Check for overly complex words (words > 10 characters)
  const longWords = resumeText.split(/\s+/).filter(w => w.length > 10).length;
  const longWordRatio = metrics.wordCount > 0 ? longWords / metrics.wordCount : 0;
  
  if (longWordRatio > 0.15) { // More than 15% long words
    issues.push({
      type: 'complex_words',
      severity: 'low',
      message: 'Too many complex words. Consider simpler alternatives.',
      penalty: 5
    });
    score -= 5;
  }

  const finalScore = Math.max(0, score);

  // Build explanation
  const explanation = buildReadabilityExplanation(finalScore, metrics, issues);

  return {
    score: Math.round(finalScore * 100) / 100,
    metrics,
    issues,
    explanation
  };
}

/**
 * Build explanation for readability & length score
 * 
 * @param {number} score - Final score
 * @param {Object} metrics - Readability metrics
 * @param {Array} issues - Detected issues
 * @returns {string} Explanation text
 */
function buildReadabilityExplanation(score, metrics, issues) {
  const parts = [];

  parts.push(`Readability & length: ${Math.round(score)}/100.`);

  // Word count
  if (metrics.wordCount >= 400 && metrics.wordCount <= 800) {
    parts.push(`✓ Good length (${metrics.wordCount} words).`);
  } else {
    parts.push(`Word count: ${metrics.wordCount} words (ideal: 400-800).`);
  }

  // Sentence length
  if (metrics.avgWordsPerSentence >= 10 && metrics.avgWordsPerSentence <= 20) {
    parts.push(`✓ Good sentence length (${metrics.avgWordsPerSentence.toFixed(1)} words/sentence).`);
  } else {
    parts.push(`Average sentence length: ${metrics.avgWordsPerSentence.toFixed(1)} words (ideal: 10-20).`);
  }

  // Readability
  if (metrics.fleschScore >= 60) {
    parts.push(`✓ Good readability (score: ${metrics.fleschScore.toFixed(1)}).`);
  } else {
    parts.push(`Readability score: ${metrics.fleschScore.toFixed(1)} (aim for 60+).`);
  }

  if (issues.length === 0) {
    parts.push('✓ Resume is well-structured and readable.');
  } else {
    parts.push(`Issues found: ${issues.length}.`);
  }

  return parts.join(' ');
}

