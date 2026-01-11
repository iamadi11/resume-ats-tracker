/**
 * TF-IDF (Term Frequency-Inverse Document Frequency) Utilities
 * 
 * Implements TF-IDF for keyword matching between resume and job description.
 * TF-IDF helps identify important keywords by weighting them based on:
 * - Term Frequency (TF): How often a term appears in a document
 * - Inverse Document Frequency (IDF): How rare/common a term is across documents
 */

/**
 * Calculate Term Frequency (TF) for a term in a document
 * 
 * @param {string} term - Term to calculate TF for
 * @param {string[]} document - Document as array of words
 * @returns {number} Term frequency (0-1)
 */
export function calculateTF(term, document) {
  if (!document || document.length === 0) {
    return 0;
  }

  const termLower = term.toLowerCase();
  const documentLower = document.map(w => w.toLowerCase());
  
  const termCount = documentLower.filter(word => word === termLower).length;
  const totalTerms = documentLower.length;

  // Normalized TF: count / total terms
  return termCount / totalTerms;
}

/**
 * Calculate Inverse Document Frequency (IDF) for a term
 * 
 * @param {string} term - Term to calculate IDF for
 * @param {string[][]} documents - Array of documents (each as array of words)
 * @returns {number} Inverse document frequency
 */
export function calculateIDF(term, documents) {
  if (!documents || documents.length === 0) {
    return 0;
  }

  const termLower = term.toLowerCase();
  let documentsContainingTerm = 0;

  documents.forEach(doc => {
    const docLower = doc.map(w => w.toLowerCase());
    if (docLower.includes(termLower)) {
      documentsContainingTerm++;
    }
  });

  if (documentsContainingTerm === 0) {
    return 0;
  }

  // IDF = log(total documents / documents containing term)
  return Math.log(documents.length / documentsContainingTerm);
}

/**
 * Calculate TF-IDF score for a term in a document
 * 
 * @param {string} term - Term
 * @param {string[]} document - Document as array of words
 * @param {string[][]} documents - All documents for IDF calculation
 * @returns {number} TF-IDF score
 */
export function calculateTFIDF(term, document, documents) {
  const tf = calculateTF(term, document);
  const idf = calculateIDF(term, documents);
  return tf * idf;
}

/**
 * Calculate TF-IDF vector for a document
 * 
 * @param {string[]} document - Document as array of words
 * @param {string[]} vocabulary - Vocabulary (all unique terms)
 * @param {string[][]} documents - All documents for IDF calculation
 * @returns {Map<string, number>} TF-IDF vector (term -> score)
 */
export function calculateTFIDFVector(document, vocabulary, documents) {
  const vector = new Map();

  vocabulary.forEach(term => {
    const tfidf = calculateTFIDF(term, document, documents);
    if (tfidf > 0) {
      vector.set(term, tfidf);
    }
  });

  return vector;
}

/**
 * Calculate cosine similarity between two TF-IDF vectors
 * 
 * @param {Map<string, number>} vector1 - First TF-IDF vector
 * @param {Map<string, number>} vector2 - Second TF-IDF vector
 * @returns {number} Cosine similarity (0-1)
 */
export function cosineSimilarity(vector1, vector2) {
  if (!vector1 || !vector2 || vector1.size === 0 || vector2.size === 0) {
    return 0;
  }

  // Get all unique terms from both vectors
  const allTerms = new Set([...vector1.keys(), ...vector2.keys()]);

  // Calculate dot product
  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;

  allTerms.forEach(term => {
    const value1 = vector1.get(term) || 0;
    const value2 = vector2.get(term) || 0;

    dotProduct += value1 * value2;
    magnitude1 += value1 * value1;
    magnitude2 += value2 * value2;
  });

  // Cosine similarity = dot product / (magnitude1 * magnitude2)
  const denominator = Math.sqrt(magnitude1) * Math.sqrt(magnitude2);
  
  if (denominator === 0) {
    return 0;
  }

  return dotProduct / denominator;
}

/**
 * Calculate TF-IDF similarity between resume and job description
 * 
 * @param {string[]} resumeWords - Resume as array of words
 * @param {string[]} jobWords - Job description as array of words
 * @returns {number} Similarity score (0-1)
 */
export function calculateSimilarity(resumeWords, jobWords) {
  // Create vocabulary from both documents
  const vocabulary = new Set([
    ...resumeWords.map(w => w.toLowerCase()),
    ...jobWords.map(w => w.toLowerCase())
  ]);

  const documents = [resumeWords, jobWords];

  // Calculate TF-IDF vectors
  const resumeVector = calculateTFIDFVector(resumeWords, Array.from(vocabulary), documents);
  const jobVector = calculateTFIDFVector(jobWords, Array.from(vocabulary), documents);

  // Calculate cosine similarity
  return cosineSimilarity(resumeVector, jobVector);
}

/**
 * Extract keywords with TF-IDF scores
 * 
 * @param {string[]} document - Document as array of words
 * @param {string[][]} documents - All documents
 * @param {number} minScore - Minimum TF-IDF score threshold
 * @returns {Array<{term: string, score: number}>} Keywords with scores
 */
export function extractKeywordsWithTFIDF(document, documents, minScore = 0.01) {
  const vocabulary = new Set(document.map(w => w.toLowerCase()));
  const keywords = [];

  vocabulary.forEach(term => {
    const tfidf = calculateTFIDF(term, document, documents);
    if (tfidf >= minScore) {
      keywords.push({ term, score: tfidf });
    }
  });

  // Sort by score descending
  keywords.sort((a, b) => b.score - a.score);

  return keywords;
}

