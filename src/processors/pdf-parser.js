/**
 * PDF Parser
 * 
 * Parses PDF resumes using PDF.js library.
 * 
 * Requirements:
 * - pdfjs-dist library must be loaded
 * - Works client-side (no server needed)
 * 
 * Limitations:
 * - Complex layouts may not parse correctly
 * - Text in images not extracted
 * - Tables may lose structure
 * - Multi-column layouts may merge incorrectly
 */

/**
 * Parse PDF file and extract text
 * 
 * @param {File|ArrayBuffer|Uint8Array} file - PDF file
 * @returns {Promise<Object>} Parsed result with text and metadata
 */
export async function parsePDF(file) {
  try {
    // Dynamic import of PDF.js (loads when needed)
    // In production, PDF.js should be bundled or loaded via CDN
    let pdfjsLib;
    
    try {
      // Check if we're in a service worker context (no window object)
      const isServiceWorker = typeof window === 'undefined' && typeof self !== 'undefined';
      
      // Note: PDF.js processing moved to popup context (has window object)
      // Service worker context is no longer used for PDF parsing
      // This code path should not be reached, but kept for safety
      if (isServiceWorker) {
        throw new Error('PDF parsing is not supported in service worker context. Please process PDFs in the popup context.');
      } else {
        // Browser context (popup, content script, etc.)
        // Try to use global pdfjsLib if available (loaded via script tag)
        if (typeof window !== 'undefined' && window.pdfjsLib) {
          pdfjsLib = window.pdfjsLib;
          // Ensure workerSrc is set even for global pdfjsLib
          if (!pdfjsLib.GlobalWorkerOptions) {
            pdfjsLib.GlobalWorkerOptions = {};
          }
          // Set worker source using chrome.runtime.getURL() for Chrome extensions
          if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
            pdfjsLib.GlobalWorkerOptions.workerSrc = chrome.runtime.getURL('assets/pdf.worker.min.mjs');
          } else {
            // Fallback: use relative path if not in extension context
            pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('assets/pdf.worker.min.mjs', import.meta.url).href;
          }
        } else {
          // Try dynamic import
          const pdfjsModule = await import('pdfjs-dist');
          pdfjsLib = pdfjsModule.default || pdfjsModule;
          
          // Configure worker IMMEDIATELY after import (before any other operations)
          if (typeof window !== 'undefined' && pdfjsLib) {
            // Initialize GlobalWorkerOptions immediately
            if (!pdfjsLib.GlobalWorkerOptions) {
              pdfjsLib.GlobalWorkerOptions = {};
            }
            // Set worker source using chrome.runtime.getURL() for Chrome extensions
            if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
              pdfjsLib.GlobalWorkerOptions.workerSrc = chrome.runtime.getURL('assets/pdf.worker.min.mjs');
            } else {
              // Fallback: use relative path if not in extension context
              pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('assets/pdf.worker.min.mjs', import.meta.url).href;
            }
          }
        }
      }
    } catch (error) {
      console.error('[PDF Parser] PDF.js import error:', error);
      throw new Error(`PDF.js library not loaded: ${error.message}. Please ensure pdfjs-dist is installed.`);
    }

    // Convert file to ArrayBuffer if needed
    let arrayBuffer;
    if (file instanceof File) {
      arrayBuffer = await file.arrayBuffer();
    } else if (file instanceof ArrayBuffer) {
      arrayBuffer = file;
    } else if (file instanceof Uint8Array) {
      arrayBuffer = file.buffer;
    } else {
      throw new Error('Invalid file format. Expected File, ArrayBuffer, or Uint8Array.');
    }

    // Final safety check: Ensure workerSrc is set before loading document
    if (!pdfjsLib.GlobalWorkerOptions) {
      pdfjsLib.GlobalWorkerOptions = {};
    }
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      // Set worker source using chrome.runtime.getURL() for Chrome extensions
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = chrome.runtime.getURL('assets/pdf.worker.min.mjs');
      } else {
        // Fallback: use relative path if not in extension context
        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('assets/pdf.worker.min.mjs', import.meta.url).href;
      }
    }
    
    // Load PDF document
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    const numPages = pdf.numPages;
    const pageTexts = [];
    const warnings = [];

    // Extract text from each page
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();

        // Combine text items
        const pageText = textContent.items
          .map(item => {
            // Handle text items with transforms (positioning)
            // Simple approach: join items with spaces, let cleaning handle it
            return item.str;
          })
          .join(' ');

        pageTexts.push(pageText);
      } catch (error) {
        warnings.push(`Failed to extract text from page ${pageNum}: ${error.message}`);
        pageTexts.push(''); // Add empty string to maintain page order
      }
    }

    // Combine all pages
    const rawText = pageTexts.join('\n\n');

    return {
      success: true,
      text: rawText,
      metadata: {
        pageCount: numPages,
        warnings: warnings.length > 0 ? warnings : undefined
      }
    };

  } catch (error) {
    console.error('[PDF Parser] Error:', error);
    return {
      success: false,
      text: '',
      error: error.message,
      metadata: {}
    };
  }
}

