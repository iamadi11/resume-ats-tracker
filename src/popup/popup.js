/**
 * Popup Entry Point
 * 
 * This file will initialize the React UI for the popup.
 * Currently a placeholder - React setup to be implemented.
 */

import { sendMessage } from '../shared/messaging.js';
import { MESSAGE_TYPES } from '../shared/constants.js';

// Test connection to background service worker
async function testConnection() {
  try {
    const response = await sendMessage({
      type: MESSAGE_TYPES.PING,
      payload: { source: 'popup' }
    });
    console.log('[Popup] Service worker responded:', response);
  } catch (error) {
    console.error('[Popup] Error connecting to service worker:', error);
  }
}

// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
  console.log('[Popup] Popup loaded');
  testConnection();
  
  // React app initialization will be added here
});

