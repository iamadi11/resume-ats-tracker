import React from 'react';

interface PerformanceIndicatorProps {
  duration?: number;
  isCalculating: boolean;
}

export default function PerformanceIndicator({ duration, isCalculating }: PerformanceIndicatorProps) {
  if (!duration && !isCalculating) {
    return null;
  }

  const getPerformanceColor = (duration: number) => {
    if (duration < 100) return 'text-success-600';
    if (duration < 500) return 'text-primary-600';
    if (duration < 1000) return 'text-warning-600';
    return 'text-error-600';
  };

  return (
    <div className="text-xs text-gray-500 mt-2 flex items-center space-x-2">
      {isCalculating ? (
        <>
          <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
          <span>Calculating...</span>
        </>
      ) : duration !== undefined ? (
        <>
          <div className={`w-2 h-2 rounded-full ${getPerformanceColor(duration)}`} />
          <span>Calculated in {duration.toFixed(0)}ms</span>
        </>
      ) : null}
    </div>
  );
}

