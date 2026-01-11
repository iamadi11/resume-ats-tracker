/**
 * Text Cleaning Utilities for Resume Parsing
 * 
 * Provides functions to clean and normalize extracted resume text:
 * - Remove headers, footers, page numbers
 * - Normalize whitespace and formatting
 * - Preserve bullet structure
 * - Remove noise patterns
 */

/**
 * Remove page numbers from text
 * 
 * @param {string} text - Raw text
 * @returns {string} Text with page numbers removed
 */
export function removePageNumbers(text) {
  if (!text || typeof text !== 'string') {
    return '';
  }

  // Common page number patterns
  // Match: "1", "Page 1", "- 1 -", "1/10", etc.
  const patterns = [
    /^Page\s+\d+\s*$/gim,                    // "Page 1"
    /^-\s*\d+\s*-$/gim,                       // "- 1 -"
    /^\d+\s*$/gm,                             // Standalone numbers (at line start/end)
    /^\d+\s*\/\s*\d+\s*$/gim,                // "1 / 10"
    /^\(\s*page\s+\d+\s*\)$/gim,             // "(page 1)"
    /\bPage\s+\d+\b/gi,                       // "Page 1" anywhere
    /\b\d+\s+of\s+\d+\b/gi                    // "1 of 10"
  ];

  let cleaned = text;

  patterns.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '');
  });

  return cleaned;
}

/**
 * Remove headers and footers from text
 * 
 * @param {string} text - Raw text
 * @param {string} [name] - Name from contact info (to remove from headers)
 * @returns {string} Text with headers and footers removed
 */
export function removeHeadersAndFooters(text, name = '') {
  if (!text || typeof text !== 'string') {
    return '';
  }

  const lines = text.split('\n');
  const cleanedLines = [];
  const nameWords = name.toLowerCase().split(/\s+/).filter(w => w.length > 2);

  // Patterns that indicate headers/footers
  const headerFooterPatterns = [
    /^(confidential|private|proprietary).*$/i,
    /^(resume|curriculum vitae|cv).*$/i,
    /^(page\s+\d+|p\.?\s*\d+).*$/i,
    /^\s*©\s*\d{4}.*$/i,
    /^.*all rights reserved.*$/i,
    /^.*copyright.*$/i,
    /^http(s)?:\/\/.*$/i,                     // URLs (often in footers)
    /^email:\s*.+$/i,                         // Email in header/footer
    /^phone:\s*.+$/i,                         // Phone in header/footer
    /^linkedin:\s*.+$/i                       // LinkedIn in header/footer
  ];

  // First and last few lines are often headers/footers
  const headerFooterLines = Math.min(3, Math.floor(lines.length * 0.1));

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const isHeader = i < headerFooterLines;
    const isFooter = i >= lines.length - headerFooterLines;
    
    // Skip empty lines in header/footer areas
    if ((isHeader || isFooter) && !line) {
      continue;
    }

    // Check if line matches header/footer patterns
    let isHeaderFooter = false;
    for (const pattern of headerFooterPatterns) {
      if (pattern.test(line)) {
        isHeaderFooter = true;
        break;
      }
    }

    // Check if line contains name words (likely header)
    if (isHeader && nameWords.length > 0) {
      const lineLower = line.toLowerCase();
      const nameMatchCount = nameWords.filter(word => lineLower.includes(word)).length;
      if (nameMatchCount >= 2) {
        isHeaderFooter = true;
      }
    }

    // Check if line is repeated (common in headers/footers)
    if ((isHeader || isFooter) && line.length > 0) {
      const occurrences = lines.filter(l => l.trim() === line).length;
      if (occurrences > 1 && line.length < 100) {
        isHeaderFooter = true;
      }
    }

    if (!isHeaderFooter) {
      cleanedLines.push(lines[i]); // Keep original formatting
    }
  }

  return cleanedLines.join('\n');
}

/**
 * Normalize bullet points
 * Preserves bullet structure while normalizing format
 * 
 * @param {string} text - Raw text
 * @returns {string} Text with normalized bullets
 */
export function normalizeBullets(text) {
  if (!text || typeof text !== 'string') {
    return '';
  }

  // Common bullet point markers
  const bulletMarkers = [
    /^[\u2022\u2023\u25E6\u2043\u2219\*\-•]\s+/,  // Unicode bullets, *, -, •
    /^\d+[\.\)]\s+/,                              // Numbered: "1. ", "1) "
    /^[a-z][\.\)]\s+/i,                           // Lettered: "a. ", "a) "
    /^[•▪▫]\s+/,                                  // More Unicode bullets
    /^→\s+/,                                      // Arrow bullets
    /^-\s+/,                                      // Dash bullets
    /^•\s+/                                       // Bullet character
  ];

  const lines = text.split('\n');
  const normalizedLines = [];

  for (const line of lines) {
    let normalized = line;

    // Replace various bullet markers with standard bullet
    for (const marker of bulletMarkers) {
      if (marker.test(line)) {
        normalized = line.replace(marker, '• ');
        break;
      }
    }

    normalizedLines.push(normalized);
  }

  return normalizedLines.join('\n');
}

/**
 * Normalize whitespace while preserving structure
 * 
 * @param {string} text - Raw text
 * @returns {string} Text with normalized whitespace
 */
