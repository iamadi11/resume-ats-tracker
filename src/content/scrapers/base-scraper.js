/**
 * Base Scraper Utility
 * 
 * Provides common utilities for all portal-specific scrapers:
 * - Text cleaning and normalization
 * - DOM querying with fallbacks
 * - Job description validation
 * - Error handling
 */

/**
 * Clean and normalize extracted text
 * 
 * @param {string} text - Raw extracted text
 * @returns {string} Cleaned text
 */
export function cleanText(text) {
  if (!text || typeof text !== 'string') {
    return '';
  }

  // Remove HTML entities
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = text;
  let cleaned = tempDiv.textContent || tempDiv.innerText || '';

  // Remove extra whitespace (tabs, multiple spaces, newlines)
  cleaned = cleaned
    .replace(/\s+/g, ' ') // Multiple whitespace to single space
    .replace(/\n\s*\n/g, '\n\n') // Multiple newlines to double newline
    .trim();

  // Remove common noise patterns
  cleaned = cleaned
    .replace(/Share\s+on\s+[^\n]+/gi, '') // Share buttons
    .replace(/Save\s+[^\n]+/gi, '') // Save buttons
    .replace(/Apply\s+now[^\n]*/gi, '') // Apply now buttons
    .replace(/View\s+all\s+[^\n]+/gi, '') // View all links
    .replace(/Cookie\s+[^\n]+/gi, '') // Cookie notices
    .replace(/Privacy\s+[^\n]+/gi, '') // Privacy notices
    .replace(/Terms\s+[^\n]+/gi, '') // Terms links
    .replace(/©\s+\d{4}[^\n]*/gi, '') // Copyright notices
    .replace(/All\s+rights\s+reserved[^\n]*/gi, '') // Copyright footer
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // Zero-width characters
    .trim();

  return cleaned;
}

/**
 * Extract text from element, handling nested structures
 * 
 * @param {Element|null} element - DOM element
 * @param {boolean} deep - Whether to extract from nested elements
 * @returns {string} Extracted text
 */
export function extractTextFromElement(element, deep = true) {
  if (!element) {
    return '';
  }

  // Clone to avoid modifying original
  const clone = element.cloneNode(true);

  // Remove script and style elements
  const scripts = clone.querySelectorAll('script, style, noscript');
  scripts.forEach(el => el.remove());

  // Remove common UI noise elements
  const noiseSelectors = [
    'button',
    'nav',
    'header',
    'footer',
    '.header',
    '.footer',
    '.navigation',
    '.nav',
    '.menu',
    '.sidebar',
    '.ad',
    '.advertisement',
    '.share',
    '.social',
    '[role="navigation"]',
    '[role="banner"]',
    '[role="contentinfo"]',
    '[aria-label*="share" i]',
    '[aria-label*="save" i]',
    '[aria-label*="apply" i]'
  ];

  noiseSelectors.forEach(selector => {
    try {
      const elements = clone.querySelectorAll(selector);
      elements.forEach(el => el.remove());
    } catch (e) {
      // Invalid selector, skip
    }
  });

  // Get text content
  const text = clone.textContent || clone.innerText || '';
  return cleanText(text);
}

/**
 * Query selector with multiple fallback selectors
 * 
 * @param {string[]} selectors - Array of CSS selectors to try
 * @param {Document|Element} context - Context element (defaults to document)
 * @returns {Element|null} First matching element
 */
export function querySelectorWithFallback(selectors, context = document) {
  if (!Array.isArray(selectors) || selectors.length === 0) {
    return null;
  }

  for (const selector of selectors) {
    try {
      const element = context.querySelector(selector);
      if (element) {
        return element;
      }
    } catch (e) {
      // Invalid selector, try next
      continue;
    }
  }

  return null;
}

/**
 * Query all selectors with fallback (returns first non-empty result)
 * 
 * @param {string[]} selectors - Array of CSS selectors to try
 * @param {Document|Element} context - Context element
 * @returns {NodeList|Element[]} First matching node list
 */
export function querySelectorAllWithFallback(selectors, context = document) {
  if (!Array.isArray(selectors) || selectors.length === 0) {
    return [];
  }

  for (const selector of selectors) {
    try {
      const elements = context.querySelectorAll(selector);
      if (elements && elements.length > 0) {
        return elements;
      }
    } catch (e) {
      // Invalid selector, try next
      continue;
    }
  }

  return [];
}

