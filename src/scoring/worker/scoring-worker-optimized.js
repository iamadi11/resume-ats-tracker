/**
 * Optimized Scoring Worker
 * 
 * Web Worker implementation optimized for performance.
 * Uses efficient algorithms and avoids unnecessary work.
 */

import { calculateATSScoreOptimized } from '../optimized-scorer.js';

// Performance tracking
const performanceMetrics = {
  totalCalculations: 0,
  totalDuration: 0,
  averageDuration: 0,
  minDuration: Infinity,
  maxDuration: 0,
  cacheHits: 0,
  cacheMisses: 0
};

// Result cache (limited size)
const resultCache = new Map();
const MAX_CACHE_SIZE = 10;

/**
 * Message handler
 */
self.onmessage = function(e) {
  const { type, payload, id } = e.data;

  try {
    switch (type) {
      case 'CALCULATE_SCORE':
        handleCalculateScore(payload, id);
        break;
      
      case 'GET_PERFORMANCE':
        handleGetPerformance(id);
        break;
      
      case 'CLEAR_CACHE':
        resultCache.clear();
        performanceMetrics.cacheHits = 0;
        performanceMetrics.cacheMisses = 0;
        self.postMessage({ type: 'CACHE_CLEARED', id });
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
    // Calculate score with optimization
    const result = calculateATSScoreOptimized(resumeText, jobText, resume, resultCache);
    
    const duration = performance.now() - startTime;

    // Update performance metrics
    updatePerformanceMetrics(duration);

    self.postMessage({
      type: 'SCORE_CALCULATED',
      id,
      payload: result,
      performance: {
        duration,
        timestamp: Date.now(),
        cacheHit: resultCache.has(getCacheKey(resumeText, jobText))
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
 * Handle performance query
 */
function handleGetPerformance(id) {
  self.postMessage({
    type: 'PERFORMANCE_METRICS',
    id,
    payload: {
      ...performanceMetrics,
      cacheSize: resultCache.size,
      cacheHitRate: performanceMetrics.totalCalculations > 0
        ? performanceMetrics.cacheHits / performanceMetrics.totalCalculations
        : 0
    }
  });
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
 * Generate cache key
 */
function getCacheKey(resumeText, jobText) {
  // Use hash of text lengths and first/last parts for quick comparison
  return `${resumeText.length}-${jobText.length}-${resumeText.substring(0, 50)}-${jobText.substring(0, 50)}`;
}

