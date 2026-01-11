import React, { useState } from 'react';

/**
 * Privacy Notice Component
 * 
 * Displays privacy information to users.
 */
export default function PrivacyNotice() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-4 text-xs text-gray-500">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-primary-600 hover:text-primary-700 underline"
        aria-expanded={isOpen}
        aria-controls="privacy-notice"
      >
        Privacy Information
      </button>
      
      {isOpen && (
        <div
          id="privacy-notice"
          className="mt-2 p-3 bg-gray-50 rounded border border-gray-200 space-y-2"
          role="region"
          aria-label="Privacy information"
        >
          <h3 className="font-semibold text-gray-900 text-sm mb-2">
            Your Privacy Matters
          </h3>
          
          <ul className="space-y-1 text-xs text-gray-700">
            <li className="flex items-start">
              <span className="text-success-600 mr-2">✓</span>
              <span>All processing happens on your device</span>
            </li>
            <li className="flex items-start">
              <span className="text-success-600 mr-2">✓</span>
              <span>No data is stored or transmitted</span>
            </li>
            <li className="flex items-start">
              <span className="text-success-600 mr-2">✓</span>
              <span>No tracking or analytics</span>
            </li>
            <li className="flex items-start">
              <span className="text-success-600 mr-2">✓</span>
              <span>No third-party services</span>
            </li>
          </ul>
          
          <p className="text-xs text-gray-600 mt-2">
            Your resume and job descriptions are processed locally and never leave your device.
            All data is cleared when you close the extension.
          </p>
          
          <button
            onClick={() => setIsOpen(false)}
            className="text-xs text-primary-600 hover:text-primary-700 mt-2"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}

