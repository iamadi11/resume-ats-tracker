import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ChevronDown, ChevronUp } from 'lucide-react';

/**
 * Privacy Notice Component
 * 
 * Displays privacy information to users.
 */
export default function PrivacyNotice() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mt-4 text-xs text-gray-500 dark:text-gray-400"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 underline transition-colors"
        aria-expanded={isOpen}
        aria-controls="privacy-notice"
      >
        <Shield className="w-3 h-3" />
        <span>Privacy Information</span>
        {isOpen ? (
          <ChevronUp className="w-3 h-3" />
        ) : (
          <ChevronDown className="w-3 h-3" />
        )}
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            id="privacy-notice"
            className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 space-y-2"
            role="region"
            aria-label="Privacy information"
          >
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-2">
              Your Privacy Matters
            </h3>
            
            <ul className="space-y-1 text-xs text-gray-700 dark:text-gray-300">
              <li className="flex items-start">
                <span className="text-success-600 dark:text-success-400 mr-2">✓</span>
                <span>All processing happens on your device</span>
              </li>
              <li className="flex items-start">
                <span className="text-success-600 dark:text-success-400 mr-2">✓</span>
                <span>No data is stored or transmitted</span>
              </li>
              <li className="flex items-start">
                <span className="text-success-600 dark:text-success-400 mr-2">✓</span>
                <span>No tracking or analytics</span>
              </li>
              <li className="flex items-start">
                <span className="text-success-600 dark:text-success-400 mr-2">✓</span>
                <span>No third-party services</span>
              </li>
            </ul>
            
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              Your resume and job descriptions are processed locally and never leave your device.
              All data is cleared when you close the application.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