/**
 * Extract text from multiple selectors (tries each until non-empty)
 * 
 * @param {string[]} selectors - Array of CSS selectors
 * @param {Document|Element} context - Context element
 * @param {boolean} combine - Whether to combine results from all selectors
 * @returns {string} Extracted text
 */
export function extractTextWithFallback(selectors, context = document, combine = false) {
  if (!Array.isArray(selectors) || selectors.length === 0) {
    return '';
  }

  const texts = [];

  for (const selector of selectors) {
    try {
      const element = context.querySelector(selector);
      if (element) {
        const text = extractTextFromElement(element);
        if (text && text.length > 50) { // Minimum length threshold
          if (!combine) {
            return text; // Return first good result
          }
          texts.push(text);
        }
      }
    } catch (e) {
      // Invalid selector, try next
      continue;
    }
  }

  if (combine && texts.length > 0) {
    // Combine and deduplicate
    return texts.join('\n\n');
  }

  return texts[0] || '';
}

/**
 * Validate if extracted job description is valid
 * 
 * @param {string} text - Extracted job description text
 * @param {number} minLength - Minimum text length (default: 100)
 * @returns {boolean} True if valid
 */
export function isValidJobDescription(text, minLength = 100) {
  if (!text || typeof text !== 'string') {
    return false;
  }

  const cleaned = cleanText(text);

  // Check minimum length
  if (cleaned.length < minLength) {
    return false;
  }

  // Check for common job description indicators
  const jobIndicators = [
    /requirements?/i,
    /qualifications?/i,
    /responsibilities?/i,
    /experience/i,
    /skills?/i,
    /description/i,
    /position/i,
    /role/i
  ];

  const hasIndicators = jobIndicators.some(pattern => pattern.test(cleaned));

  // Check for too much noise (if it's mostly navigation/footer)
  const noisePatterns = [
    /(?:home|about|contact|privacy|terms|cookie)[^\n]*/gi,
    /©\s*\d{4}/g,
    /all\s+rights\s+reserved/gi
  ];

  const noiseCount = noisePatterns.reduce((count, pattern) => {
    return count + (cleaned.match(pattern) || []).length;
  }, 0);

  // If more than 5 noise patterns, likely not a JD
  if (noiseCount > 5) {
    return false;
  }

  return hasIndicators;
}

/**
 * Extract job metadata (title, company, location)
 * 
 * @param {Object} options - Extraction options
 * @param {string[]} titleSelectors - Selectors for job title
 * @param {string[]} companySelectors - Selectors for company name
 * @param {string[]} locationSelectors - Selectors for location
 * @returns {Object} Extracted metadata
 */
export function extractJobMetadata({ titleSelectors = [], companySelectors = [], locationSelectors = [] }) {
  const title = extractTextWithFallback(titleSelectors).trim();
  const company = extractTextWithFallback(companySelectors).trim();
  const location = extractTextWithFallback(locationSelectors).trim();

  return { title, company, location };
}

/**
 * Base scraper result structure
 * 
 * @typedef {Object} ScraperResult
 * @property {boolean} success - Whether extraction was successful
 * @property {string} text - Extracted job description text
 * @property {string} title - Job title
 * @property {string} company - Company name
 * @property {string} location - Job location
 * @property {string} url - Page URL
 * @property {number} extractedAt - Timestamp
 * @property {string} portal - Portal name
 * @property {string} [error] - Error message if failed
 */

/**
 * Create a successful scraper result
 * 
 * @param {Object} data - Result data
 * @returns {ScraperResult} Scraper result object
 */
export function createSuccessResult(data) {
  return {
    success: true,
    text: data.text || '',
    title: data.title || '',
    company: data.company || '',
    location: data.location || '',
    url: window.location.href,
    extractedAt: Date.now(),
    portal: data.portal || 'unknown',
    error: undefined
  };
}

/**
 * Create a failed scraper result
 * 
 * @param {string} error - Error message
 * @param {string} portal - Portal name
 * @returns {ScraperResult} Scraper result object
 */
export function createErrorResult(error, portal = 'unknown') {
  return {
    success: false,
    text: '',
    title: '',
    company: '',
    location: '',
    url: window.location.href,
    extractedAt: Date.now(),
    portal,
    error
  };
}

