import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';
import { useApp } from '../../context/AppContext';

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="card"
    >
      <div className="flex items-center space-x-2 mb-2">
        <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Job Description
        </label>
      </div>

      <textarea
        value={text}
        onChange={handleChange}
        onPaste={handlePaste}
        onBlur={handleBlur}
        placeholder="Paste job description here..."
        className="input-field min-h-[120px] resize-y"
        aria-label="Job description input"
      />

      {text && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-2 text-xs text-gray-500 dark:text-gray-400"
        >
          {text.length} characters
          {text.length < 100 && (
            <span className="text-warning-600 dark:text-warning-400 ml-2">
              (Job description seems too short)
            </span>
          )}
        </motion.div>
      )}

      {isPasting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="mt-2 text-xs text-primary-600 dark:text-primary-400"
        >
          Processing pasted content...
        </motion.div>
      )}
    </motion.div>
  );
}
