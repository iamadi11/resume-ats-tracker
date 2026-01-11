/**
 * Worker Utilities
 * 
 * Helper functions for Web Worker execution.
 * These functions are optimized for worker context.
 */

/**
 * Create a unique request ID
 * 
 * @returns {string} Unique ID
 */
export function createRequestId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Performance measurement wrapper
 * 
 * @param {Function} fn - Function to measure
 * @returns {Promise<{result: *, duration: number}>} Result and duration
 */
export async function measurePerformance(fn) {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;
  return { result, duration };
}

/**
 * Batch process items with chunking to avoid blocking
 * 
 * @param {Array} items - Items to process
 * @param {Function} processor - Processing function
 * @param {number} chunkSize - Items per chunk
 * @param {number} delay - Delay between chunks (ms)
 * @returns {Promise<Array>} Processed items
 */
export async function batchProcess(items, processor, chunkSize = 100, delay = 0) {
  const results = [];
  
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    const chunkResults = await Promise.all(chunk.map(processor));
    results.push(...chunkResults);
    
    // Yield to event loop between chunks
    if (delay > 0 && i + chunkSize < items.length) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return results;
}

/**
 * Memoize function results
 * 
 * @param {Function} fn - Function to memoize
 * @param {Function} keyFn - Key generation function
 * @returns {Function} Memoized function
 */
export function memoize(fn, keyFn = (...args) => JSON.stringify(args)) {
  const cache = new Map();
  
  return function(...args) {
    const key = keyFn(...args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn(...args);
    cache.set(key, result);
    
    // Limit cache size
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    return result;
  };
}

/**
 * Throttle function calls
 * 
 * @param {Function} fn - Function to throttle
 * @param {number} delay - Throttle delay (ms)
 * @returns {Function} Throttled function
 */
export function throttle(fn, delay) {
  let lastCall = 0;
  let timeoutId = null;
  
  return function(...args) {
    const now = Date.now();
    const timeSinceLastCall = now - lastCall;
    
    if (timeSinceLastCall >= delay) {
      lastCall = now;
      return fn(...args);
    }
    
    // Clear existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    // Schedule call
    timeoutId = setTimeout(() => {
      lastCall = Date.now();
      fn(...args);
    }, delay - timeSinceLastCall);
  };
}

