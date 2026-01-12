import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface ProgressBarProps {
  progress: number; // 0-100
  currentStep: string;
  steps: Array<{ label: string; completed: boolean }>;
}

export default function ProgressBar({ progress, currentStep, steps }: ProgressBarProps) {
  return (
    <div className="card">
      <div className="space-y-4">
        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Analyzing Resume...
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <motion.div
              className="h-full bg-primary-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Current Step */}
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin text-primary-600" />
          <span>{currentStep}</span>
        </div>

        {/* Steps List */}
        <div className="space-y-2">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex items-center gap-2 text-xs ${
                step.completed
                  ? 'text-success-600 dark:text-success-400'
                  : step.label === currentStep
                  ? 'text-primary-600 dark:text-primary-400 font-medium'
                  : 'text-gray-400 dark:text-gray-500'
              }`}
            >
              {step.completed ? (
                <div className="w-4 h-4 rounded-full bg-success-500 flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              ) : step.label === currentStep ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-600" />
              )}
              <span>{step.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

