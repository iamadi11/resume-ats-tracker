/**
 * Lever Job Scraper
 * 
 * Extracts job descriptions from Lever job postings.
 * 
 * Selector Strategy:
 * 1. Primary selectors target Lever's job description container
 * 2. Lever uses consistent structure across installations
 * 3. Handle Lever's content sections and job details
 * 4. Metadata extraction from Lever's header
 */

import {
  extractTextWithFallback,
  extractTextFromElement,
  extractJobMetadata,
  isValidJobDescription,
  createSuccessResult,
  createErrorResult
} from './base-scraper.js';

/**
 * Extract job description from Lever job posting page
 * 
 * @returns {import('./base-scraper.js').ScraperResult} Extracted job data
 */
export function extractLeverJob() {
  try {
    // Lever uses consistent class names
    // Strategy: Lever-specific classes first, then generic
    
    const descriptionSelectors = [
      // Primary: Lever's posting section
      '.posting',
      '.posting-header + .posting-content',
      '.posting-content',
      
      // Alternative containers
      '[class*="posting"]',
      '.posting-description',
      '.content',
      
      // Generic fallback
      'main .posting',
      '[class*="description"]'
    ];

    // Extract job description text
    let descriptionText = '';
    
    // Try posting content container
    const postingContent = document.querySelector('.posting-content') ||
                          document.querySelector('.posting');
    
    if (postingContent) {
      // Remove header and actions
      const clone = postingContent.cloneNode(true);
      const header = clone.querySelector('.posting-header, .posting-actions, .posting-apply');
      if (header) header.remove();
      
      descriptionText = extractTextFromElement(clone);
    } else {
      descriptionText = extractTextWithFallback(descriptionSelectors);
    }

    // Extract metadata
    const { title, company, location } = extractJobMetadata({
      titleSelectors: [
        // Job title selectors
        '.posting-headline',
        '.posting-title',
        'h2.posting-headline',
        'h2',
        '[class*="headline"]'
      ],
      companySelectors: [
        // Company name selectors
        '.posting-category-title',
        '.company-name',
        'header a',
        '[class*="company"]'
      ],
      locationSelectors: [
        // Location selectors
        '.posting-categories',
        '.posting-category',
        '[class*="location"]',
        '.posting-header .posting-category'
      ]
    });

    // Validate extracted description
    if (!isValidJobDescription(descriptionText)) {
      return createErrorResult(
        'No valid job description found on Lever page. The page may not be a job posting, or the structure has changed.',
        'lever'
      );
    }

    return createSuccessResult({
      text: descriptionText,
      title,
      company,
      location,
      portal: 'lever'
    });

  } catch (error) {
    console.error('[Lever Scraper] Error:', error);
    return createErrorResult(error.message, 'lever');
  }
}

/**
 * Check if current page is a Lever job posting
 * 
 * @returns {boolean} True if page appears to be a Lever job posting
 */
export function isLeverJobPage() {
  const url = window.location.href;
  const hostname = window.location.hostname;
  
  // Lever can be hosted on lever.co or company domains
  return url.includes('lever.co') ||
         url.includes('/jobs/') ||
         (hostname.includes('lever') && document.querySelector('.posting'));
}

