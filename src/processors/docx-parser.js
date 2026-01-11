/**
 * DOCX Parser
 * 
 * Parses DOCX (Word) resumes using mammoth.js library.
 * 
 * Requirements:
 * - mammoth library must be loaded
 * - Works client-side (no server needed)
 * 
 * Limitations:
 * - Complex formatting may be lost
 * - Tables converted to text (structure may be lost)
 * - Images not extracted
 * - Embedded objects not extracted
 */

/**
 * Parse DOCX file and extract text
 * 
 * @param {File|ArrayBuffer|Blob} file - DOCX file
 * @returns {Promise<Object>} Parsed result with text and metadata
 */
export async function parseDOCX(file) {
  try {
    // Dynamic import of mammoth (loads when needed)
    let mammoth;
    
    try {
      // Try to use global mammoth if available (loaded via script tag)
      if (typeof window !== 'undefined' && window.mammoth) {
        mammoth = window.mammoth;
      } else {
        // Try dynamic import (requires build system)
        mammoth = await import('mammoth');
      }
    } catch (error) {
      throw new Error('mammoth.js library not loaded. Please include mammoth or load via CDN.');
    }

    // Convert file to ArrayBuffer if needed
    let arrayBuffer;
    if (file instanceof File || file instanceof Blob) {
      arrayBuffer = await file.arrayBuffer();
    } else if (file instanceof ArrayBuffer) {
      arrayBuffer = file;
    } else {
      throw new Error('Invalid file format. Expected File, Blob, or ArrayBuffer.');
    }

    // Parse DOCX
    // mammoth.extractRawText() - extracts plain text only
    // mammoth.convertToHtml() - converts to HTML (preserves some formatting)
    // mammoth.convertToMarkdown() - converts to Markdown
    
    // For resume parsing, we want plain text with basic structure preservation
    const result = await mammoth.extractRawText({ arrayBuffer });

    // mammoth.extractRawText returns { value: string, messages: [] }
    const rawText = result.value;
    const messages = result.messages || [];

    // Convert messages to warnings
    const warnings = messages
      .filter(msg => msg.type === 'warning')
      .map(msg => msg.message);

    return {
      success: true,
      text: rawText,
      metadata: {
        warnings: warnings.length > 0 ? warnings : undefined
      }
    };

  } catch (error) {
    console.error('[DOCX Parser] Error:', error);
    return {
      success: false,
      text: '',
      error: error.message,
      metadata: {}
    };
  }
}

/**
 * Parse DOCX with HTML conversion (preserves more structure)
 * 
 * @param {File|ArrayBuffer|Blob} file - DOCX file
 * @returns {Promise<Object>} Parsed result with HTML and text
 */
export async function parseDOCXAsHTML(file) {
  try {
    let mammoth;
    
    try {
      if (typeof window !== 'undefined' && window.mammoth) {
        mammoth = window.mammoth;
      } else {
        mammoth = await import('mammoth');
      }
    } catch (error) {
      throw new Error('mammoth.js library not loaded.');
    }

    let arrayBuffer;
    if (file instanceof File || file instanceof Blob) {
      arrayBuffer = await file.arrayBuffer();
    } else if (file instanceof ArrayBuffer) {
      arrayBuffer = file;
    } else {
      throw new Error('Invalid file format.');
    }

    // Convert to HTML (preserves structure better)
    const result = await mammoth.convertToHtml({ arrayBuffer });

    const html = result.value;
    const messages = result.messages || [];
    const warnings = messages
      .filter(msg => msg.type === 'warning')
      .map(msg => msg.message);

    // Convert HTML to plain text (basic conversion)
    // In a real implementation, you might want to use DOMParser
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const text = tempDiv.textContent || tempDiv.innerText || '';

    return {
      success: true,
      text: text,
      html: html,
      metadata: {
        warnings: warnings.length > 0 ? warnings : undefined
      }
    };

  } catch (error) {
    console.error('[DOCX Parser] Error:', error);
    return {
      success: false,
      text: '',
      error: error.message,
      metadata: {}
    };
  }
}

