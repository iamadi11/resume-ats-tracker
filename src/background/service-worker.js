/**
 * Background Service Worker
 * 
 * Main entry point for the extension's background processing.
 * In Manifest V3, this replaces background pages/scripts.
 * 
 * Key responsibilities:
 * - Message routing between extension components
 * - File processing orchestration
 * - Job description parsing
 * - ATS score calculation
 * - Content script coordination
 * 
 * Note: Service workers are event-driven and stateless.
 * Use in-memory state during active sessions only.
 */

import { onMessage } from '../shared/messaging.js';
import { MESSAGE_TYPES } from '../shared/constants.js';
import { handleError, ERROR_TYPES } from '../shared/error-handler.js';
import { clearAllData, verifyNoDataPersistence } from '../shared/privacy-utils.js';

// Extension lifecycle handlers

/**
 * Service worker installation/activation
 * Runs when extension is installed or updated
 */
chrome.runtime.onInstalled.addListener((details) => {
  console.log('[Service Worker] Extension installed/updated:', details.reason);
  
  if (details.reason === 'install') {
    // First-time installation
    console.log('[Service Worker] First-time install - initialize settings');
    initializeSettings();
  } else if (details.reason === 'update') {
    // Extension update
    console.log('[Service Worker] Extension updated:', details.previousVersion);
  }
});

/**
 * Service worker activation
 * Runs when service worker starts
 */
self.addEventListener('activate', () => {
  console.log('[Service Worker] Service worker activated');
});

/**
 * Initialize default settings
 */
async function initializeSettings() {
  try {
    // Only store non-sensitive settings
    // NO resume or job description data is stored
    await chrome.storage.local.set({
      'settings': {
        enabledPortals: ['linkedin.com', 'indeed.com', 'glassdoor.com'],
        autoExtract: true,
        theme: 'light'
      }
    });
    console.log('[Service Worker] Settings initialized (no sensitive data)');
  } catch (error) {
    console.error('[Service Worker] Error initializing settings:', error);
  }
}

// Message handling

/**
 * Main message router
 * Handles all messages from popup, content scripts, and options page
 */
const cleanup = onMessage(async (message, sender, sendResponse) => {
  try {
    console.log('[Service Worker] Received message:', message.type, 'from:', sender.id);
    
    switch (message.type) {
      case MESSAGE_TYPES.PING:
        // Health check
        sendResponse({ type: MESSAGE_TYPES.PONG, payload: { timestamp: Date.now() } });
        break;
        
      case MESSAGE_TYPES.PROCESS_RESUME:
        // Process resume file (to be implemented)
        sendResponse({
          type: MESSAGE_TYPES.RESUME_PROCESSED,
          payload: { message: 'Resume processing not yet implemented' }
        });
        break;
        
      case MESSAGE_TYPES.PROCESS_JOB_DESC:
        // Process job description (to be implemented)
        sendResponse({
          type: MESSAGE_TYPES.JOB_PROCESSED,
          payload: { message: 'Job description processing not yet implemented' }
        });
        break;
        
      case MESSAGE_TYPES.JOB_EXTRACTED:
        // Job extracted from content script (to be implemented)
        sendResponse({
          type: MESSAGE_TYPES.JOB_PROCESSED,
          payload: { message: 'Job extraction processing not yet implemented' }
        });
        break;
        
      case MESSAGE_TYPES.CALCULATE_SCORE:
        // Calculate ATS score (to be implemented)
        // This will call the scoring engine
        sendResponse({
          type: MESSAGE_TYPES.SCORE_CALCULATED,
          payload: { message: 'Score calculation not yet implemented' }
        });
        break;
        
      case 'GET_FEEDBACK':
        // Generate feedback (to be implemented)
        sendResponse({
          type: 'FEEDBACK_GENERATED',
          payload: { message: 'Feedback generation not yet implemented' }
        });
        break;
        
      case 'OPEN_SIDE_PANEL':
        // Open side panel
        chrome.sidePanel.open({}).catch(() => {
          // Side panel might not be available
        });
        sendResponse({ type: MESSAGE_TYPES.PONG });
        break;
        
      case 'GET_CURRENT_STATE':
        // Return current state (to be implemented with storage)
        sendResponse({
          score: null,
          feedback: null
        });
        break;
        
      case 'SCORE_UPDATE':
        // Store score update for side panel
        // Side panel will listen for this
        sendResponse({ type: MESSAGE_TYPES.PONG });
        break;
        
      case MESSAGE_TYPES.EXTRACT_JOB_FROM_PAGE:
        // Request job extraction from content script
        if (sender.tab?.id) {
          // Forward to content script (to be implemented)
          sendResponse({
            type: MESSAGE_TYPES.JOB_EXTRACTED,
            payload: { message: 'Job extraction not yet implemented' }
          });
        }
        break;
        
      default:
        console.warn('[Service Worker] Unknown message type:', message.type);
        sendResponse({
          type: MESSAGE_TYPES.ERROR,
          payload: { error: `Unknown message type: ${message.type}` }
        });
    }
  } catch (error) {
    console.error('[Service Worker] Error handling message:', error);
    sendResponse({
      type: MESSAGE_TYPES.ERROR,
      payload: { error: error.message }
    });
  }
  
  return true; // Keep message channel open for async response
});

// Tab management

/**
 * Handle tab updates (e.g., when user navigates to a job portal)
 */
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // Only process when page is fully loaded
  if (changeInfo.status === 'complete' && tab.url) {
    console.log('[Service Worker] Tab updated:', tab.url);
    
    // Check if this is a known job portal (to be implemented)
    // If yes, can trigger content script actions
  }
});

/**
 * Handle extension icon click
 */
chrome.action.onClicked.addListener((tab) => {
  // This only fires if no popup is set in manifest.json
  // Since we have a popup, this won't typically fire
  console.log('[Service Worker] Extension icon clicked on tab:', tab.id);
});

// Utility functions

/**
 * Get the current active tab
 * @returns {Promise<chrome.tabs.Tab>} Active tab
 */
export async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

/**
 * Check if URL matches a job portal pattern
 * @param {string} url - URL to check
 * @returns {boolean} True if URL is a known job portal
 */
export function isJobPortal(url) {
  const jobPortals = [
    'linkedin.com/jobs',
    'indeed.com',
    'glassdoor.com/job-listing',
    'monster.com',
    'ziprecruiter.com'
  ];
  
  try {
    const urlObj = new URL(url);
    return jobPortals.some(portal => urlObj.hostname.includes(portal.split('/')[0]));
  } catch {
    return false;
  }
}

