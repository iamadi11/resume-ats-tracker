/**
 * Stopwords Removal
 * 
 * Provides stopword filtering for keyword extraction.
 * Stopwords are common words that don't carry much meaning.
 */

/**
 * Common English stopwords
 * Expanded list for technical content
 */
export const STOPWORDS = new Set([
  // Articles
  'a', 'an', 'the',
  
  // Pronouns
  'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours',
  'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers',
  'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves',
  'this', 'that', 'these', 'those',
  
  // Prepositions
  'at', 'by', 'for', 'from', 'in', 'into', 'of', 'on', 'onto', 'to', 'up', 'with',
  'about', 'above', 'across', 'after', 'against', 'along', 'among', 'around', 'before',
  'behind', 'below', 'beneath', 'beside', 'between', 'beyond', 'during', 'except',
  'inside', 'outside', 'through', 'throughout', 'toward', 'under', 'until', 'within',
  
  // Conjunctions
  'and', 'or', 'but', 'if', 'than', 'because', 'while', 'where', 'as', 'so',
  
  // Verbs (common)
  'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
  'having', 'do', 'does', 'did', 'doing', 'will', 'would', 'should', 'could',
  'may', 'might', 'must', 'can', 'shall',
  
  // Other common words
  'all', 'each', 'every', 'few', 'more', 'most', 'other', 'some', 'such', 'only',
  'own', 'same', 'than', 'too', 'very', 'just', 'now', 'then', 'here', 'there',
  'when', 'where', 'why', 'how', 'all', 'both', 'each', 'few', 'more', 'most',
  'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so',
  'than', 'too', 'very', 'can', 'will', 'just', 'should', 'now',
  
  // Resume/job specific (may want to keep some, but these are often noise)
  'experience', 'years', 'year', 'month', 'months', 'worked', 'working', 'work',
  'responsible', 'responsibility', 'responsibilities', 'duties', 'duty',
  'developed', 'develop', 'development', 'designed', 'design', 'designing',
  'implemented', 'implement', 'implementation', 'managed', 'manage', 'management',
  'led', 'lead', 'leading', 'collaborated', 'collaborate', 'collaboration',
  'created', 'create', 'creating', 'built', 'build', 'building',
  'improved', 'improve', 'improving', 'increased', 'increase', 'increasing',
  'maintained', 'maintain', 'maintaining', 'performed', 'perform', 'performing',
  'utilized', 'utilize', 'utilizing', 'used', 'use', 'using'
]);

/**
 * Technical stopwords (words that appear frequently but aren't useful keywords)
 */
export const TECHNICAL_STOPWORDS = new Set([
  'application', 'applications', 'system', 'systems', 'software', 'hardware',
  'technology', 'technologies', 'technical', 'technically', 'solution', 'solutions',
  'service', 'services', 'process', 'processes', 'procedure', 'procedures',
  'method', 'methods', 'methodology', 'methodologies', 'approach', 'approaches',
  'project', 'projects', 'task', 'tasks', 'feature', 'features', 'component', 'components',
  'module', 'modules', 'function', 'functions', 'functionality', 'capability', 'capabilities',
  'requirement', 'requirements', 'specification', 'specifications', 'documentation',
  'team', 'teams', 'department', 'departments', 'organization', 'organizations',
  'company', 'companies', 'business', 'businesses', 'client', 'clients', 'customer', 'customers',
  'user', 'users', 'data', 'database', 'databases', 'information', 'content'
]);

/**
 * Remove stopwords from text
 * 
 * @param {string} text - Input text
 * @param {Object} options - Options
 * @param {boolean} options.includeTechnical - Include technical stopwords (default: true)
 * @param {Set} options.customStopwords - Custom stopwords to add
 * @returns {string} Text with stopwords removed
 */
export function removeStopwords(text, options = {}) {
  if (!text || typeof text !== 'string') {
    return '';
  }

  const {
    includeTechnical = true,
    customStopwords = new Set()
  } = options;

  // Combine all stopword sets
  const allStopwords = new Set([...STOPWORDS]);
  if (includeTechnical) {
    TECHNICAL_STOPWORDS.forEach(word => allStopwords.add(word));
  }
  customStopwords.forEach(word => allStopwords.add(word));

  // Split text into words (handle punctuation)
  const words = text.toLowerCase().split(/\s+/).map(word => {
    // Remove punctuation from word boundaries
    return word.replace(/^[^\w]+|[^\w]+$/g, '');
  });

  // Filter out stopwords and empty strings
  const filtered = words.filter(word => {
    return word.length > 0 && !allStopwords.has(word);
  });

  return filtered.join(' ');
}

/**
 * Check if word is a stopword
 * 
 * @param {string} word - Word to check
 * @param {Object} options - Options
 * @returns {boolean} True if stopword
 */
export function isStopword(word, options = {}) {
  if (!word || typeof word !== 'string') {
    return true;
  }

  const {
    includeTechnical = true,
    customStopwords = new Set()
  } = options;

  const normalized = word.toLowerCase().replace(/[^\w]/g, '');

  if (STOPWORDS.has(normalized)) {
    return true;
  }

  if (includeTechnical && TECHNICAL_STOPWORDS.has(normalized)) {
    return true;
  }

  if (customStopwords.has(normalized)) {
    return true;
  }

  return false;
}

/**
 * Remove stopwords from array of words
 * 
 * @param {string[]} words - Array of words
 * @param {Object} options - Options
 * @returns {string[]} Filtered words
 */
export function filterStopwords(words, options = {}) {
  if (!Array.isArray(words)) {
    return [];
  }

  return words.filter(word => !isStopword(word, options));
}

