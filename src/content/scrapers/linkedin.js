/**
 * LinkedIn Job Scraper
 * 
 * Extracts job descriptions from LinkedIn job postings.
 * 
 * Selector Strategy:
 * 1. Primary selectors target the main job description container (most common)
 * 2. Fallback selectors account for LinkedIn's dynamic rendering and A/B testing
 * 3. Text extraction from description-show-more container handles expandable content
 * 4. Metadata selectors use common LinkedIn classes and data attributes
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
 * Extract job description from LinkedIn job posting page
 * 
 * @returns {import('./base-scraper.js').ScraperResult} Extracted job data
 */
export function extractLinkedInJob() {
  try {
    // LinkedIn uses multiple possible structures for job descriptions
    // Strategy: Try most specific first, then fallback to more generic
    
    const descriptionSelectors = [
      // Primary: Main job description container (most common)
      'div[data-test-id="job-details"]',
      'div.description__text',
      '.description__text',
      '.show-more-less-html__markup',
      
      // Fallback: Alternative containers
      '.jobs-description-content__text',
      '.jobs-box__html-content',
      '.jobs-description__text',
      
      // Generic fallback: Any element with description classes
      '[class*="description"]',
      '[class*="job-details"]',
      '[data-test-id*="description"]',
      
      // Last resort: Article or main content area
      'article section',
      'main .jobs-box'
    ];

    // Extract job description text
    let descriptionText = '';
    
    // Try to get the description element directly
    const descriptionElement = document.querySelector(descriptionSelectors[0]) ||
                               document.querySelector(descriptionSelectors[1]) ||
                               document.querySelector(descriptionSelectors[2]);

    if (descriptionElement) {
      // Extract from main element
      descriptionText = extractTextFromElement(descriptionElement);
      
      // LinkedIn often has expandable content - try to get full text
      const showMoreButton = descriptionElement.querySelector('button[aria-label*="more" i]');
      if (showMoreButton && !showMoreButton.ariaExpanded) {
        // If "Show more" button exists and not expanded, try to click it
        // Note: This may not work due to React state, but worth trying
        try {
          showMoreButton.click();
          // Wait a bit for content to expand (basic approach)
          setTimeout(() => {
            descriptionText = extractTextFromElement(descriptionElement);
          }, 300);
        } catch (e) {
          // Click failed, use current text
        }
      }
      
      // Also try to get text from nested show-more container
      const showMoreContent = descriptionElement.querySelector('.show-more-less-html__markup');
      if (showMoreContent) {
        const additionalText = extractTextFromElement(showMoreContent);
        if (additionalText.length > descriptionText.length) {
          descriptionText = additionalText;
        }
      }
    } else {
      // Fallback to selector array method
      descriptionText = extractTextWithFallback(descriptionSelectors);
    }

    // Extract metadata
    const { title, company, location } = extractJobMetadata({
      titleSelectors: [
        // Job title selectors
        'h1.jobs-unified-top-card__job-title',
        'h1.job-details-jobs-unified-top-card__job-title',
        'h1[data-test-id="job-details-title"]',
        '.jobs-unified-top-card__job-title',
        'h1',
        '[data-test-id*="title"]'
      ],
      companySelectors: [
        // Company name selectors
        'a.jobs-unified-top-card__company-name',
        '.jobs-unified-top-card__company-name',
        '.jobs-unified-top-card__primary-description a',
        '[data-test-id="job-details-company-name"]',
        '[class*="company-name"]'
      ],
      locationSelectors: [
        // Location selectors
        '.jobs-unified-top-card__primary-description-without-tagline',
        '.jobs-unified-top-card__bullet',
        '[data-test-id="job-details-location"]',
        '[class*="location"]',
        '.jobs-unified-top-card__workplace-type'
      ]
    });

    // Validate extracted description
    if (!isValidJobDescription(descriptionText)) {
      return createErrorResult(
        'No valid job description found on LinkedIn page. The page may not be a job posting, or the structure has changed.',
        'linkedin'
      );
    }

    return createSuccessResult({
      text: descriptionText,
      title,
      company,
      location,
      portal: 'linkedin'
    });

  } catch (error) {
    console.error('[LinkedIn Scraper] Error:', error);
    return createErrorResult(error.message, 'linkedin');
  }
}

/**
 * Check if current page is a LinkedIn job posting
 * 
 * @returns {boolean} True if page appears to be a LinkedIn job posting
 */
export function isLinkedInJobPage() {
  const url = window.location.href;
  return url.includes('linkedin.com/jobs/view/') || 
         url.includes('linkedin.com/jobs/search/') ||
         (url.includes('linkedin.com') && document.querySelector('[data-test-id="job-details"]'));
}

