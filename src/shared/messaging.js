/**
 * Message-passing utilities for Chrome Extension communication
 * 
 * Provides a unified interface for message passing between:
 * - Popup UI ↔ Background Service Worker
 * - Content Scripts ↔ Background Service Worker
 * - Options Page ↔ Background Service Worker
 */

import { MESSAGE_TYPES } from './constants.js';

/**
 * Message protocol structure
 * @typedef {Object} ExtensionMessage
 * @property {string} type - Message type from MESSAGE_TYPES
 * @property {*} payload - Message payload/data
 * @property {string} [id] - Optional message ID for request/response tracking
 * @property {number} [timestamp] - Message timestamp
 */

/**
 * Send a message from any extension context to the background service worker
 * 
 * @param {ExtensionMessage} message - Message object
 * @returns {Promise<ExtensionMessage>} Response from service worker
 * 
 * @example
 * const response = await sendMessage({
 *   type: MESSAGE_TYPES.PROCESS_RESUME,
 *   payload: { file: fileData, format: 'pdf' }
 * });
 */
export async function sendMessage(message) {
  try {
    const response = await chrome.runtime.sendMessage({
      ...message,
      timestamp: Date.now()
    });
    
    if (chrome.runtime.lastError) {
      throw new Error(chrome.runtime.lastError.message);
    }
    
    return response;
  } catch (error) {
    console.error('[Messaging] Error sending message:', error);
    throw error;
  }
}

/**
 * Send a message from content script to background service worker
 * 
 * @param {ExtensionMessage} message - Message object
 * @returns {Promise<ExtensionMessage>} Response from service worker
 */
export async function sendMessageFromContent(message) {
  try {
    const response = await chrome.runtime.sendMessage({
      ...message,
      source: 'content-script',
      timestamp: Date.now()
    });
    
    if (chrome.runtime.lastError) {
      throw new Error(chrome.runtime.lastError.message);
    }
    
    return response;
  } catch (error) {
    console.error('[Messaging] Error sending message from content script:', error);
    throw error;
  }
}

/**
 * Send a message from background service worker to a specific tab's content script
 * 
 * @param {number} tabId - Target tab ID
 * @param {ExtensionMessage} message - Message object
 * @returns {Promise<ExtensionMessage>} Response from content script
 */
export async function sendMessageToTab(tabId, message) {
  try {
    const response = await chrome.tabs.sendMessage(tabId, {
      ...message,
      source: 'background',
      timestamp: Date.now()
    });
    
    if (chrome.runtime.lastError) {
      throw new Error(chrome.runtime.lastError.message);
    }
    
    return response;
  } catch (error) {
    console.error(`[Messaging] Error sending message to tab ${tabId}:`, error);
    throw error;
  }
}

/**
 * Set up a message listener (for background service worker or content scripts)
 * 
 * @param {Function} handler - Message handler function (message, sender, sendResponse) => void|Promise
 * @returns {Function} Cleanup function to remove the listener
 * 
 * @example
 * const cleanup = onMessage((message, sender, sendResponse) => {
 *   if (message.type === MESSAGE_TYPES.PING) {
 *     sendResponse({ type: MESSAGE_TYPES.PONG });
 *   }
 * });
 */
export function onMessage(handler) {
  const messageListener = (message, sender, sendResponse) => {
    // Handle async handlers
    const result = handler(message, sender, sendResponse);
    
    if (result instanceof Promise) {
      result
        .then(response => sendResponse(response))
        .catch(error => {
          console.error('[Messaging] Handler error:', error);
          sendResponse({
            type: MESSAGE_TYPES.ERROR,
            payload: { error: error.message }
          });
        });
      return true; // Keep channel open for async response
    }
    
    return result !== undefined;
  };
  
  chrome.runtime.onMessage.addListener(messageListener);
  
  // Return cleanup function
  return () => {
    chrome.runtime.onMessage.removeListener(messageListener);
  };
}

/**
 * Create a typed message helper
 * 
 * @param {string} type - Message type
 * @param {*} payload - Message payload
 * @returns {ExtensionMessage} Typed message object
 */
export function createMessage(type, payload) {
  return {
    type,
    payload,
    timestamp: Date.now()
  };
}

/**
 * Create a success response message
 * 
 * @param {string} originalType - Original message type
 * @param {*} payload - Response payload
 * @returns {ExtensionMessage} Success response message
 */
export function createSuccessResponse(originalType, payload) {
  const responseType = originalType.replace(/(REQUEST|PROCESS|CALCULATE)$/, 'PROCESSED');
  return createMessage(responseType, payload);
}

/**
 * Create an error response message
 * 
 * @param {string} originalType - Original message type
 * @param {Error|string} error - Error object or message
 * @returns {ExtensionMessage} Error response message
 */
export function createErrorResponse(originalType, error) {
  const errorType = originalType.replace(/(PROCESS|CALCULATE)$/, '$1_ERROR');
  return createMessage(errorType, {
    error: error instanceof Error ? error.message : error
  });
}

