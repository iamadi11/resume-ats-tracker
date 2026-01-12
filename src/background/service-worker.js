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
import { processResumeFile } from '../processors/file-processor.js';

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
        // Process resume file
        handleProcessResume(message.payload, sendResponse).catch(error => {
          console.error('[Service Worker] Error processing resume:', error);
          sendResponse({
            type: MESSAGE_TYPES.RESUME_PROCESS_ERROR,
            payload: { error: error.message || 'Failed to process resume' }
          });
        });
        return true; // Keep channel open for async response
        
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
        
      case 'TOGGLE_DRAWER':
        // Toggle drawer widget on current page
        const activeTab = await getActiveTab();
        if (activeTab && activeTab.id) {
          try {
            await chrome.tabs.sendMessage(activeTab.id, {
              type: 'TOGGLE_WIDGET'
            });
            sendResponse({ type: MESSAGE_TYPES.PONG });
          } catch (error) {
            // If content script not loaded, try to inject drawer
            try {
              await chrome.tabs.sendMessage(activeTab.id, {
                type: MESSAGE_TYPES.INJECT_WIDGET
              });
              sendResponse({ type: MESSAGE_TYPES.PONG });
            } catch (injectError) {
              sendResponse({
                type: MESSAGE_TYPES.ERROR,
                payload: { error: 'Could not toggle drawer. Please refresh the page.' }
              });
            }
          }
        } else {
          sendResponse({
            type: MESSAGE_TYPES.ERROR,
            payload: { error: 'No active tab found' }
          });
        }
        return true; // Keep channel open for async response
        
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
        handleExtractJobFromPage(sender.tab?.id, sendResponse).catch(error => {
          console.error('[Service Worker] Error extracting job:', error);
          sendResponse({
            type: MESSAGE_TYPES.ERROR,
            payload: { error: error.message || 'Failed to extract job description' }
          });
        });
        return true; // Keep channel open for async response
        
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
 * Injects or toggles the drawer on the current page
 */
chrome.action.onClicked.addListener(async (tab) => {
  console.log('[Service Worker] Extension icon clicked on tab:', tab.id);
  
  if (!tab.id) {
    console.error('[Service Worker] No tab ID available');
    return;
  }

  // Get tab URL to check if we can inject
  let tabInfo;
  try {
    tabInfo = await chrome.tabs.get(tab.id);
  } catch (error) {
    console.error('[Service Worker] Error getting tab info:', error);
    return;
  }
  
  const url = tabInfo.url || '';
  
  // Don't inject on chrome://, chrome-extension://, or about: pages
  if (url.startsWith('chrome://') || 
      url.startsWith('chrome-extension://') || 
      url.startsWith('about:') ||
      url.startsWith('moz-extension://')) {
    console.log('[Service Worker] Cannot inject drawer on this page type:', url);
    return;
  }

  // Check if content script is loaded, wait if needed
  let isLoaded = await isContentScriptLoaded(tab.id);
  if (!isLoaded) {
    console.log('[Service Worker] Content script not immediately available, waiting...');
    isLoaded = await waitForContentScript(tab.id, 3, 300);
  }

  if (!isLoaded) {
    console.log('[Service Worker] Content script not loaded after waiting, attempting to inject...');
    // Try to inject content script programmatically
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content-script.js']
      });
      console.log('[Service Worker] Content script injected, waiting for initialization...');
      // Wait for content script to initialize
      await new Promise(resolve => setTimeout(resolve, 500));
      isLoaded = await waitForContentScript(tab.id, 3, 300);
    } catch (scriptError) {
      console.error('[Service Worker] Error injecting content script:', scriptError);
      // Content script might already be injected or page doesn't allow injection
      // Try to send message anyway - it might work if script is loading
      isLoaded = false;
    }
  }

  if (!isLoaded) {
    console.error('[Service Worker] Content script not available. The page may need to be refreshed.');
    // Still try to send message - content script might be loading
  }

  // Try to toggle or inject drawer
  try {
    // Try to toggle the drawer (if it exists) or inject it
    const response = await chrome.tabs.sendMessage(tab.id, {
      type: 'TOGGLE_WIDGET'
    });
    console.log('[Service Worker] Drawer toggled successfully');
  } catch (error) {
    // If toggle failed, try to inject drawer
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log('[Service Worker] Toggle failed, attempting to inject drawer:', errorMessage);
    
    if (errorMessage.includes('Could not establish connection') || 
        errorMessage.includes('Receiving end does not exist')) {
      // Content script definitely not loaded
      console.error('[Service Worker] Content script not available. Please refresh the page and try again.');
      return;
    }
    
    try {
      await chrome.tabs.sendMessage(tab.id, {
        type: MESSAGE_TYPES.INJECT_WIDGET
      });
      console.log('[Service Worker] Drawer injection message sent');
    } catch (injectError) {
      console.error('[Service Worker] Error injecting drawer:', injectError);
      // Final fallback: try reloading the tab to ensure content script loads
      console.log('[Service Worker] Attempting to reload tab to load content script...');
      try {
        await chrome.tabs.reload(tab.id);
        // After reload, content script should auto-inject
        console.log('[Service Worker] Tab reloaded. Content script should load automatically.');
      } catch (reloadError) {
        console.error('[Service Worker] Could not reload tab:', reloadError);
      }
    }
  }
});

