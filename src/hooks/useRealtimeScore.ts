/**
 * Real-time Score Hook
 * 
 * Provides real-time score updates with debouncing and worker-based calculation.
 * Optimized for smooth UI updates without blocking.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { workerManager } from '../utils/worker-manager';
import { usePerformanceMonitor } from './usePerformanceMonitor';
import { ATSResult } from '../types';

interface UseRealtimeScoreOptions {
  debounceDelay?: number;
  minTextLength?: number;
  enabled?: boolean;
  onScoreUpdate?: (score: ATSResult) => void;
}

/**
 * Hook for real-time score calculation
 * 
 * @param options - Configuration options
 * @returns Score result, loading state, and performance metrics
 */
export function useRealtimeScore(options: UseRealtimeScoreOptions = {}) {
  const {
    debounceDelay = 500,
    minTextLength = 50,
    enabled = true,
    onScoreUpdate
  } = options;

  const { state } = useApp();
  const [score, setScore] = useState<ATSResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { metrics, startMeasurement, endMeasurement } = usePerformanceMonitor();
  
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastInputHashRef = useRef<string>('');

  // Initialize worker
  useEffect(() => {
    try {
      workerManager.initialize();
    } catch (error) {
      console.error('Failed to initialize worker:', error);
      setError('Worker initialization failed');
    }

    return () => {
      // Cleanup on unmount
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Calculate score
  const calculateScore = useCallback(async () => {
    if (!enabled) return;
    if (!state.resume || !state.jobDescription) {
      setScore(null);
      return;
    }

    const resumeText = state.resume.rawText || '';
    const jobText = state.jobDescription.text || '';

    // Check minimum length
    if (resumeText.length < minTextLength || jobText.length < minTextLength) {
      setScore(null);
      return;
    }

    // Create input hash to detect actual changes
    const inputHash = `${resumeText.length}-${jobText.length}-${resumeText.substring(0, 100)}-${jobText.substring(0, 100)}`;
    if (inputHash === lastInputHashRef.current) {
      return; // No actual change
    }
    lastInputHashRef.current = inputHash;

    // Cancel previous calculation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setIsCalculating(true);
    setError(null);
    startMeasurement();

    try {
      const response = await workerManager.sendMessage('CALCULATE_SCORE', {
        resumeText,
        jobText,
        resume: state.resume
      });

      if (signal.aborted) {
        return;
      }

      const result = response.payload as ATSResult;
      setScore(result);
      endMeasurement();

      // Callback
      if (onScoreUpdate) {
        onScoreUpdate(result);
      }

      // Log performance if available
      if (response.performance) {
        console.log(`Score calculation took ${response.performance.duration.toFixed(2)}ms`);
      }
    } catch (error) {
      if (!signal.aborted) {
        const errorMessage = error instanceof Error ? error.message : 'Calculation failed';
        setError(errorMessage);
        console.error('Score calculation error:', error);
      }
    } finally {
      if (!signal.aborted) {
        setIsCalculating(false);
      }
    }
  }, [state.resume, state.jobDescription, enabled, minTextLength, onScoreUpdate, startMeasurement, endMeasurement]);

  // Debounced effect
  useEffect(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      calculateScore();
    }, debounceDelay);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [calculateScore, debounceDelay]);

  // Reset score when inputs change significantly
  useEffect(() => {
    if (!state.resume || !state.jobDescription) {
      setScore(null);
      lastInputHashRef.current = '';
    }
  }, [state.resume, state.jobDescription]);

  return {
    score,
    isCalculating,
    error,
    metrics,
    isReady: !!state.resume && !!state.jobDescription && workerManager.isAvailable()
  };
}