export function normalizeWhitespace(text) {
  if (!text || typeof text !== 'string') {
    return '';
  }

  return text
    .replace(/\r\n/g, '\n')                      // Normalize line endings
    .replace(/\r/g, '\n')                        // Handle Mac line endings
    .replace(/\t+/g, ' ')                        // Tabs to spaces
    .replace(/[ \t]+/g, ' ')                     // Multiple spaces/tabs to single space
    .replace(/\n{3,}/g, '\n\n')                  // Multiple newlines to double
    .replace(/[ \t]+\n/g, '\n')                  // Trailing spaces before newline
    .replace(/\n[ \t]+/g, '\n')                  // Leading spaces after newline
    .trim();
}

/**
 * Remove noise patterns (contact info duplicates, etc.)
 * 
 * @param {string} text - Raw text
 * @returns {string} Text with noise removed
 */
export function removeNoise(text) {
  if (!text || typeof text !== 'string') {
    return '';
  }

  const noisePatterns = [
    /^(confidential|private|proprietary).*$/gim,
    /^.*(confidential|private|proprietary).*$/gim,
    /^.*all rights reserved.*$/gim,
    /^.*copyright\s+©\s*\d{4}.*$/gim,
    /^Page\s+\d+.*$/gim,
    /^.*Page\s+\d+.*$/gim,
    /^\s*-\s*\d+\s*-\s*$/gm,                    // Page number markers
    /^.*generated by.*$/gim,                     // Software watermarks
    /^.*created with.*$/gim
  ];

  let cleaned = text;

  noisePatterns.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '');
  });

  return cleaned;
}

/**
 * Clean and normalize resume text
 * Applies all cleaning functions in proper order
 * 
 * @param {string} text - Raw extracted text
 * @param {Object} [options] - Cleaning options
 * @param {string} [options.name] - Name to help identify headers
 * @param {boolean} [options.removePageNumbers=true] - Remove page numbers
 * @param {boolean} [options.removeHeadersFooters=true] - Remove headers/footers
 * @param {boolean} [options.normalizeBullets=true] - Normalize bullet points
 * @returns {string} Cleaned text
 */
export function cleanResumeText(text, options = {}) {
  if (!text || typeof text !== 'string') {
    return '';
  }

  const {
    name = '',
    removePageNumbers: removePages = true,
    removeHeadersFooters: removeHeaders = true,
    normalizeBullets: normalizeBulletsOption = true
  } = options;

  let cleaned = text;

  // Step 1: Normalize whitespace first (helps with pattern matching)
  cleaned = normalizeWhitespace(cleaned);

  // Step 2: Remove noise patterns
  cleaned = removeNoise(cleaned);

  // Step 3: Remove page numbers
  if (removePages) {
    cleaned = removePageNumbers(cleaned);
  }

  // Step 4: Remove headers and footers
  if (removeHeaders) {
    cleaned = removeHeadersAndFooters(cleaned, name);
  }

  // Step 5: Normalize bullets (should be last to preserve structure)
  if (normalizeBulletsOption) {
    cleaned = normalizeBullets(cleaned);
  }

  // Step 6: Final whitespace normalization
  cleaned = normalizeWhitespace(cleaned);

  return cleaned;
}

/**
 * Extract sections from text based on common section headers
 * 
 * @param {string} text - Resume text
 * @returns {Object} Object mapping section names to their content
 */
export function extractSections(text) {
  if (!text || typeof text !== 'string') {
    return {};
  }

  // Common section header patterns (case-insensitive, flexible spacing)
  const sectionPatterns = [
    { name: 'summary', patterns: [/^summary\s*$/i, /^professional summary\s*$/i, /^profile\s*$/i, /^objective\s*$/i] },
    { name: 'experience', patterns: [/^experience\s*$/i, /^work experience\s*$/i, /^employment\s*$/i, /^work history\s*$/i, /^professional experience\s*$/i] },
    { name: 'education', patterns: [/^education\s*$/i, /^academic background\s*$/i, /^qualifications\s*$/i] },
    { name: 'skills', patterns: [/^skills\s*$/i, /^technical skills\s*$/i, /^core competencies\s*$/i, /^competencies\s*$/i] },
    { name: 'projects', patterns: [/^projects\s*$/i, /^personal projects\s*$/i, /^project experience\s*$/i] },
    { name: 'certifications', patterns: [/^certifications\s*$/i, /^certificates\s*$/i, /^licenses\s*$/i] },
    { name: 'awards', patterns: [/^awards\s*$/i, /^honors\s*$/i, /^achievements\s*$/i] }
  ];

  const lines = text.split('\n');
  const sections = {};
  let currentSection = null;
  let currentContent = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    let isSectionHeader = false;
    let sectionName = null;

    // Check if line matches any section pattern
    for (const section of sectionPatterns) {
      for (const pattern of section.patterns) {
        if (pattern.test(line) && line.length < 50) { // Section headers are typically short
          isSectionHeader = true;
          sectionName = section.name;
          break;
        }
      }
      if (isSectionHeader) break;
    }

    if (isSectionHeader) {
      // Save previous section
      if (currentSection && currentContent.length > 0) {
        sections[currentSection] = currentContent.join('\n').trim();
      }

      // Start new section
      currentSection = sectionName;
      currentContent = [];
    } else if (currentSection && line) {
      // Add content to current section
      currentContent.push(lines[i]); // Keep original line (preserve formatting)
    } else if (!currentSection && line) {
      // Content before any section (likely contact info or summary)
      if (!sections['_preamble']) {
        sections['_preamble'] = [];
      }
      sections['_preamble'].push(line);
    }
  }

  // Save last section
  if (currentSection && currentContent.length > 0) {
    sections[currentSection] = currentContent.join('\n').trim();
  }

  // Join preamble if exists
  if (sections['_preamble']) {
    sections['_preamble'] = sections['_preamble'].join('\n').trim();
  }

  return sections;
}

