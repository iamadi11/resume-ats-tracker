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
  
  // Auto-inject drawer on job portal pages
  const url = window.location.href;
  const jobPortals = ['linkedin.com', 'indeed.com', 'glassdoor.com', 'monster.com', 'ziprecruiter.com'];
  const isJobPortal = jobPortals.some(portal => url.includes(portal));
  
  if (isJobPortal) {
    // Wait a bit for page to stabilize, then inject drawer
    setTimeout(() => {
      injectWidget();
    }, 1000);
  }
  
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
          // Inject floating drawer widget
          injectWidget();
          sendResponse({ type: MESSAGE_TYPES.PONG });
          break;
          
        case MESSAGE_TYPES.REMOVE_WIDGET:
          // Remove floating drawer widget
          removeWidget();
          sendResponse({ type: MESSAGE_TYPES.PONG });
          break;
          
        case 'TOGGLE_WIDGET':
          // Toggle drawer visibility
          toggleWidget();
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

// Drawer state management
let drawerRoot = null;
let drawerContainer = null;

/**
 * Inject drawer widget into page
 */
function injectWidget() {
  console.log('[Content Script] Injecting drawer widget');
  
  // Check if drawer already exists
  if (drawerContainer && document.body.contains(drawerContainer)) {
    console.log('[Content Script] Drawer already exists');
    return;
  }

  try {
    // Create container for drawer
    drawerContainer = document.createElement('div');
    drawerContainer.id = 'ats-drawer-root';
    drawerContainer.setAttribute('data-extension', 'resume-ats-tracker');
    
    // Append to body
    document.body.appendChild(drawerContainer);

    // Import and inject drawer
    // In development: direct import, in production: from assets
    (async () => {
      try {
        // Try direct import first (works in dev)
        const module = await import('./drawer/DrawerApp.js');
        const { injectDrawer } = module;
        drawerRoot = injectDrawer(drawerContainer);
        console.log('[Content Script] Drawer injected successfully');
      } catch (error) {
        console.log('[Content Script] Direct import failed, trying runtime URL:', error);
        // Fallback: import from runtime URL (production build)
        try {
          // Get the drawer bundle URL - Vite will generate this as assets/drawer-[hash].js
          // We need to find it dynamically or use a known pattern
          const response = await fetch(chrome.runtime.getURL('assets/drawer.js'));
          if (response.ok) {
            const drawerUrl = chrome.runtime.getURL('assets/drawer.js');
            const module = await import(drawerUrl);
            const { injectDrawer } = module;
            drawerRoot = injectDrawer(drawerContainer);
            console.log('[Content Script] Drawer injected from runtime URL');
          } else {
            throw new Error('Drawer bundle not found');
          }
        } catch (fallbackError) {
          console.error('[Content Script] Error injecting drawer:', fallbackError);
          // Clean up on error
          if (drawerContainer && document.body.contains(drawerContainer)) {
            document.body.removeChild(drawerContainer);
          }
          drawerContainer = null;
        }
      }
    })();
  } catch (error) {
    console.error('[Content Script] Error creating drawer container:', error);
  }
}

/**
 * Remove drawer widget from page
 */
function removeWidget() {
  console.log('[Content Script] Removing drawer widget');
  
  if (drawerRoot) {
    try {
      drawerRoot.unmount();
      drawerRoot = null;
    } catch (error) {
      console.error('[Content Script] Error unmounting drawer:', error);
    }
  }
  
  if (drawerContainer && document.body.contains(drawerContainer)) {
    try {
      document.body.removeChild(drawerContainer);
      drawerContainer = null;
    } catch (error) {
      console.error('[Content Script] Error removing drawer container:', error);
    }
  }
}

/**
 * Toggle drawer visibility
 */
function toggleWidget() {
  if (drawerContainer && document.body.contains(drawerContainer)) {
    removeWidget();
  } else {
    injectWidget();
  }
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

