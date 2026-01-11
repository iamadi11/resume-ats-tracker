/**
 * Greenhouse Job Scraper
 * 
 * Extracts job descriptions from Greenhouse job postings.
 * 
 * Selector Strategy:
 * 1. Primary selectors target Greenhouse's standard job description section
 * 2. Greenhouse uses consistent class names across ATS installations
 * 3. Handle Greenhouse's structured content sections
 * 4. Metadata from Greenhouse's header structure
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
 * Extract job description from Greenhouse job posting page
 * 
 * @returns {import('./base-scraper.js').ScraperResult} Extracted job data
 */
export function extractGreenhouseJob() {
  try {
    // Greenhouse uses consistent class names across installations
    // Strategy: Greenhouse-specific classes first, then generic
    
    const descriptionSelectors = [
      // Primary: Greenhouse's main content section
      '#content',
      '.content',
      '.page',
      
      // Job description specific
      '[class*="job-description"]',
      '.section',
      '.section-page',
      
      // Alternative: Greenhouse's structured sections
      '#main',
      'main .content',
      '[id*="description"]'
    ];

    // Extract job description text
    let descriptionText = '';
    
    // Greenhouse often structures content in sections
    const contentElement = document.querySelector('#content') || 
                          document.querySelector('.content');
    
    if (contentElement) {
      // Remove header and footer elements
      const clone = contentElement.cloneNode(true);
      const header = clone.querySelector('header, .header, .page-header');
      const footer = clone.querySelector('footer, .footer, .page-footer');
      if (header) header.remove();
      if (footer) footer.remove();
      
      descriptionText = extractTextFromElement(clone);
    } else {
      descriptionText = extractTextWithFallback(descriptionSelectors);
    }

    // Extract metadata
    const { title, company, location } = extractJobMetadata({
      titleSelectors: [
        // Job title selectors
        '.app-title',
        'h1',
        '.page-header h1',
        '[class*="job-title"]',
        '.header h1'
      ],
      companySelectors: [
        // Company name selectors
        '.company-name',
        '.company-name a',
        '[class*="company"]',
        'header a[href*="/company/"]',
        '.page-header a'
      ],
      locationSelectors: [
        // Location selectors
        '.location',
        '[class*="location"]',
        '.job-meta .location',
        '.page-header .location'
      ]
    });

    // Validate extracted description
    if (!isValidJobDescription(descriptionText)) {
      return createErrorResult(
        'No valid job description found on Greenhouse page. The page may not be a job posting, or the structure has changed.',
        'greenhouse'
      );
    }

    return createSuccessResult({
      text: descriptionText,
      title,
      company,
      location,
      portal: 'greenhouse'
    });

  } catch (error) {
    console.error('[Greenhouse Scraper] Error:', error);
    return createErrorResult(error.message, 'greenhouse');
  }
}

/**
 * Check if current page is a Greenhouse job posting
 * 
 * @returns {boolean} True if page appears to be a Greenhouse job posting
 */
export function isGreenhouseJobPage() {
  const url = window.location.href;
  const hostname = window.location.hostname;
  
  // Greenhouse can be hosted on greenhouse.io or company domains
  return url.includes('greenhouse.io') ||
         url.includes('/jobs/') ||
         (hostname.includes('greenhouse') && document.querySelector('#content'));
}

