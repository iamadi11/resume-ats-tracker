/**
 * Performance Monitoring Hook
 * 
 * Tracks performance metrics for scoring operations.
 */

import { useState, useEffect, useRef } from 'react';

interface PerformanceMetrics {
  calculationCount: number;
  totalDuration: number;
  averageDuration: number;
  minDuration: number;
  maxDuration: number;
  lastDuration: number;
}

/**
 * Hook for monitoring scoring performance
 * 
 * @returns Performance metrics
 */
export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    calculationCount: 0,
    totalDuration: 0,
    averageDuration: 0,
    minDuration: Infinity,
    maxDuration: 0,
    lastDuration: 0
  });

  const startTimeRef = useRef<number | null>(null);

  const startMeasurement = () => {
    startTimeRef.current = performance.now();
  };

  const endMeasurement = () => {
    if (startTimeRef.current === null) return;

    const duration = performance.now() - startTimeRef.current;
    
    setMetrics(prev => {
      const newCount = prev.calculationCount + 1;
      const newTotal = prev.totalDuration + duration;
      
      return {
        calculationCount: newCount,
        totalDuration: newTotal,
        averageDuration: newTotal / newCount,
        minDuration: Math.min(prev.minDuration, duration),
        maxDuration: Math.max(prev.maxDuration, duration),
        lastDuration: duration
      };
    });

    startTimeRef.current = null;
  };

  const reset = () => {
    setMetrics({
      calculationCount: 0,
      totalDuration: 0,
      averageDuration: 0,
      minDuration: Infinity,
      maxDuration: 0,
      lastDuration: 0
    });
    startTimeRef.current = null;
  };

  return {
    metrics,
    startMeasurement,
    endMeasurement,
    reset
  };
}

