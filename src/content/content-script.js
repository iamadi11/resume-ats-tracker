/**
 * Content Script
 * 
 * Injected into web pages to:
 * - Detect job postings on job portals
 * - Extract job descriptions
 * - Inject floating UI widget
 * - Communicate with background service worker
 * 
 * Runs in the page context (isolated from page's JavaScript)
 */

import { sendMessageFromContent, onMessage } from '../shared/messaging.js';
import { MESSAGE_TYPES, CONTENT_SCRIPT_ID } from '../shared/constants.js';
import { extractJobFromPage, getPortalName } from './scrapers/index.js';

// Mark that content script is loaded
if (!window[CONTENT_SCRIPT_ID]) {
  window[CONTENT_SCRIPT_ID] = true;
  console.log('[Content Script] Content script loaded on:', window.location.href);
}

/**
 * Initialize content script
 */
function init() {
  // Set up message listeners
  setupMessageListeners();
  
  // Observe DOM for job posting detection (to be implemented)
  // observeJobPostings();
  
  console.log('[Content Script] Initialized on:', window.location.href);
}

/**
 * Set up message listeners for communication with background service worker
 */
function setupMessageListeners() {
  onMessage(async (message, sender, sendResponse) => {
    try {
      console.log('[Content Script] Received message:', message.type);
      
      switch (message.type) {
        case MESSAGE_TYPES.EXTRACT_JOB_FROM_PAGE:
          // Extract job description from current page
          try {
            const jobData = extractJobFromPage();
            sendResponse({
              type: MESSAGE_TYPES.JOB_EXTRACTED,
              payload: jobData
            });
          } catch (error) {
            sendResponse({
              type: MESSAGE_TYPES.ERROR,
              payload: { error: error.message || 'Failed to extract job description' }
            });
          }
          break;
          
        case MESSAGE_TYPES.INJECT_WIDGET:
          // Inject floating widget (to be implemented)
          injectWidget();
          sendResponse({ type: MESSAGE_TYPES.PONG });
          break;
          
        case MESSAGE_TYPES.REMOVE_WIDGET:
          // Remove floating widget (to be implemented)
          removeWidget();
          sendResponse({ type: MESSAGE_TYPES.PONG });
          break;
          
        case MESSAGE_TYPES.PING:
          // Health check
          sendResponse({ type: MESSAGE_TYPES.PONG });
          break;
          
        default:
          console.warn('[Content Script] Unknown message type:', message.type);
          sendResponse({
            type: MESSAGE_TYPES.ERROR,
            payload: { error: `Unknown message type: ${message.type}` }
          });
      }
    } catch (error) {
      console.error('[Content Script] Error handling message:', error);
      sendResponse({
        type: MESSAGE_TYPES.ERROR,
        payload: { error: error.message }
      });
    }
    
    return true; // Keep channel open for async response
  });
}

/**
 * Extract job description from current page
 * Uses portal-specific scrapers with generic fallback
 * 
 * @returns {Object} Extracted job data with success status
 */
function extractJobDescription() {
  console.log('[Content Script] Extracting job description from page');
  
  try {
    const result = extractJobFromPage();
    
    // Return structured result (message sending handled by caller)
    return {
      success: result.success,
      text: result.text || '',
      title: result.title || '',
      company: result.company || '',
      location: result.location || '',
      url: result.url || window.location.href,
      portal: result.portal || 'unknown',
      extractedAt: result.extractedAt || Date.now(),
      error: result.error
    };
  } catch (error) {
    console.error('[Content Script] Error extracting job description:', error);
    return {
      success: false,
      text: '',
      title: '',
      company: '',
      location: '',
      url: window.location.href,
      portal: getPortalName(),
      extractedAt: Date.now(),
      error: error.message
    };
  }
}

/**
 * Inject floating widget into page
 * (Placeholder - to be implemented)
 */
function injectWidget() {
  console.log('[Content Script] Injecting widget (not yet implemented)');
  // Widget injection logic will be implemented here
}

/**
 * Remove floating widget from page
 * (Placeholder - to be implemented)
 */
function removeWidget() {
  console.log('[Content Script] Removing widget (not yet implemented)');
  // Widget removal logic will be implemented here
}

/**
 * Notify background service worker that page is ready for job extraction
 */
async function notifyPageReady() {
  try {
    await sendMessageFromContent({
      type: MESSAGE_TYPES.PING,
      payload: { pageUrl: window.location.href }
    });
  } catch (error) {
    console.error('[Content Script] Error notifying background:', error);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Notify background on load
notifyPageReady();