/**
 * Parse PDF with improved text extraction (preserves layout hints)
 * 
 * @param {File|ArrayBuffer|Uint8Array} file - PDF file
 * @returns {Promise<Object>} Parsed result with text
 */
export async function parsePDFWithLayout(file) {
  try {
    let pdfjsLib;
    
    try {
      if (typeof window !== 'undefined' && window.pdfjsLib) {
        pdfjsLib = window.pdfjsLib;
        // Ensure workerSrc is set even for global pdfjsLib
        if (!pdfjsLib.GlobalWorkerOptions) {
          pdfjsLib.GlobalWorkerOptions = {};
        }
        // Set worker source using chrome.runtime.getURL() for Chrome extensions
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
          pdfjsLib.GlobalWorkerOptions.workerSrc = chrome.runtime.getURL('assets/pdf.worker.min.mjs');
        } else {
          // Fallback: use relative path if not in extension context
          pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('assets/pdf.worker.min.mjs', import.meta.url).href;
        }
      } else {
        pdfjsLib = await import('pdfjs-dist');
        if (typeof window !== 'undefined' && pdfjsLib) {
          // Ensure GlobalWorkerOptions exists
          if (!pdfjsLib.GlobalWorkerOptions) {
            pdfjsLib.GlobalWorkerOptions = {};
          }
          // Set worker source using chrome.runtime.getURL() for Chrome extensions
          if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
            pdfjsLib.GlobalWorkerOptions.workerSrc = chrome.runtime.getURL('assets/pdf.worker.min.mjs');
          } else {
            // Fallback: use relative path if not in extension context
            pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('assets/pdf.worker.min.mjs', import.meta.url).href;
          }
        }
      }
    } catch (error) {
      throw new Error('PDF.js library not loaded.');
    }

    let arrayBuffer;
    if (file instanceof File) {
      arrayBuffer = await file.arrayBuffer();
    } else if (file instanceof ArrayBuffer) {
      arrayBuffer = file;
    } else if (file instanceof Uint8Array) {
      arrayBuffer = file.buffer;
    } else {
      throw new Error('Invalid file format.');
    }

    // Final safety check: Ensure workerSrc is set before loading document
    if (!pdfjsLib.GlobalWorkerOptions) {
      pdfjsLib.GlobalWorkerOptions = {};
    }
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      // Set worker source using chrome.runtime.getURL() for Chrome extensions
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = chrome.runtime.getURL('assets/pdf.worker.min.mjs');
      } else {
        // Fallback: use relative path if not in extension context
        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('assets/pdf.worker.min.mjs', import.meta.url).href;
      }
    }
    
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    const numPages = pdf.numPages;
    const pageTexts = [];

    // Extract text with layout preservation
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();

      // Group text items by vertical position (line-based)
      const itemsByLine = {};
      
      textContent.items.forEach(item => {
        const transform = item.transform;
        // Use y-coordinate (transform[5]) to group by line
        const lineKey = Math.round(transform[5] / 5) * 5; // Round to 5px groups
        
        if (!itemsByLine[lineKey]) {
          itemsByLine[lineKey] = [];
        }
        
        itemsByLine[lineKey].push({
          text: item.str,
          x: transform[4] // x-coordinate
        });
      });

      // Sort lines by y-coordinate (top to bottom)
      const sortedLines = Object.keys(itemsByLine)
        .map(key => parseInt(key))
        .sort((a, b) => b - a); // Descending (top to bottom)

      // Build text preserving line structure
      const pageLines = sortedLines.map(lineKey => {
        const items = itemsByLine[lineKey];
        // Sort items by x-coordinate (left to right)
        items.sort((a, b) => a.x - b.x);
        // Join items in line
        return items.map(item => item.text).join(' ').trim();
      });

      pageTexts.push(pageLines.join('\n'));
    }

    const rawText = pageTexts.join('\n\n');

    return {
      success: true,
      text: rawText,
      metadata: {
        pageCount: numPages
      }
    };

  } catch (error) {
    console.error('[PDF Parser] Error:', error);
    return {
      success: false,
      text: '',
      error: error.message,
      metadata: {}
    };
  }
}

