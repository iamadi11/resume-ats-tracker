/**
 * Plain Text Parser
 * 
 * Parses plain text resumes.
 * 
 * This is the simplest parser - just returns the text as-is
 * after basic cleaning.
 * 
 * Limitations:
 * - No structure detection (rely on section normalization)
 * - Formatting may be inconsistent
 * - Encoding issues possible
 */

/**
 * Parse plain text file
 * 
 * @param {File|string} file - Text file or string
 * @returns {Promise<Object>} Parsed result with text
 */
export async function parseText(file) {
  try {
    let text;

    if (typeof file === 'string') {
      // Already a string
      text = file;
    } else if (file instanceof File) {
      // Read file as text
      text = await file.text();
    } else if (file instanceof Blob) {
      // Read blob as text
      text = await file.text();
    } else {
      throw new Error('Invalid file format. Expected File, Blob, or string.');
    }

    // Basic validation - ensure we have text
    if (!text || typeof text !== 'string') {
      throw new Error('Failed to read text from file.');
    }

    // No additional processing needed - text cleaning will be done later
    return {
      success: true,
      text: text,
      metadata: {}
    };

  } catch (error) {
    console.error('[Text Parser] Error:', error);
    return {
      success: false,
      text: '',
      error: error.message,
      metadata: {}
    };
  }
}

/**
 * Parse text with encoding detection
 * 
 * @param {File} file - Text file
 * @returns {Promise<Object>} Parsed result with text
 */
export async function parseTextWithEncoding(file) {
  try {
    if (!(file instanceof File)) {
      return parseText(file);
    }

    // Try UTF-8 first (most common)
    let text = await file.text();

    // Check for encoding issues (common with Windows-1252, ISO-8859-1)
    // Simple heuristic: if text contains replacement characters, try different encoding
    if (text.includes('\uFFFD')) {
      // Text may have encoding issues
      // In a production app, you might want to use a library like text-encoding
      // For now, we'll just return what we have and let the user know
      return {
        success: true,
        text: text,
        metadata: {
          warnings: ['Text may have encoding issues. Please ensure file is UTF-8 encoded.']
        }
      };
    }

    return {
      success: true,
      text: text,
      metadata: {}
    };

  } catch (error) {
    console.error('[Text Parser] Error:', error);
    return {
      success: false,
      text: '',
      error: error.message,
      metadata: {}
    };
  }
}

