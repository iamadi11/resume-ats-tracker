/**
 * File Processor
 * 
 * Unified interface for processing resume files in different formats.
 * Routes to appropriate parser based on file type.
 * 
 * Supported formats:
 * - PDF (using PDF.js)
 * - DOCX (using mammoth.js)
 * - Plain text
 */

import { parsePDF, parsePDFWithLayout } from './pdf-parser.js';
import { parseDOCX } from './docx-parser.js';
import { parseText } from './text-parser.js';
import { cleanResumeText } from './text-cleaner.js';
import { normalizeResumeSections } from './section-normalizer.js';

/**
 * Detect file format from file object
 * 
 * @param {File} file - File object
 * @returns {string} File format ("pdf", "docx", "text", "unknown")
 */
export function detectFileFormat(file) {
  if (!file || !(file instanceof File)) {
    return 'unknown';
  }

  const mimeType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();

  // Check MIME type first
  if (mimeType === 'application/pdf') {
    return 'pdf';
  }

  if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimeType === 'application/msword') {
    return 'docx';
  }

  if (mimeType.startsWith('text/')) {
    return 'text';
  }

  // Fallback to file extension
  if (fileName.endsWith('.pdf')) {
    return 'pdf';
  }

  if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
    return 'docx';
  }

  if (fileName.endsWith('.txt') || fileName.endsWith('.text')) {
    return 'text';
  }

  return 'unknown';
}

/**
 * Process resume file and return normalized resume object
 * 
 * @param {File|string} file - File object or text string
 * @param {Object} [options] - Processing options
 * @param {string} [options.format] - Force format (overrides detection)
 * @param {boolean} [options.preserveLayout=false] - For PDF, use layout-aware parsing
 * @returns {Promise<import('../shared/schemas.js').ParseResult>} Parsing result
 */
export async function processResumeFile(file, options = {}) {
  try {
    const { format, preserveLayout = false } = options;

    // Detect format if not provided
    let fileFormat = format;
    if (!fileFormat) {
      if (typeof file === 'string') {
        fileFormat = 'text';
      } else {
        fileFormat = detectFileFormat(file);
      }
    }

    if (fileFormat === 'unknown') {
      return {
        success: false,
        error: 'Unknown file format. Supported formats: PDF, DOCX, TXT.',
        warnings: []
      };
    }

    // Parse file based on format
    let parseResult;

    switch (fileFormat) {
      case 'pdf':
        parseResult = preserveLayout 
          ? await parsePDFWithLayout(file)
          : await parsePDF(file);
        break;

      case 'docx':
        parseResult = await parseDOCX(file);
        break;

      case 'text':
        parseResult = await parseText(file);
        break;

      default:
        return {
          success: false,
          error: `Unsupported file format: ${fileFormat}`,
          warnings: []
        };
    }

    if (!parseResult.success) {
      return {
        success: false,
        error: parseResult.error || 'Failed to parse file',
        warnings: parseResult.metadata?.warnings || []
      };
    }

    // Clean extracted text
    const cleanedText = cleanResumeText(parseResult.text, {
      name: '' // Name will be extracted during normalization
    });

    if (!cleanedText || cleanedText.trim().length < 50) {
      return {
        success: false,
        error: 'Extracted text is too short. File may be empty or corrupted.',
        warnings: parseResult.metadata?.warnings || []
      };
    }

    // Normalize into structured format
    let resume;
    try {
      resume = normalizeResumeSections(cleanedText, fileFormat);
      
      // Merge metadata
      resume.metadata = {
        ...resume.metadata,
        ...parseResult.metadata,
        pageCount: parseResult.metadata?.pageCount
      };

    } catch (normalizationError) {
      console.error('[File Processor] Normalization error:', normalizationError);
      return {
        success: false,
        error: `Failed to normalize resume: ${normalizationError.message}`,
        warnings: parseResult.metadata?.warnings || []
      };
    }

    // Collect warnings
    const warnings = [
      ...(parseResult.metadata?.warnings || []),
      ...(resume.metadata.warnings || [])
    ];

    return {
      success: true,
      resume,
      warnings: warnings.length > 0 ? warnings : undefined
    };

  } catch (error) {
    console.error('[File Processor] Error:', error);
    return {
      success: false,
      error: error.message || 'Unknown error occurred during file processing',
      warnings: []
    };
  }
}

/**
 * Process resume from text string
 * Convenience function for pasted text
 * 
 * @param {string} text - Resume text
 * @returns {Promise<import('../shared/schemas.js').ParseResult>} Parsing result
 */
export async function processResumeText(text) {
  return processResumeFile(text, { format: 'text' });
}

/**
 * Validate file before processing
 * 
 * @param {File} file - File object
 * @returns {Object} Validation result
 */
export function validateFile(file) {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  if (!(file instanceof File)) {
    return { valid: false, error: 'Invalid file object' };
  }

  const format = detectFileFormat(file);
  if (format === 'unknown') {
    return { 
      valid: false, 
      error: 'Unsupported file format. Please use PDF, DOCX, or TXT.' 
    };
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return { 
      valid: false, 
      error: `File too large (${Math.round(file.size / 1024 / 1024)}MB). Maximum size is 10MB.` 
    };
  }

  if (file.size === 0) {
    return { valid: false, error: 'File is empty' };
  }

  return { valid: true, format };
}