// Handle keyboard commands
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'toggle-drawer') {
    const activeTab = await getActiveTab();
    if (activeTab && activeTab.id) {
      try {
        await chrome.tabs.sendMessage(activeTab.id, {
          type: 'TOGGLE_WIDGET'
        });
      } catch (error) {
        console.error('[Service Worker] Error toggling drawer:', error);
        // Try to inject drawer if content script not loaded
        try {
          await chrome.tabs.sendMessage(activeTab.id, {
            type: MESSAGE_TYPES.INJECT_WIDGET
          });
        } catch (injectError) {
          console.error('[Service Worker] Error injecting drawer:', injectError);
        }
      }
    }
  }
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


/**
 * Handle resume file processing
 * 
 * @param {Object} payload - File processing payload
 * @param {Array<number>} payload.file - File data as array of bytes
 * @param {string} payload.fileName - File name
 * @param {string} payload.fileType - File MIME type
 * @param {Function} sendResponse - Response callback
 */
async function handleProcessResume(payload, sendResponse) {
  try {
    const { file: fileDataArray, fileName, fileType } = payload;

    if (!fileDataArray || !Array.isArray(fileDataArray)) {
      throw new Error('Invalid file data');
    }

    // Convert array back to Uint8Array and then to ArrayBuffer
    const uint8Array = new Uint8Array(fileDataArray);
    const arrayBuffer = uint8Array.buffer;

    // Create a File-like object for the processor
    const blob = new Blob([arrayBuffer], { type: fileType });
    const file = new File([blob], fileName, { type: fileType });

    // Process the file
    const result = await processResumeFile(file, {
      format: detectFormatFromMimeType(fileType, fileName)
    });

    if (result.success) {
      sendResponse({
        type: MESSAGE_TYPES.RESUME_PROCESSED,
        payload: { resume: result.resume }
      });
    } else {
      sendResponse({
        type: MESSAGE_TYPES.RESUME_PROCESS_ERROR,
        payload: { error: result.error || 'Failed to process resume' }
      });
    }
  } catch (error) {
    console.error('[Service Worker] Resume processing error:', error);
    sendResponse({
      type: MESSAGE_TYPES.RESUME_PROCESS_ERROR,
      payload: { error: error.message || 'Failed to process resume' }
    });
  }
}

/**
 * Detect file format from MIME type and filename
 */
function detectFormatFromMimeType(mimeType, fileName) {
  const type = mimeType?.toLowerCase() || '';
  const name = fileName?.toLowerCase() || '';

  if (type === 'application/pdf' || name.endsWith('.pdf')) {
    return 'pdf';
  }
  if (type.includes('wordprocessingml') || type.includes('msword') || name.endsWith('.docx') || name.endsWith('.doc')) {
    return 'docx';
  }
  if (type.startsWith('text/') || name.endsWith('.txt')) {
    return 'text';
  }

  return undefined;
}

/**
 * Check if content script is loaded on a tab
 * 
 * @param {number} tabId - Tab ID to check
 * @returns {Promise<boolean>} True if content script is loaded
 */
