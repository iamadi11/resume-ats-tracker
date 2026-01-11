/**
 * Scoring Web Worker
 * 
 * Runs ATS scoring calculations in a separate thread to avoid blocking the UI.
 * Handles heavy computations: TF-IDF, keyword matching, skill alignment, etc.
 * 
 * Note: For Chrome extensions, workers need to be loaded from extension root.
 * This worker will be bundled separately and loaded via importScripts or dynamic import.
 */

// Performance tracking
const performanceMetrics = {
  totalCalculations: 0,
  totalDuration: 0,
  averageDuration: 0,
  minDuration: Infinity,
  maxDuration: 0
};

/**
 * Message handler for worker
 */
self.onmessage = async function(e) {
  const { type, payload, id } = e.data;

  try {
    switch (type) {
      case 'CALCULATE_SCORE':
        await handleCalculateScore(payload, id);
        break;
      
      case 'EXTRACT_KEYWORDS':
        await handleExtractKeywords(payload, id);
        break;
      
      case 'MATCH_KEYWORDS':
        await handleMatchKeywords(payload, id);
        break;
      
      case 'GET_PERFORMANCE':
        handleGetPerformance(id);
        break;
      
      default:
        self.postMessage({
          type: 'ERROR',
          id,
          error: `Unknown message type: ${type}`
        });
    }
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      id,
      error: error.message,
      stack: error.stack
    });
  }
};

/**
 * Handle score calculation
 * 
 * @param {Object} payload - Calculation payload
 * @param {string} id - Request ID
 */
async function handleCalculateScore(payload, id) {
  const startTime = performance.now();
  
  const { resumeText, jobText, resume } = payload;

  if (!resumeText || !jobText) {
    self.postMessage({
      type: 'SCORE_CALCULATED',
      id,
      payload: {
        overallScore: 0,
        error: 'Missing resume or job description'
      },
      performance: {
        duration: performance.now() - startTime
      }
    });
    return;
  }

  try {
    // Import scoring engine dynamically
    // Note: In Chrome extension context, imports may need special handling
    // For now, we'll use a fallback approach
    let calculateATSScore;
    
    // Import scoring engine dynamically
    const module = await import('../scoring-engine.js');
    calculateATSScore = module.calculateATSScore;
    
    const result = calculateATSScore(resumeText, jobText, resume);
    
    const duration = performance.now() - startTime;
    updatePerformanceMetrics(duration);

    self.postMessage({
      type: 'SCORE_CALCULATED',
      id,
      payload: result,
      performance: {
        duration,
        timestamp: Date.now()
      }
    });
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      id,
      error: error.message,
      stack: error.stack
    });
  }
}

/**
 * Handle keyword extraction
 * 
 * @param {Object} payload - Extraction payload
 * @param {string} id - Request ID
 */
async function handleExtractKeywords(payload, id) {
  const startTime = performance.now();
  
  try {
    const { text, options } = payload;
    const { extractKeywords } = await import('../extraction/keyword-extractor.js');
    
    const result = extractKeywords(text, options);
    
    self.postMessage({
      type: 'KEYWORDS_EXTRACTED',
      id,
      payload: result,
      performance: {
        duration: performance.now() - startTime
      }
    });
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      id,
      error: error.message
    });
  }
}

/**
 * Handle keyword matching
 * 
 * @param {Object} payload - Matching payload
 * @param {string} id - Request ID
 */
async function handleMatchKeywords(payload, id) {
  const startTime = performance.now();
  
  try {
    const { resumeText, jobText } = payload;
    const { matchKeywords } = await import('../rules/keyword-matcher.js');
    
    const result = matchKeywords(resumeText, jobText);
    
    self.postMessage({
      type: 'KEYWORDS_MATCHED',
      id,
      payload: result,
      performance: {
        duration: performance.now() - startTime
      }
    });
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      id,
      error: error.message
    });
  }
}

/**
 * Update performance metrics
 */
function updatePerformanceMetrics(duration) {
  performanceMetrics.totalCalculations++;
  performanceMetrics.totalDuration += duration;
  performanceMetrics.averageDuration = performanceMetrics.totalDuration / performanceMetrics.totalCalculations;
  performanceMetrics.minDuration = Math.min(performanceMetrics.minDuration, duration);
  performanceMetrics.maxDuration = Math.max(performanceMetrics.maxDuration, duration);
}

/**
 * Handle performance query
 */
function handleGetPerformance(id) {
  self.postMessage({
    type: 'PERFORMANCE_METRICS',
    id,
    payload: performanceMetrics
  });
}

