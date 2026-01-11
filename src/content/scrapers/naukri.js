/**
 * Naukri Job Scraper
 * 
 * Extracts job descriptions from Naukri.com job postings.
 * 
 * Selector Strategy:
 * 1. Primary selectors target Naukri's job description container
 * 2. Handle Naukri's common class naming patterns
 * 3. Account for different page layouts (listings vs. detail pages)
 * 4. Extract metadata from Naukri's structured header
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
 * Extract job description from Naukri job posting page
 * 
 * @returns {import('./base-scraper.js').ScraperResult} Extracted job data
 */
export function extractNaukriJob() {
  try {
    // Naukri uses class-based selectors for job descriptions
    // Strategy: Try most specific classes first, then generic
    
    const descriptionSelectors = [
      // Primary: Main job description container
      '.jd-container',
      '.job-description',
      '.jd-details',
      
      // Alternative containers
      '[class*="jobDescription"]',
      '[class*="jd-container"]',
      '.jd-wrap',
      '.jd-content',
      
      // Generic fallback
      '[class*="description"]',
      '.detail',
      'main .job-details'
    ];

    // Extract job description text
    let descriptionText = extractTextWithFallback(descriptionSelectors);

    // Naukri sometimes has job description in nested structure
    if (!descriptionText || descriptionText.length < 100) {
      // Try getting all job detail sections
      const detailSections = document.querySelectorAll('.jd-sec, .job-detail-sec, [class*="jd-sec"]');
      if (detailSections.length > 0) {
        const texts = Array.from(detailSections)
          .map(section => extractTextFromElement(section))
          .filter(text => text.length > 50);
        
        if (texts.length > 0) {
          descriptionText = texts.join('\n\n');
        }
      }
    }

    // Extract metadata
    const { title, company, location } = extractJobMetadata({
      titleSelectors: [
        // Job title selectors
        'h1.job-title',
        '.job-title',
        'h1[class*="jobTitle"]',
        '.jd-header-title',
        'h1',
        '[class*="title"]'
      ],
      companySelectors: [
        // Company name selectors
        '.jd-header-comp-name',
        '.company-name',
        '[class*="companyName"]',
        '.cmp-name',
        'a[href*="/company/"]'
      ],
      locationSelectors: [
        // Location selectors
        '.loc',
        '.location',
        '[class*="location"]',
        '.jd-header-loc',
        '.loc-sec'
      ]
    });

    // Validate extracted description
    if (!isValidJobDescription(descriptionText)) {
      return createErrorResult(
        'No valid job description found on Naukri page. The page may not be a job posting, or the structure has changed.',
        'naukri'
      );
    }

    return createSuccessResult({
      text: descriptionText,
      title,
      company,
      location,
      portal: 'naukri'
    });

  } catch (error) {
    console.error('[Naukri Scraper] Error:', error);
    return createErrorResult(error.message, 'naukri');
  }
}

/**
 * Check if current page is a Naukri job posting
 * 
 * @returns {boolean} True if page appears to be a Naukri job posting
 */
export function isNaukriJobPage() {
  const url = window.location.href;
  return url.includes('naukri.com/job-listings') ||
         url.includes('naukri.com/job-detail') ||
         (url.includes('naukri.com') && document.querySelector('.jd-container'));
}

