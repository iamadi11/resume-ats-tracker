/**
 * Indeed Job Scraper
 * 
 * Extracts job descriptions from Indeed job postings.
 * 
 * Selector Strategy:
 * 1. Primary selectors target Indeed's job description container (id-based for stability)
 * 2. Fallback to class-based selectors for different page layouts
 * 3. Handle Indeed's structured sections (summary, requirements, etc.)
 * 4. Metadata extraction uses Indeed's consistent header structure
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
 * Extract job description from Indeed job posting page
 * 
 * @returns {import('./base-scraper.js').ScraperResult} Extracted job data
 */
export function extractIndeedJob() {
  try {
    // Indeed uses a job description container with ID or specific classes
    // Strategy: ID-based selectors first (most stable), then classes
    
    const descriptionSelectors = [
      // Primary: Main job description container (ID-based, most stable)
      '#jobDescriptionText',
      '#job-description-container',
      
      // Fallback: Class-based selectors
      '.jobsearch-jobDescriptionText',
      '.jobsearch-JobComponent-description',
      '[data-testid="job-description"]',
      
      // Alternative containers
      '.jobsearch-jobDescription',
      '.job-description',
      '[class*="jobDescription"]',
      
      // Structured sections (combine these)
      '.jobsearch-jobDescriptionText section',
      '.jobsearch-jobDescriptionText div[data-testid*="job-description"]',
      
      // Last resort: Content area
      'main #jobDescriptionText',
      '[id*="description"]'
    ];

    // Indeed often has structured sections - try to get all of them
    let descriptionText = '';
    
    // First, try the main container
    const mainContainer = document.querySelector('#jobDescriptionText') ||
                         document.querySelector('.jobsearch-jobDescriptionText');
    
    if (mainContainer) {
      descriptionText = extractTextFromElement(mainContainer);
    } else {
      // Fallback to selector array
      descriptionText = extractTextWithFallback(descriptionSelectors);
    }

    // Extract metadata
    const { title, company, location } = extractJobMetadata({
      titleSelectors: [
        // Job title selectors
        'h1.jobsearch-JobInfoHeader-title',
        '.jobsearch-JobInfoHeader-title',
        'h2[class*="jobTitle"]',
        'h1',
        '[data-testid="job-title"]'
      ],
      companySelectors: [
        // Company name selectors
        '[data-testid="job-header-company-name"]',
        '.jobsearch-InlineCompanyRating',
        '.jobsearch-CompanyReview--heading',
        '[data-testid="inlineHeader-companyName"]',
        '[class*="companyName"]',
        'a[data-testid="company-name"]'
      ],
      locationSelectors: [
        // Location selectors
        '[data-testid="job-location"]',
        '.jobsearch-JobInfoHeader-subtitle',
        '[data-testid="job-location-banner"]',
        '[class*="location"]'
      ]
    });

    // Validate extracted description
    if (!isValidJobDescription(descriptionText)) {
      return createErrorResult(
        'No valid job description found on Indeed page. The page may not be a job posting, or the structure has changed.',
        'indeed'
      );
    }

    return createSuccessResult({
      text: descriptionText,
      title,
      company,
      location,
      portal: 'indeed'
    });

  } catch (error) {
    console.error('[Indeed Scraper] Error:', error);
    return createErrorResult(error.message, 'indeed');
  }
}

/**
 * Check if current page is an Indeed job posting
 * 
 * @returns {boolean} True if page appears to be an Indeed job posting
 */
export function isIndeedJobPage() {
  const url = window.location.href;
  return url.includes('indeed.com/viewjob') || 
         url.includes('indeed.com/jobs') ||
         (url.includes('indeed.com') && document.querySelector('#jobDescriptionText'));
}