async function isContentScriptLoaded(tabId) {
  try {
    // Try to ping the content script
    const response = await chrome.tabs.sendMessage(tabId, {
      type: MESSAGE_TYPES.PING
    });
    return response && response.type === MESSAGE_TYPES.PONG;
  } catch (error) {
    return false;
  }
}

/**
 * Wait for content script to be ready with retries
 * 
 * @param {number} tabId - Tab ID to check
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} delayMs - Delay between retries in milliseconds
 * @returns {Promise<boolean>} True if content script is loaded
 */
async function waitForContentScript(tabId, maxRetries = 3, delayMs = 300) {
  for (let i = 0; i < maxRetries; i++) {
    const isLoaded = await isContentScriptLoaded(tabId);
    if (isLoaded) {
      return true;
    }
    
    // Wait before retrying (except on last attempt)
    if (i < maxRetries - 1) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  return false;
}

/**
 * Handle job extraction from page
 * Forwards extraction request to content script and returns result
 * 
 * @param {number} tabId - Tab ID to extract job from (optional, uses active tab if not provided)
 * @param {Function} sendResponse - Response callback
 */
async function handleExtractJobFromPage(tabId, sendResponse) {
  try {
    // Get tab ID if not provided
    let targetTabId = tabId;
    if (!targetTabId) {
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!activeTab || !activeTab.id) {
        throw new Error('No active tab found');
      }
      targetTabId = activeTab.id;
    }

    // Check if content script is loaded, wait with retries if needed
    let isLoaded = await isContentScriptLoaded(targetTabId);
    if (!isLoaded) {
      console.log('[Service Worker] Content script not immediately available, waiting...');
      // Wait for content script to load (it might still be initializing)
      isLoaded = await waitForContentScript(targetTabId, 3, 300);
    }

    if (!isLoaded) {
      // Content script still not available
      const tab = await chrome.tabs.get(targetTabId);
      const url = tab.url || '';
      
      if (url.startsWith('chrome://') || 
          url.startsWith('chrome-extension://') || 
          url.startsWith('about:') ||
          url.startsWith('moz-extension://')) {
        throw new Error('Cannot extract from this page type. Please navigate to a job portal page (e.g., LinkedIn, Indeed, Glassdoor).');
      } else {
        throw new Error('Content script is not available on this page. Please refresh the page and try again, or make sure you are on a job portal page.');
      }
    }

    // Send message to content script in the target tab
    const response = await chrome.tabs.sendMessage(targetTabId, {
      type: MESSAGE_TYPES.EXTRACT_JOB_FROM_PAGE
    });

    if (!response) {
      throw new Error('No response from content script. Make sure you are on a job portal page.');
    }

    // Check if extraction was successful
    if (response.type === MESSAGE_TYPES.JOB_EXTRACTED) {
      sendResponse({
        type: MESSAGE_TYPES.JOB_EXTRACTED,
        payload: response.payload
      });
    } else if (response.type === MESSAGE_TYPES.ERROR) {
      sendResponse({
        type: MESSAGE_TYPES.ERROR,
        payload: response.payload || { error: 'Failed to extract job description' }
      });
    } else {
      // Unexpected response type
      sendResponse({
        type: MESSAGE_TYPES.ERROR,
        payload: { error: 'Unexpected response from content script' }
      });
    }
  } catch (error) {
    console.error('[Service Worker] Error in handleExtractJobFromPage:', error);
    
    // Extract error message (handle both Error objects and strings)
    const errorMessage = error instanceof Error ? error.message : String(error || 'Unknown error');
    
    // Handle specific Chrome extension errors
    if (errorMessage.includes('Could not establish connection') || 
        errorMessage.includes('Receiving end does not exist')) {
      sendResponse({
        type: MESSAGE_TYPES.ERROR,
        payload: { 
          error: 'Content script not available. Please refresh the page and try again, or navigate to a job portal page.' 
        }
      });
    } else {
      sendResponse({
        type: MESSAGE_TYPES.ERROR,
        payload: { error: errorMessage || 'Failed to extract job description' }
      });
    }
  }
}
