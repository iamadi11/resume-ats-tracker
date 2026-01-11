/**
 * Word Usage Analysis
 * 
 * Detects overused words and suggests alternatives.
 */

/**
 * Common overused words in resumes
 */
const OVERUSED_WORDS = new Map([
  ['experience', { alternatives: ['expertise', 'proficiency', 'background', 'track record'], severity: 'medium' }],
  ['experienced', { alternatives: ['proficient', 'skilled', 'expert', 'seasoned'], severity: 'medium' }],
  ['responsible', { alternatives: ['managed', 'led', 'oversaw', 'orchestrated'], severity: 'high' }],
  ['responsibilities', { alternatives: ['achievements', 'accomplishments', 'deliverables'], severity: 'high' }],
  ['duties', { alternatives: ['responsibilities', 'achievements', 'accomplishments'], severity: 'high' }],
  ['worked', { alternatives: ['developed', 'engineered', 'built', 'created'], severity: 'high' }],
  ['helped', { alternatives: ['collaborated', 'supported', 'facilitated', 'enabled'], severity: 'high' }],
  ['utilized', { alternatives: ['used', 'implemented', 'leveraged', 'applied'], severity: 'low' }],
  ['utilize', { alternatives: ['use', 'implement', 'leverage', 'apply'], severity: 'low' }],
  ['various', { alternatives: ['multiple', 'diverse', 'several', 'numerous'], severity: 'medium' }],
  ['various', { alternatives: ['multiple', 'diverse', 'several', 'numerous'], severity: 'medium' }],
  ['etc', { alternatives: ['and more', 'among others', 'and others'], severity: 'low' }],
  ['etc.', { alternatives: ['and more', 'among others', 'and others'], severity: 'low' }],
  ['etcetera', { alternatives: ['and more', 'among others', 'and others'], severity: 'low' }]
]);

/**
 * Threshold for considering a word "overused"
 * Percentage of total words
 */
const OVERUSE_THRESHOLD = 0.02; // 2% of total words

/**
 * Detect overused words
 * 
 * @param {string} text - Resume text
 * @returns {Object} Word usage analysis
 */
export function detectOverusedWords(text) {
  if (!text || typeof text !== 'string') {
    return {
      overused: [],
      suggestions: []
    };
  }

  // Extract words
  const words = text.toLowerCase()
    .split(/\s+/)
    .map(word => word.replace(/[^\w]/g, ''))
    .filter(word => word.length > 3); // Filter short words

  const totalWords = words.length;
  const wordFrequency = new Map();

  // Count word frequencies
  words.forEach(word => {
    wordFrequency.set(word, (wordFrequency.get(word) || 0) + 1);
  });

  // Find overused words
  const overused = [];

  OVERUSED_WORDS.forEach((data, word) => {
    const count = wordFrequency.get(word.toLowerCase()) || 0;
    const frequency = count / totalWords;

    if (frequency >= OVERUSE_THRESHOLD || count >= 3) {
      overused.push({
        word,
        count,
        frequency: (frequency * 100).toFixed(2) + '%',
        severity: data.severity,
        alternatives: data.alternatives,
        suggestion: `Consider replacing "${word}" with: ${data.alternatives.slice(0, 3).join(', ')}`
      });
    }
  });

  // Also detect generic words that appear too frequently
  const genericWords = ['the', 'a', 'an', 'and', 'or', 'but', 'with', 'for', 'from', 'to'];
  genericWords.forEach(word => {
    const count = wordFrequency.get(word) || 0;
    const frequency = count / totalWords;
    
    // Generic words can be more frequent, but flag if excessive
    if (frequency > 0.1) { // 10% threshold for generic words
      overused.push({
        word,
        count,
        frequency: (frequency * 100).toFixed(2) + '%',
        severity: 'low',
        alternatives: [],
        suggestion: `"${word}" appears very frequently. Consider varying sentence structure.`
      });
    }
  });

  // Sort by severity and frequency
  const severityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
  overused.sort((a, b) => {
    const severityDiff = (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0);
    if (severityDiff !== 0) return severityDiff;
    return b.count - a.count;
  });

  return {
    overused,
    totalOverused: overused.length,
    mostOverused: overused.slice(0, 5)
  };
}

