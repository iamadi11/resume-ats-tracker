/**
 * TF-IDF (Term Frequency-Inverse Document Frequency) Utilities
 * 
 * Used for calculating keyword importance and similarity between documents.
 * 
 * TF-IDF Formula:
 * TF(t, d) = count(t in d) / total words in d
 * IDF(t, D) = log(total documents / documents containing t)
 * TF-IDF(t, d, D) = TF(t, d) * IDF(t, D)
 */

/**
 * Calculate term frequency (TF) for a term in a document
 * 
 * @param {string} term - Term to calculate TF for
 * @param {string[]} document - Array of words in document
 * @returns {number} Term frequency (0-1)
 */
export function calculateTF(term, document) {
  if (!document || document.length === 0) {
    return 0;
  }

  const termLower = term.toLowerCase();
  const count = document.filter(word => word.toLowerCase() === termLower).length;
  return count / document.length;
}

/**
 * Calculate inverse document frequency (IDF) for a term
 * 
 * @param {string} term - Term to calculate IDF for
 * @param {string[][]} documents - Array of documents (each is array of words)
 * @returns {number} Inverse document frequency
 */
export function calculateIDF(term, documents) {
  if (!documents || documents.length === 0) {
    return 0;
  }

  const termLower = term.toLowerCase();
  const documentsContainingTerm = documents.filter(doc => 
    doc.some(word => word.toLowerCase() === termLower)
  ).length;

  if (documentsContainingTerm === 0) {
    return 0;
  }

  // IDF = log(total documents / documents containing term)
  return Math.log(documents.length / documentsContainingTerm);
}

/**
 * Calculate TF-IDF for a term in a document
 * 
 * @param {string} term - Term
 * @param {string[]} document - Document (array of words)
 * @param {string[][]} documents - All documents (for IDF calculation)
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
 * @param {string[]} document - Document (array of words)
 * @param {string[][]} documents - All documents
 * @param {string[]} vocabulary - All unique terms (vocabulary)
 * @returns {Map<string, number>} TF-IDF vector (term -> score)
 */
export function calculateTFIDFVector(document, documents, vocabulary) {
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
 * Formula: cos(θ) = (A · B) / (||A|| * ||B||)
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
  allTerms.forEach(term => {
    const val1 = vector1.get(term) || 0;
    const val2 = vector2.get(term) || 0;
    dotProduct += val1 * val2;
  });

  // Calculate magnitudes
  let magnitude1 = 0;
  vector1.forEach(value => {
    magnitude1 += value * value;
  });
  magnitude1 = Math.sqrt(magnitude1);

  let magnitude2 = 0;
  vector2.forEach(value => {
    magnitude2 += value * value;
  });
  magnitude2 = Math.sqrt(magnitude2);

  // Cosine similarity
  if (magnitude1 === 0 || magnitude2 === 0) {
    return 0;
  }

  return dotProduct / (magnitude1 * magnitude2);
}

/**
 * Build vocabulary from multiple documents
 * 
 * @param {string[][]} documents - Array of documents (each is array of words)
 * @returns {string[]} Unique vocabulary terms
 */
export function buildVocabulary(documents) {
  const vocabulary = new Set();

  documents.forEach(document => {
    document.forEach(word => {
      vocabulary.add(word.toLowerCase());
    });
  });

  return Array.from(vocabulary);
}

/**
 * Calculate similarity between two text documents using TF-IDF
 * 
 * @param {string} text1 - First document text
 * @param {string} text2 - Second document text
 * @returns {number} Cosine similarity (0-1)
 */
export function calculateTextSimilarity(text1, text2) {
  if (!text1 || !text2) {
    return 0;
  }

  // Tokenize texts
  const words1 = text1.toLowerCase().split(/\s+/).filter(w => w.length > 0);
  const words2 = text2.toLowerCase().split(/\s+/).filter(w => w.length > 0);

  // Build documents array
  const documents = [words1, words2];

  // Build vocabulary
  const vocabulary = buildVocabulary(documents);

  // Calculate TF-IDF vectors
  const vector1 = calculateTFIDFVector(words1, documents, vocabulary);
  const vector2 = calculateTFIDFVector(words2, documents, vocabulary);

  // Calculate cosine similarity
  return cosineSimilarity(vector1, vector2);
}

