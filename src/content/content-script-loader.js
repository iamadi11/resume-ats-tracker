/**
 * Content Script Loader
 * 
 * This file loads the actual content script using dynamic imports
 * to avoid ES module import resolution issues in Chrome extensions.
 * 
 * This file should have NO imports - it's a plain script that loads modules dynamically.
 */

// Wait for chrome.runtime to be available
if (typeof chrome !== 'undefined' && chrome.runtime) {
  // Load the actual content script module
  import(chrome.runtime.getURL('content-script-module.js'))
    .then(module => {
      // Module loaded successfully
      console.log('[Content Script Loader] Content script module loaded');
    })
    .catch(error => {
      console.error('[Content Script Loader] Failed to load content script module:', error);
    });
} else {
  console.error('[Content Script Loader] chrome.runtime not available');
}

