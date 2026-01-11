/**
 * Generic Fallback Scraper
 * 
 * Fallback scraper for job portals not specifically supported.
 * Uses heuristics and common patterns to extract job descriptions.
 * 
 * Strategy:
 * 1. Look for common job description indicators in element classes/IDs
 * 2. Use semantic HTML elements (main, article, section)
 * 3. Filter out navigation, header, footer content
 * 4. Heuristic-based validation
 */

import {
  extractTextFromElement,
  isValidJobDescription,
  createSuccessResult,
  createErrorResult,
  cleanText
} from './base-scraper.js';

/**
 * Extract job description using generic heuristics
 * 
 * @returns {import('./base-scraper.js').ScraperResult} Extracted job data
 */
export function extractGenericJob() {
  try {
    let descriptionText = '';
    let bestElement = null;
    let bestScore = 0;

    // Common indicators of job description content
    const jobIndicators = [
      'job-description',
      'job-description-text',
      'job-details',
      'job-detail',
      'description',
      'job-content',
      'job-info',
      'position-description',
      'role-description'
    ];

    // Strategy 1: Look for elements with job-related classes/IDs
    const candidates = new Set();
    
    jobIndicators.forEach(indicator => {
      // Try ID
      const byId = document.getElementById(indicator);
      if (byId) candidates.add(byId);
      
      // Try classes
      const byClass = document.querySelectorAll(`.${indicator}, [class*="${indicator}"]`);
      byClass.forEach(el => candidates.add(el));
      
      // Try data attributes
      const byData = document.querySelectorAll(`[data-*="${indicator}"], [id*="${indicator}"]`);
      byData.forEach(el => candidates.add(el));
    });

    // Score each candidate
    candidates.forEach(element => {
      if (!element || element.tagName === 'SCRIPT' || element.tagName === 'STYLE') {
        return;
      }

      const text = extractTextFromElement(element);
      if (!text || text.length < 100) {
        return;
      }

      let score = 0;
      
      // Score based on text length (reasonable length is better)
      if (text.length >= 500 && text.length <= 10000) {
        score += 10;
      } else if (text.length > 100 && text.length < 500) {
        score += 5;
      }

      // Score based on element type
      const tagName = element.tagName.toLowerCase();
      if (tagName === 'main' || tagName === 'article') {
        score += 5;
      } else if (tagName === 'section' || tagName === 'div') {
        score += 3;
      }

      // Score based on classes/IDs
      const classList = element.className || '';
      const id = element.id || '';
      const combined = `${classList} ${id}`.toLowerCase();
      
      if (combined.includes('description') || combined.includes('details')) {
        score += 5;
      }
      if (combined.includes('job') || combined.includes('position') || combined.includes('role')) {
        score += 3;
      }

      // Penalize if in navigation/header/footer
      const isInNoise = element.closest('nav, header, footer, .nav, .header, .footer, .sidebar');
      if (isInNoise) {
        score -= 10;
      }

      if (score > bestScore) {
        bestScore = score;
        bestElement = element;
      }
    });

    // Strategy 2: If no good candidate, try semantic HTML
    if (!bestElement || bestScore < 5) {
      const semanticElements = document.querySelectorAll('main, article, [role="main"]');
      
      for (const element of semanticElements) {
        const text = extractTextFromElement(element);
        if (text.length > 500 && isValidJobDescription(text)) {
          bestElement = element;
          break;
        }
      }
    }

    // Extract text from best candidate
    if (bestElement) {
      descriptionText = extractTextFromElement(bestElement);
    }

    // Strategy 3: Last resort - try body, but filter heavily
    if (!descriptionText || !isValidJobDescription(descriptionText)) {
      const bodyClone = document.body.cloneNode(true);
      
      // Remove known noise elements
      const noiseSelectors = [
        'nav', 'header', 'footer',
        '.nav', '.header', '.footer',
        '.navigation', '.sidebar',
        'script', 'style', 'noscript',
        '[role="navigation"]',
        '[role="banner"]',
        '[role="contentinfo"]'
      ];
      
      noiseSelectors.forEach(selector => {
        try {
          const elements = bodyClone.querySelectorAll(selector);
          elements.forEach(el => el.remove());
        } catch (e) {
          // Invalid selector
        }
      });

      const bodyText = extractTextFromElement(bodyClone);
      if (isValidJobDescription(bodyText) && bodyText.length > descriptionText.length) {
        descriptionText = bodyText;
      }
    }

    // Extract basic metadata from page
    const title = document.querySelector('h1')?.textContent?.trim() || 
                  document.title.split('|')[0].trim() || 
                  document.title.split('-')[0].trim();

    const company = extractCompanyFromPage();

    const location = extractLocationFromPage();

    // Validate
    if (!isValidJobDescription(descriptionText)) {
      return createErrorResult(
        'No valid job description found. This page may not be a job posting, or uses an unsupported format.',
        'generic'
      );
    }

    return createSuccessResult({
      text: descriptionText,
      title: title || '',
      company: company || '',
      location: location || '',
      portal: 'generic'
    });

  } catch (error) {
    console.error('[Generic Scraper] Error:', error);
    return createErrorResult(error.message, 'generic');
  }
}

/**
 * Heuristic company extraction
 * 
 * @returns {string} Extracted company name
 */
function extractCompanyFromPage() {
  // Try common patterns
  const patterns = [
    document.querySelector('[class*="company"]')?.textContent,
    document.querySelector('[id*="company"]')?.textContent,
    document.querySelector('a[href*="/company/"]')?.textContent,
    document.querySelector('.organization')?.textContent
  ];

  for (const text of patterns) {
    if (text && text.trim().length > 0 && text.trim().length < 100) {
      return cleanText(text).trim();
    }
  }

  return '';
}

/**
 * Heuristic location extraction
 * 
 * @returns {string} Extracted location
 */
function extractLocationFromPage() {
  // Try common patterns
  const patterns = [
    document.querySelector('[class*="location"]')?.textContent,
    document.querySelector('[id*="location"]')?.textContent,
    document.querySelector('[class*="city"]')?.textContent
  ];

  for (const text of patterns) {
    if (text && text.trim().length > 0 && text.trim().length < 100) {
      return cleanText(text).trim();
    }
  }

  return '';
}

