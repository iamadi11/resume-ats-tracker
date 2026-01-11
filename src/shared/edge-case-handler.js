/**
 * Edge Case Handler
 * 
 * Handles edge cases and unexpected scenarios.
 */

/**
 * Handle empty or invalid inputs
 */
export function validateInputs(resumeText, jobText) {
  const errors = [];

  // Check for empty inputs
  if (!resumeText || resumeText.trim().length === 0) {
    errors.push('Resume text is required');
  }

  if (!jobText || jobText.trim().length === 0) {
    errors.push('Job description text is required');
  }

  // Check minimum length
  if (resumeText && resumeText.trim().length < 50) {
    errors.push('Resume text is too short (minimum 50 characters)');
  }

  if (jobText && jobText.trim().length < 50) {
    errors.push('Job description is too short (minimum 50 characters)');
  }

  // Check maximum length (prevent DoS)
  const MAX_LENGTH = 100000; // 100KB
  if (resumeText && resumeText.length > MAX_LENGTH) {
    errors.push('Resume text is too long (maximum 100,000 characters)');
  }

  if (jobText && jobText.length > MAX_LENGTH) {
    errors.push('Job description is too long (maximum 100,000 characters)');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Handle file size limits
 */
export function validateFileSize(file) {
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  const MIN_SIZE = 100; // 100 bytes

  if (file.size > MAX_SIZE) {
    return {
      valid: false,
      error: `File size exceeds maximum of ${MAX_SIZE / 1024 / 1024}MB`
    };
  }

  if (file.size < MIN_SIZE) {
    return {
      valid: false,
      error: 'File is too small to be a valid resume'
    };
  }

  return { valid: true };
}

/**
 * Handle file type validation
 */
export function validateFileType(file) {
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];

  const allowedExtensions = ['.pdf', '.docx', '.txt'];

  const fileName = file.name.toLowerCase();
  const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
  const hasValidType = allowedTypes.includes(file.type);

  if (!hasValidExtension && !hasValidType) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload a PDF, DOCX, or TXT file.'
    };
  }

  return { valid: true };
}

/**
 * Handle worker unavailability
 */
export function handleWorkerUnavailable() {
  console.warn('[Edge Case] Worker unavailable, falling back to main thread');
  
  // Fallback to main thread calculation
  // This is slower but ensures functionality
  return {
    useWorker: false,
    fallback: true
  };
}

/**
 * Handle timeout scenarios
 */
export function createTimeoutHandler(timeoutMs = 30000) {
  return (promise) => {
    return Promise.race([
      promise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Operation timeout')), timeoutMs)
      )
    ]);
  };
}

/**
 * Handle memory constraints
 */
export function checkMemoryConstraints() {
  if (typeof performance !== 'undefined' && 'memory' in performance) {
    const memory = performance.memory;
    const usedMB = memory.usedJSHeapSize / 1024 / 1024;
    const limitMB = memory.jsHeapSizeLimit / 1024 / 1024;
    const usagePercent = (usedMB / limitMB) * 100;

    if (usagePercent > 80) {
      console.warn('[Edge Case] High memory usage:', usagePercent.toFixed(2) + '%');
      return {
        warning: true,
        usagePercent,
        recommendation: 'Consider closing other tabs or refreshing the extension'
      };
    }
  }

  return { warning: false };
}

/**
 * Handle concurrent requests
 */
export class RequestQueue {
  constructor(maxConcurrent = 1) {
    this.queue = [];
    this.running = 0;
    this.maxConcurrent = maxConcurrent;
  }

  async add(fn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      this.process();
    });
  }

  async process() {
    if (this.running >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    this.running++;
    const { fn, resolve, reject } = this.queue.shift();

    try {
      const result = await fn();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.running--;
      this.process();
    }
  }
}

/**
 * Handle malformed data
 */
export function sanitizeInput(text) {
  if (typeof text !== 'string') {
    return '';
  }

  // Remove null bytes
  text = text.replace(/\0/g, '');

  // Limit length
  const MAX_LENGTH = 100000;
  if (text.length > MAX_LENGTH) {
    text = text.substring(0, MAX_LENGTH);
    console.warn('[Edge Case] Input truncated to', MAX_LENGTH, 'characters');
  }

  return text;
}

/**
 * Handle extension context loss
 */
export function handleContextLoss() {
  // Service worker may be terminated
  // Reinitialize if needed
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    chrome.runtime.onConnect.addListener((port) => {
      console.log('[Edge Case] Context reconnected');
    });
  }
}

/**
 * Handle permission denial
 */
export async function handlePermissionDenied(permission) {
  const error = {
    type: 'PERMISSION_DENIED',
    permission,
    message: `Permission denied: ${permission}. Please enable this permission in Chrome settings.`,
    userAction: 'Go to chrome://extensions and enable the required permission'
  };

  console.error('[Edge Case]', error);
  return error;
}

