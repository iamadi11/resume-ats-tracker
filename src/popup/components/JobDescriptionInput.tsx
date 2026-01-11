import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { MESSAGE_TYPES } from '../../shared/constants.js';

export default function JobDescriptionInput() {
  const { state, setJobDescription } = useApp();
  const [text, setText] = useState(state.jobDescription?.text || '');
  const [isPasting, setIsPasting] = useState(false);

  useEffect(() => {
    if (state.jobDescription?.text) {
      setText(state.jobDescription.text);
    }
  }, [state.jobDescription]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    setIsPasting(true);
    const pastedText = e.clipboardData.getData('text');
    setText(pastedText);
    
    // Small delay to allow paste to complete
    setTimeout(() => {
      setIsPasting(false);
      if (pastedText.trim().length > 50) {
        setJobDescription(pastedText);
      }
    }, 100);
  };

  const handleBlur = () => {
    if (text.trim().length > 50 && text !== state.jobDescription?.text) {
      setJobDescription(text);
    }
  };

  const handleExtractFromPage = async () => {
    try {
      setIsPasting(true); // Reuse loading state
      // Request job extraction from content script
      const response = await chrome.runtime.sendMessage({
        type: MESSAGE_TYPES.EXTRACT_JOB_FROM_PAGE
      });

      if (response && response.type === MESSAGE_TYPES.JOB_EXTRACTED && response.payload && response.payload.text) {
        setText(response.payload.text);
        setJobDescription(response.payload.text);
      } else if (response && response.payload && response.error) {
        alert(`Failed to extract job description: ${response.payload.error}`);
      }
    } catch (error) {
      console.error('Failed to extract job description:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to extract job description: ${errorMessage}`);
    } finally {
      setIsPasting(false);
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700">
          Job Description
        </label>
        <button
          onClick={handleExtractFromPage}
          className="text-xs text-primary-600 hover:text-primary-700 font-medium"
          title="Extract from current page"
        >
          Extract from page
        </button>
      </div>

      <textarea
        value={text}
        onChange={handleChange}
        onPaste={handlePaste}
        onBlur={handleBlur}
        placeholder="Paste job description here or extract from job portal..."
        className="input-field min-h-[120px] resize-y"
        aria-label="Job description input"
      />

      {text && (
        <div className="mt-2 text-xs text-gray-500">
          {text.length} characters
          {text.length < 100 && (
            <span className="text-warning-600 ml-2">
              (Job description seems too short)
            </span>
          )}
        </div>
      )}

      {isPasting && (
        <div className="mt-2 text-xs text-primary-600 animate-pulse">
          Processing pasted content...
        </div>
      )}
    </div>
  );
}

