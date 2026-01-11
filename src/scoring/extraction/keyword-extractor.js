/**
 * Keyword Extraction
 * 
 * Extracts keywords from text with:
 * - Frequency analysis
 * - Proximity detection
 * - Stopword removal
 * - Skill normalization
 */

import { removeStopwords, filterStopwords } from './stopwords.js';
import { normalizeSkill } from './skill-normalizer.js';
import { categorizeSkill } from './skill-categorizer.js';

/**
 * Extract words from text
 * Handles various formats and punctuation
 * 
 * @param {string} text - Input text
 * @returns {string[]} Array of words
 */
function extractWords(text) {
  if (!text || typeof text !== 'string') {
    return [];
  }

  // Split by whitespace and common delimiters
  // Keep words with hyphens, dots (for abbreviations), and apostrophes
  const words = text
    .toLowerCase()
    .split(/[\s,\n\r\t]+/)
    .map(word => {
      // Remove punctuation from boundaries, but keep internal punctuation
      // Keep: react.js, node.js, c++, c#
      // Remove: leading/trailing punctuation
      return word.replace(/^[^\w\-.#]+|[^\w\-.#]+$/g, '');
    })
    .filter(word => {
      // Filter out empty strings and very short words
      return word.length > 2;
    });

  return words;
}

/**
 * Extract n-grams (phrases) from text
 * 
 * @param {string[]} words - Array of words
 * @param {number} n - Size of n-gram (2 = bigrams, 3 = trigrams)
 * @returns {string[]} Array of n-grams
 */
function extractNGrams(words, n = 2) {
  if (!Array.isArray(words) || words.length < n) {
    return [];
  }

  const ngrams = [];
  for (let i = 0; i <= words.length - n; i++) {
    const ngram = words.slice(i, i + n).join(' ');
    ngrams.push(ngram);
  }

  return ngrams;
}

/**
 * Calculate keyword frequency
 * 
 * @param {string[]} words - Array of words
 * @returns {Map<string, number>} Map of word to frequency
 */
function calculateFrequency(words) {
  const frequency = new Map();

  words.forEach(word => {
    const normalized = normalizeSkill(word);
    const count = frequency.get(normalized) || 0;
    frequency.set(normalized, count + 1);
  });

  return frequency;
}

/**
 * Extract keywords from text
 * 
 * @param {string} text - Input text
 * @param {Object} options - Extraction options
 * @param {number} options.minFrequency - Minimum frequency threshold (default: 1)
 * @param {number} options.maxKeywords - Maximum number of keywords (default: 100)
 * @param {boolean} options.includeNGrams - Include bigrams/trigrams (default: true)
 * @param {boolean} options.removeStopwords - Remove stopwords (default: true)
 * @returns {Object} Extracted keywords with frequency and metadata
 */
export function extractKeywords(text, options = {}) {
  if (!text || typeof text !== 'string') {
    return {
      keywords: [],
      frequency: new Map(),
      totalWords: 0,
      uniqueKeywords: 0
    };
  }

  const {
    minFrequency = 1,
    maxKeywords = 100,
    includeNGrams = true,
    removeStopwords: removeStop = true
  } = options;

  // Extract words
  let words = extractWords(text);

  // Remove stopwords
  if (removeStop) {
    words = filterStopwords(words, { includeTechnical: true });
  }

  // Extract n-grams if requested
  let allTerms = [...words];
  if (includeNGrams) {
    const bigrams = extractNGrams(words, 2);
    const trigrams = extractNGrams(words, 3);
    allTerms = [...words, ...bigrams, ...trigrams];
  }

  // Calculate frequency
  const frequency = calculateFrequency(allTerms);

  // Filter by minimum frequency and sort by frequency
  const keywords = Array.from(frequency.entries())
    .filter(([term, freq]) => freq >= minFrequency)
    .sort((a, b) => b[1] - a[1]) // Sort by frequency descending
    .slice(0, maxKeywords)
    .map(([term, freq]) => ({
      term,
      frequency: freq,
      category: categorizeSkill(term)
    }));

  return {
    keywords,
    frequency,
    totalWords: words.length,
    uniqueKeywords: keywords.length
  };
}

/**
 * Extract keywords with proximity information
 * 
 * @param {string} text - Input text
 * @param {Object} options - Extraction options
 * @returns {Object} Keywords with proximity data
 */
export function extractKeywordsWithProximity(text, options = {}) {
  const keywordData = extractKeywords(text, options);

  // Calculate term positions in text
  const words = extractWords(text);
  const termPositions = new Map();

  keywordData.keywords.forEach(({ term }) => {
    const positions = [];
    const termWords = term.split(' ');

    // Find all occurrences of the term
    for (let i = 0; i <= words.length - termWords.length; i++) {
      const window = words.slice(i, i + termWords.length).join(' ');
      if (window === term) {
        positions.push(i);
      }
    }

    termPositions.set(term, positions);
  });

  // Calculate proximity scores (how close terms appear to each other)
  const proximityScores = new Map();

  keywordData.keywords.forEach(({ term: term1 }) => {
    const proximityMap = new Map();
    const positions1 = termPositions.get(term1) || [];

    keywordData.keywords.forEach(({ term: term2 }) => {
      if (term1 === term2) {
        return;
      }

      const positions2 = termPositions.get(term2) || [];
      let minDistance = Infinity;
      let occurrences = 0;

      // Find minimum distance between occurrences
      positions1.forEach(pos1 => {
        positions2.forEach(pos2 => {
          const distance = Math.abs(pos1 - pos2);
          if (distance < minDistance) {
            minDistance = distance;
          }
          // Count occurrences within 10 words
          if (distance <= 10) {
            occurrences++;
          }
        });
      });

      if (minDistance < Infinity) {
        proximityMap.set(term2, {
          distance: minDistance,
          occurrences
        });
      }
    });

    if (proximityMap.size > 0) {
      proximityScores.set(term1, proximityMap);
    }
  });

  return {
    ...keywordData,
    proximity: proximityScores,
    positions: termPositions
  };
}

/**
 * Extract top keywords by category
 * 
 * @param {string} text - Input text
 * @param {Object} options - Extraction options
 * @returns {Object} Top keywords by category
 */
export function extractKeywordsByCategory(text, options = {}) {
  const keywordData = extractKeywords(text, options);

  const byCategory = {
    hard: [],
    soft: [],
    tools: [],
    roles: [],
    other: []
  };

  keywordData.keywords.forEach(keyword => {
    const category = keyword.category;
    if (byCategory[category]) {
      byCategory[category].push(keyword);
    } else {
      byCategory.other.push(keyword);
    }
  });

  return {
    ...keywordData,
    byCategory
  };
}

/**
 * Compare keywords between two texts
 * 
 * @param {Object} keywords1 - Keywords from first text
 * @param {Object} keywords2 - Keywords from second text
 * @returns {Object} Comparison results
 */
export function compareKeywords(keywords1, keywords2) {
  const terms1 = new Set(keywords1.keywords.map(k => k.term));
  const terms2 = new Set(keywords2.keywords.map(k => k.term));

  // Common keywords
  const common = Array.from(terms1).filter(term => terms2.has(term));
  
  // Unique to first text
  const unique1 = Array.from(terms1).filter(term => !terms2.has(term));
  
  // Unique to second text
  const unique2 = Array.from(terms2).filter(term => !terms1.has(term));

  // Calculate match score
  const total = terms1.size + terms2.size;
  const matchScore = total > 0 ? (common.length * 2) / total : 0;

  return {
    common: common.map(term => {
      const k1 = keywords1.keywords.find(k => k.term === term);
      const k2 = keywords2.keywords.find(k => k.term === term);
      return {
        term,
        frequency1: k1?.frequency || 0,
        frequency2: k2?.frequency || 0,
        category: k1?.category || k2?.category || 'other'
      };
    }),
    unique1: unique1.map(term => {
      const k1 = keywords1.keywords.find(k => k.term === term);
      return {
        term,
        frequency: k1?.frequency || 0,
        category: k1?.category || 'other'
      };
    }),
    unique2: unique2.map(term => {
      const k2 = keywords2.keywords.find(k => k.term === term);
      return {
        term,
        frequency: k2?.frequency || 0,
        category: k2?.category || 'other'
      };
    }),
    matchScore
  };
}

