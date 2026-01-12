import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link2, Loader2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { isUrl } from '../../utils/job-description-fetcher';
import LoadingSpinner from '../ui/LoadingSpinner';

export default function JobDescriptionInput() {
  const { state, setJobDescription } = useApp();
  const [url, setUrl] = useState('');
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    // Don't auto-populate URL from state to allow re-fetching
    // The job description text will be shown in a read-only view if available
  }, [state.jobDescription]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUrl = url.trim();
    
    if (!trimmedUrl) {
      return;
    }

    if (!isUrl(trimmedUrl)) {
      // If it's not a URL, treat it as plain text
      if (trimmedUrl.length > 50) {
        setIsFetching(true);
        await setJobDescription(trimmedUrl);
        setIsFetching(false);
      }
      return;
    }

    // It's a URL, fetch the job description
    setIsFetching(true);
    await setJobDescription(trimmedUrl);
    setIsFetching(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const isLoading = isFetching || state.loading;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="card"
      style={{ userSelect: 'auto' }}
    >
      <div className="flex items-center space-x-2 mb-2">
        <Link2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Job Posting URL
        </label>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={url}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Paste job posting URL (e.g., LinkedIn, Indeed, etc.)"
            className="input-field flex-1"
            aria-label="Job posting URL input"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !url.trim()}
            className="btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading...</span>
              </>
            ) : (
              'Fetch'
            )}
          </button>
        </div>
      </form>

      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 flex items-center justify-center py-4"
        >
          <LoadingSpinner />
          <span className="ml-3 text-sm text-gray-600 dark:text-gray-400">
            {isFetching ? 'Fetching job description...' : 'Calculating score...'}
          </span>
        </motion.div>
      )}

      {state.jobDescription && !isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            Job Description Loaded
            {state.jobDescription.title && ` • ${state.jobDescription.title}`}
            {state.jobDescription.company && ` at ${state.jobDescription.company}`}
          </div>
          <div className="text-sm text-gray-700 dark:text-gray-300 max-h-40 overflow-y-auto">
            {state.jobDescription.text.substring(0, 300)}
            {state.jobDescription.text.length > 300 && '...'}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {state.jobDescription.text.length} characters
          </div>
        </motion.div>
      )}

      {url && !isUrl(url.trim()) && url.trim().length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-2 text-xs text-warning-600 dark:text-warning-400"
        >
          Note: This doesn't look like a URL. It will be treated as plain text.
        </motion.div>
      )}
    </motion.div>
  );
}
