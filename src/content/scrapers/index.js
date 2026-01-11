/**
 * Scraper Registry
 * 
 * Central registry for all job portal scrapers.
 * Routes extraction requests to the appropriate scraper based on the current page.
 */

import { extractLinkedInJob, isLinkedInJobPage } from './linkedin.js';
import { extractIndeedJob, isIndeedJobPage } from './indeed.js';
import { extractNaukriJob, isNaukriJobPage } from './naukri.js';
import { extractGreenhouseJob, isGreenhouseJobPage } from './greenhouse.js';
import { extractLeverJob, isLeverJobPage } from './lever.js';
import { extractGenericJob } from './generic.js';

/**
 * Scraper configuration
 * Each entry defines detection and extraction functions for a portal
 */
const SCRAPERS = [
  {
    name: 'linkedin',
    detect: isLinkedInJobPage,
    extract: extractLinkedInJob
  },
  {
    name: 'indeed',
    detect: isIndeedJobPage,
    extract: extractIndeedJob
  },
  {
    name: 'naukri',
    detect: isNaukriJobPage,
    extract: extractNaukriJob
  },
  {
    name: 'greenhouse',
    detect: isGreenhouseJobPage,
    extract: extractGreenhouseJob
  },
  {
    name: 'lever',
    detect: isLeverJobPage,
    extract: extractLeverJob
  }
];

/**
 * Detect which portal scraper to use for the current page
 * 
 * @returns {Object|null} Scraper configuration or null if none match
 */
export function detectPortal() {
  for (const scraper of SCRAPERS) {
    try {
      if (scraper.detect()) {
        return scraper;
      }
    } catch (error) {
      console.error(`[Scraper Registry] Error detecting ${scraper.name}:`, error);
      continue;
    }
  }
  
  return null;
}

/**
 * Extract job description from current page
 * 
 * @returns {import('./base-scraper.js').ScraperResult} Extracted job data
 */
export function extractJobFromPage() {
  // Try to detect specific portal
  const scraper = detectPortal();
  
  if (scraper) {
    console.log(`[Scraper Registry] Using ${scraper.name} scraper`);
    try {
      return scraper.extract();
    } catch (error) {
      console.error(`[Scraper Registry] Error with ${scraper.name} scraper:`, error);
      // Fall through to generic scraper
    }
  }
  
  // Fallback to generic scraper
  console.log('[Scraper Registry] Using generic scraper');
  return extractGenericJob();
}

/**
 * Get portal name for current page
 * 
 * @returns {string} Portal name or 'unknown'
 */
export function getPortalName() {
  const scraper = detectPortal();
  return scraper ? scraper.name : 'generic';
}

