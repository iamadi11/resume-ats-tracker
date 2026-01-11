/**
 * Readability & Length Rules
 * 
 * Checks resume readability and appropriate length.
 * ATS systems and recruiters prefer clear, concise resumes.
 */

/**
 * Calculate readability score
 * 
 * @param {string} text - Resume text
 * @returns {Object} Readability result
 */
export function checkReadability(text) {
  if (!text) {
    return {
      score: 0,
      wordCount: 0,
      issues: [],
      warnings: [],
      details: {}
    };
  }

  const issues = [];
  const warnings = [];
  let score = 100;

  // Calculate basic statistics
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, '').length;

  // Check 1: Word count (optimal: 400-800 words)
  if (wordCount < 200) {
    issues.push({
      type: 'too_short',
      severity: 'high',
      message: `Resume is too short (${wordCount} words). Recommended: 400-800 words.`,
      penalty: 20
    });
    score -= 20;
  } else if (wordCount < 400) {
    warnings.push({
      type: 'short',
      message: `Resume is on the shorter side (${wordCount} words). Consider adding more detail.`
    });
  } else if (wordCount > 1200) {
    issues.push({
      type: 'too_long',
      severity: 'medium',
      message: `Resume is quite long (${wordCount} words). Recommended: 400-800 words for most roles.`,
      penalty: 10
    });
    score -= 10;
  } else if (wordCount > 800) {
    warnings.push({
      type: 'long',
      message: `Resume is on the longer side (${wordCount} words). Consider condensing.`
    });
  }

  // Check 2: Average sentence length (optimal: 15-20 words)
  const avgSentenceLength = sentences.length > 0 ? wordCount / sentences.length : 0;
  if (avgSentenceLength > 25) {
    issues.push({
      type: 'long_sentences',
      severity: 'medium',
      message: `Average sentence length is ${avgSentenceLength.toFixed(1)} words. Recommended: 15-20 words.`,
      penalty: 5
    });
    score -= 5;
  } else if (avgSentenceLength > 20) {
    warnings.push({
      type: 'sentence_length',
      message: `Average sentence length is ${avgSentenceLength.toFixed(1)} words. Consider shorter sentences.`
    });
  }

  // Check 3: Paragraph length (should be reasonable)
  const avgParagraphLength = paragraphs.length > 0 ? wordCount / paragraphs.length : 0;
  if (avgParagraphLength > 150) {
    warnings.push({
      type: 'paragraph_length',
      message: `Average paragraph length is ${avgParagraphLength.toFixed(1)} words. Consider breaking into smaller paragraphs.`
    });
  }

  // Check 4: Character density (characters per word)
  const charsPerWord = wordCount > 0 ? charactersNoSpaces / wordCount : 0;
  if (charsPerWord > 6) {
    warnings.push({
      type: 'word_complexity',
      message: 'High character-to-word ratio (may indicate complex/long words)'
    });
  }

  // Check 5: Bullet point usage (should have reasonable number)
  const bulletCount = (text.match(/^[•\-\*]\s+/gm) || []).length;
  const bulletRatio = wordCount > 0 ? bulletCount / wordCount : 0;
  
  if (bulletRatio > 0.15) {
    warnings.push({
      type: 'bullet_density',
      message: 'Very high bullet point density (may indicate poor narrative flow)'
    });
  } else if (bulletRatio < 0.05 && wordCount > 500) {
    warnings.push({
      type: 'bullet_usage',
      message: 'Low bullet point usage (consider using bullets for achievements)'
    });
  }

  // Check 6: Section balance (should have multiple sections)
  const sectionHeaders = text.match(/^(experience|education|skills|summary|objective|projects|certifications|awards):?$/gim);
  const sectionCount = sectionHeaders ? sectionHeaders.length : 0;
  
  if (sectionCount < 2) {
    issues.push({
      type: 'section_structure',
      severity: 'medium',
      message: `Only ${sectionCount} section(s) detected. Recommended: 4-6 sections.`,
      penalty: 10
    });
    score -= 10;
  } else if (sectionCount < 4) {
    warnings.push({
      type: 'section_count',
      message: `Only ${sectionCount} section(s) detected. Consider adding more sections.`
    });
  }

  // Check 7: Repetition (repeated phrases)
  const wordsLower = words.map(w => w.toLowerCase());
  const wordFreq = new Map();
  wordsLower.forEach(word => {
    wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
  });

  const repeatedWords = Array.from(wordFreq.entries())
    .filter(([word, count]) => count > 10 && word.length > 4)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  if (repeatedWords.length > 0) {
    warnings.push({
      type: 'repetition',
      message: `Some words are repeated frequently: ${repeatedWords.map(([w]) => w).join(', ')}`
    });
  }

  // Check 8: Readability (Flesch Reading Ease approximation)
  // Simplified: average words per sentence, average syllables per word
  // We'll use character count as a proxy for syllables
  const avgWordsPerSentence = sentences.length > 0 ? wordCount / sentences.length : 0;
  const avgCharsPerWord = wordCount > 0 ? charactersNoSpaces / wordCount : 0;
  
  // Simplified readability score (higher = easier to read)
  // Optimal: 15-20 words/sentence, 4-5 chars/word
  let readabilityScore = 100;
  if (avgWordsPerSentence > 20) {
    readabilityScore -= (avgWordsPerSentence - 20) * 2;
  }
  if (avgCharsPerWord > 5.5) {
    readabilityScore -= (avgCharsPerWord - 5.5) * 10;
  }
  readabilityScore = Math.max(0, readabilityScore);

  if (readabilityScore < 60) {
    warnings.push({
      type: 'readability',
      message: 'Resume may be difficult to read (consider shorter sentences and simpler words)'
    });
  }

  // Ensure score doesn't go below 0
  score = Math.max(0, score);

  // Normalize to 0-1 scale
  const normalizedScore = score / 100;

  return {
    score: normalizedScore,
    wordCount,
    issues,
    warnings,
    details: {
      sentences: sentences.length,
      paragraphs: paragraphs.length,
      characters,
      avgSentenceLength: avgSentenceLength.toFixed(1),
      avgParagraphLength: avgParagraphLength.toFixed(1),
      bulletCount,
      sectionCount,
      readabilityScore: readabilityScore.toFixed(1),
      rawScore: score
    }
  };
}

