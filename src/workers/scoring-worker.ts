/**
 * Scoring Web Worker
 * 
 * Runs ATS scoring calculations in a separate thread to avoid blocking the UI.
 * Handles heavy computations: TF-IDF, keyword matching, skill alignment, etc.
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
self.onmessage = async function(e: MessageEvent<{ type: string; payload: any; id: string }>) {
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
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
};

/**
 * Handle score calculation
 */
async function handleCalculateScore(payload: any, id: string) {
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
    const { calculateATSScore } = await import('../scoring/scoring-engine.js');
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
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}

/**
 * Handle keyword extraction
 */
async function handleExtractKeywords(payload: any, id: string) {
  const startTime = performance.now();
  
  try {
    const { text, options } = payload;
    const { extractKeywords } = await import('../scoring/extraction/keyword-extractor.js');
    
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
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Handle keyword matching
 */
async function handleMatchKeywords(payload: any, id: string) {
  const startTime = performance.now();
  
  try {
    const { resumeText, jobText } = payload;
    const { matchKeywords } = await import('../scoring/rules/keyword-matcher.js');
    
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
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Update performance metrics
 */
function updatePerformanceMetrics(duration: number) {
  performanceMetrics.totalCalculations++;
  performanceMetrics.totalDuration += duration;
  performanceMetrics.averageDuration = performanceMetrics.totalDuration / performanceMetrics.totalCalculations;
  performanceMetrics.minDuration = Math.min(performanceMetrics.minDuration, duration);
  performanceMetrics.maxDuration = Math.max(performanceMetrics.maxDuration, duration);
}

/**
 * Handle performance query
 */
function handleGetPerformance(id: string) {
  self.postMessage({
    type: 'PERFORMANCE_METRICS',
    id,
    payload: performanceMetrics
  });
}

