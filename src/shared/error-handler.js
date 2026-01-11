/**
 * Error Handler
 * 
 * Centralized error handling with privacy considerations.
 * Ensures no sensitive data is leaked in error messages.
 */

/**
 * Error types
 */
export const ERROR_TYPES = {
  FILE_PROCESSING: 'FILE_PROCESSING',
  SCORE_CALCULATION: 'SCORE_CALCULATION',
  JOB_EXTRACTION: 'JOB_EXTRACTION',
  WORKER_ERROR: 'WORKER_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  PERMISSION_ERROR: 'PERMISSION_ERROR',
  UNKNOWN: 'UNKNOWN'
};

/**
 * Sanitize error message to remove sensitive data
 */
function sanitizeErrorMessage(error) {
  if (!error) return 'An unknown error occurred';

  let message = error.message || String(error);

  // Remove email addresses
  message = message.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[email]');

  // Remove phone numbers
  message = message.replace(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, '[phone]');

  // Remove file paths (keep only filename)
  message = message.replace(/[\/\\][^\s]+[\/\\]/g, '/');

  // Remove long text blocks (potential resume content)
  const words = message.split(/\s+/);
  if (words.length > 50) {
    message = words.slice(0, 50).join(' ') + '... [truncated]';
  }

  return message;
}

/**
 * Create user-friendly error message
 */
function createUserFriendlyMessage(errorType, originalError) {
  const sanitized = sanitizeErrorMessage(originalError);

  const userMessages = {
    [ERROR_TYPES.FILE_PROCESSING]: 'Failed to process resume file. Please ensure the file is a valid PDF, DOCX, or TXT file.',
    [ERROR_TYPES.SCORE_CALCULATION]: 'Failed to calculate ATS score. Please try again.',
    [ERROR_TYPES.JOB_EXTRACTION]: 'Could not extract job description from this page. Please try pasting it manually.',
    [ERROR_TYPES.WORKER_ERROR]: 'Calculation error occurred. Please refresh and try again.',
    [ERROR_TYPES.NETWORK_ERROR]: 'Network error. This extension works offline, so this should not occur.',
    [ERROR_TYPES.PERMISSION_ERROR]: 'Permission denied. Please check extension permissions.',
    [ERROR_TYPES.UNKNOWN]: 'An unexpected error occurred. Please try again.'
  };

  return {
    userMessage: userMessages[errorType] || userMessages[ERROR_TYPES.UNKNOWN],
    technicalDetails: sanitized,
    errorType
  };
}

/**
 * Handle error with privacy considerations
 */
export function handleError(error, errorType = ERROR_TYPES.UNKNOWN, context = {}) {
  // Log error (without sensitive data)
  const sanitizedError = sanitizeErrorMessage(error);
  console.error(`[Error Handler] ${errorType}:`, sanitizedError, context);

  // Create user-friendly error
  const errorInfo = createUserFriendlyMessage(errorType, error);

  // Don't log sensitive context
  const safeContext = { ...context };
  delete safeContext.resumeText;
  delete safeContext.jobText;
  delete safeContext.resume;
  delete safeContext.jobDescription;

  return {
    ...errorInfo,
    timestamp: Date.now(),
    context: safeContext
  };
}

/**
 * Handle async errors
 */
export async function handleAsyncError(asyncFn, errorType, context) {
  try {
    return await asyncFn();
  } catch (error) {
    return handleError(error, errorType, context);
  }
}

/**
 * Error boundary for React components
 */
export function createErrorBoundary(Component) {
  return class ErrorBoundary extends Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
      return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
      const handled = handleError(error, ERROR_TYPES.UNKNOWN, {
        component: Component.name,
        errorInfo: sanitizeErrorMessage(errorInfo)
      });
      console.error('[Error Boundary]', handled);
    }

    render() {
      if (this.state.hasError) {
        return {
          userMessage: 'Something went wrong. Please refresh the extension.',
          errorType: ERROR_TYPES.UNKNOWN
        };
      }

      return this.props.children;
    }
  };
}

/**
 * Validate error doesn't contain sensitive data
 */
export function validateErrorSafety(error) {
  const message = String(error);
  const sensitivePatterns = [
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/, // Email
    /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/, // Phone
  ];

  for (const pattern of sensitivePatterns) {
    if (pattern.test(message)) {
      console.warn('[Error Handler] Sensitive data detected in error message');
      return false;
    }
  }

  return true;
}

