import React from 'react';
import { motion } from 'framer-motion';

interface PerformanceIndicatorProps {
  duration?: number;
  isCalculating: boolean;
}

export default function PerformanceIndicator({ duration, isCalculating }: PerformanceIndicatorProps) {
  if (!duration && !isCalculating) {
    return null;
  }

  const getPerformanceColor = (duration: number) => {
    if (duration < 100) return 'text-success-600 dark:text-success-400';
    if (duration < 500) return 'text-primary-600 dark:text-primary-400';
    if (duration < 1000) return 'text-warning-600 dark:text-warning-400';
    return 'text-error-600 dark:text-error-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center space-x-2"
    >
      {isCalculating ? (
        <>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="w-2 h-2 bg-primary-500 rounded-full"
          />
          <span>Calculating...</span>
        </>
      ) : duration !== undefined ? (
        <>
          <div className={`w-2 h-2 rounded-full ${getPerformanceColor(duration)}`} />
          <span>Calculated in {duration.toFixed(0)}ms</span>
        </>
      ) : null}
    </motion.div>
  );
}
