/**
 * Formatting Violations Detection
 * 
 * Identifies specific formatting issues that affect ATS compatibility.
 */

/**
 * Detect formatting violations
 * 
 * @param {string} text - Resume text
 * @param {Object} resume - Parsed resume object (optional)
 * @returns {Object} Formatting violations analysis
 */
export function detectFormattingViolations(text, resume = null) {
  if (!text) {
    return {
      violations: [],
      warnings: [],
      suggestions: []
    };
  }

  const violations = [];
  const warnings = [];

  // Check 1: Special characters that break ATS
  const problematicChars = /[^\w\s\-.,;:!?()\[\]{}'"]/g;
  const charMatches = text.match(problematicChars);
  if (charMatches) {
    const uniqueChars = [...new Set(charMatches)].slice(0, 5);
    if (uniqueChars.length > 3) {
      violations.push({
        type: 'special_characters',
        severity: 'critical',
        message: `Problematic special characters detected: ${uniqueChars.join(', ')}`,
        suggestion: 'Remove or replace special characters with standard punctuation. Use standard fonts and avoid decorative characters.',
        count: uniqueChars.length
      });
    } else if (uniqueChars.length > 0) {
      warnings.push({
        type: 'special_characters',
        severity: 'warning',
        message: `Some special characters detected: ${uniqueChars.join(', ')}`,
        suggestion: 'Ensure these characters are ATS-compatible or replace with standard alternatives.'
      });
    }
  }

  // Check 2: Tables (pipe characters)
  const tablePattern = /\|\s*\w+\s*\|/g;
  const tableMatches = text.match(tablePattern);
  if (tableMatches && tableMatches.length > 3) {
    violations.push({
      type: 'tables',
      severity: 'critical',
      message: 'Table formatting detected (may not parse correctly in ATS)',
      suggestion: 'Convert tables to bullet points or simple text format. ATS systems often struggle with table structures.',
      count: tableMatches.length
    });
  }

  // Check 3: Headers/footers
  const headerFooterPatterns = [
    { pattern: /page\s+\d+/gi, name: 'page numbers' },
    { pattern: /^\d+\s*$/gm, name: 'standalone numbers' },
    { pattern: /confidential/gi, name: 'confidential markers' }
  ];

  let headerFooterCount = 0;
  headerFooterPatterns.forEach(({ pattern, name }) => {
    const matches = text.match(pattern);
    if (matches) {
      headerFooterCount += matches.length;
    }
  });

  if (headerFooterCount > 5) {
    violations.push({
      type: 'headers_footers',
      severity: 'warning',
      message: `Excessive headers/footers detected (${headerFooterCount} instances)`,
      suggestion: 'Remove page numbers, headers, and footers. They add no value and may confuse ATS systems.',
      count: headerFooterCount
    });
  }

  // Check 4: Missing contact information
  const emailPattern = /[\w.-]+@[\w.-]+\.\w+/g;
  const phonePattern = /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/g;
  const hasEmail = emailPattern.test(text);
  const hasPhone = phonePattern.test(text);

  if (!hasEmail && !hasPhone) {
    violations.push({
      type: 'contact_info',
      severity: 'critical',
      message: 'No email address or phone number detected',
      suggestion: 'Add a professional email address and phone number at the top of your resume. This is essential for ATS parsing and recruiter contact.',
      count: 0
    });
  } else if (!hasEmail) {
    warnings.push({
      type: 'contact_info',
      severity: 'warning',
      message: 'No email address detected',
      suggestion: 'Add a professional email address. Most ATS systems expect an email for contact.'
    });
  }

  // Check 5: Inconsistent bullet points
  const bulletTypes = {
    standard: (text.match(/^[•]\s+/gm) || []).length,
    dash: (text.match(/^[-]\s+/gm) || []).length,
    asterisk: (text.match(/^[\*]\s+/gm) || []).length,
    numbered: (text.match(/^\d+[\.\)]\s+/gm) || []).length
  };

  const totalBullets = Object.values(bulletTypes).reduce((sum, count) => sum + count, 0);
  const bulletTypesUsed = Object.values(bulletTypes).filter(count => count > 0).length;

  if (totalBullets > 0 && bulletTypesUsed > 2) {
    warnings.push({
      type: 'inconsistent_bullets',
      severity: 'warning',
      message: 'Multiple bullet point styles detected',
      suggestion: 'Use a consistent bullet point style throughout your resume. Standard bullets (•) are most ATS-friendly.'
    });
  }

  // Check 6: Very long lines (may indicate formatting issues)
  const lines = text.split('\n');
  const longLines = lines.filter(line => line.length > 150);
  if (longLines.length > lines.length * 0.3) {
    warnings.push({
      type: 'line_length',
      severity: 'improvement',
      message: `Many long lines detected (${longLines.length} lines over 150 characters)`,
      suggestion: 'Break long lines into shorter sentences or bullet points. This improves readability for both ATS systems and humans.'
    });
  }

  // Check 7: Excessive whitespace
  const multipleSpaces = text.match(/  +/g);
  if (multipleSpaces && multipleSpaces.length > 20) {
    warnings.push({
      type: 'whitespace',
      severity: 'improvement',
      message: 'Excessive whitespace detected',
      suggestion: 'Remove extra spaces. Use single spaces between words and consistent spacing throughout.'
    });
  }

  // Check 8: File format (if resume object provided)
  if (resume && resume.metadata) {
    const format = resume.metadata.format;
    const supportedFormats = ['pdf', 'docx', 'text'];
    if (!supportedFormats.includes(format)) {
      violations.push({
        type: 'file_format',
        severity: 'critical',
        message: `File format "${format}" may not be ATS-compatible`,
        suggestion: 'Convert your resume to PDF, DOCX, or plain text format. These are the most ATS-friendly formats.',
        count: 1
      });
    }
  }

  // Check 9: Section headers (should be clear)
  const sectionHeaders = text.match(/^(experience|education|skills|summary|objective|projects|certifications|awards):?$/gim);
  if (!sectionHeaders || sectionHeaders.length < 2) {
    warnings.push({
      type: 'section_structure',
      severity: 'warning',
      message: 'Limited section headers detected',
      suggestion: 'Use clear section headers (Experience, Education, Skills, etc.) to help ATS systems parse your resume correctly.'
    });
  }

  // Check 10: All caps text (may indicate formatting issues)
  const allCapsWords = text.match(/\b[A-Z]{4,}\b/g);
  if (allCapsWords && allCapsWords.length > 10) {
    warnings.push({
      type: 'all_caps',
      severity: 'improvement',
      message: 'Many all-caps words detected',
      suggestion: 'Avoid excessive capitalization. Use title case for headings and normal case for body text.'
    });
  }

  return {
    violations,
    warnings,
    totalViolations: violations.length,
    totalWarnings: warnings.length
  };
}

