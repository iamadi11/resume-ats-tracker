/**
 * Debounced Scoring Hook
 * 
 * Provides debounced scoring calculation to avoid excessive computations
 * while user is typing or editing.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { ATSResult } from '../types';

interface UseDebouncedScoreOptions {
  delay?: number; // Debounce delay in milliseconds
  minTextLength?: number; // Minimum text length to trigger calculation
  enabled?: boolean; // Whether scoring is enabled
}

/**
 * Hook for debounced score calculation
 * 
 * @param options - Debounce options
 * @returns Score result and loading state
 */
export function useDebouncedScore(options: UseDebouncedScoreOptions = {}) {
  const {
    delay = 500, // Default 500ms debounce
    minTextLength = 50,
    enabled = true
  } = options;

  const { state } = useApp();
  const [debouncedScore, setDebouncedScore] = useState<ATSResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const calculateScore = useCallback(async () => {
    if (!enabled) return;
    if (!state.resume || !state.jobDescription) {
      setDebouncedScore(null);
      return;
    }

    const resumeText = state.resume.rawText || '';
    const jobText = state.jobDescription.text || '';

    // Check minimum length
    if (resumeText.length < minTextLength || jobText.length < minTextLength) {
      setDebouncedScore(null);
      return;
    }

    // Cancel previous calculation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setIsCalculating(true);

    try {
      // Use worker for calculation
      const result = await calculateScoreWithWorker(
        resumeText,
        jobText,
        state.resume,
        signal
      );

      if (!signal.aborted) {
        setDebouncedScore(result);
      }
    } catch (error) {
      if (!signal.aborted) {
        console.error('Score calculation error:', error);
        setDebouncedScore(null);
      }
    } finally {
      if (!signal.aborted) {
        setIsCalculating(false);
      }
    }
  }, [state.resume, state.jobDescription, enabled, minTextLength]);

  // Debounce effect
  useEffect(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      calculateScore();
    }, delay);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [calculateScore, delay]);

  return {
    score: debouncedScore,
    isCalculating,
    isReady: !!state.resume && !!state.jobDescription
  };
}

/**
 * Calculate score using Web Worker
 * 
 * @param resumeText - Resume text
 * @param jobText - Job description text
 * @param resume - Parsed resume object
 * @param signal - Abort signal
 * @returns Calculated score
 */
async function calculateScoreWithWorker(
  resumeText: string,
  jobText: string,
  resume: any,
  signal: AbortSignal
): Promise<ATSResult> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(
      new URL('../scoring/worker/scoring-worker.js', import.meta.url),
      { type: 'module' }
    );

    const requestId = `${Date.now()}-${Math.random()}`;

    const handleMessage = (e: MessageEvent) => {
      const { type, id, payload, error } = e.data;

      if (id !== requestId) return;

      if (type === 'SCORE_CALCULATED') {
        worker.terminate();
        resolve(payload);
      } else if (type === 'ERROR') {
        worker.terminate();
        reject(new Error(error || 'Worker error'));
      }
    };

    const handleError = (error: ErrorEvent) => {
      worker.terminate();
      reject(new Error(error.message || 'Worker error'));
    };

    worker.addEventListener('message', handleMessage);
    worker.addEventListener('error', handleError);

    // Handle abort
    signal.addEventListener('abort', () => {
      worker.terminate();
      reject(new Error('Calculation aborted'));
    });

    // Send calculation request
    worker.postMessage({
      type: 'CALCULATE_SCORE',
      id: requestId,
      payload: {
        resumeText,
        jobText,
        resume
      }
    });
  });
}

