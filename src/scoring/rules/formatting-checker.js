/**
 * Formatting Compliance Rules
 * 
 * Checks resume formatting for ATS compatibility.
 * Detects and penalizes ATS-unsafe formatting.
 */

/**
 * Check formatting compliance
 * 
 * @param {string} text - Resume text
 * @param {Object} resume - Parsed resume object (optional)
 * @returns {Object} Formatting compliance result
 */
export function checkFormatting(text, resume = null) {
  if (!text) {
    return {
      score: 0,
      issues: [],
      warnings: [],
      details: {}
    };
  }

  const issues = [];
  const warnings = [];
  let score = 100;

  // Check 1: Special characters that may break ATS parsing
  const specialChars = /[^\w\s\-.,;:!?()\[\]{}'"]/g;
  const specialCharMatches = text.match(specialChars);
  if (specialCharMatches) {
    const uniqueSpecialChars = [...new Set(specialCharMatches)];
    if (uniqueSpecialChars.length > 5) {
      issues.push({
        type: 'special_characters',
        severity: 'high',
        message: `Too many special characters detected: ${uniqueSpecialChars.slice(0, 5).join(', ')}`,
        penalty: 10
      });
      score -= 10;
    } else if (uniqueSpecialChars.length > 0) {
      warnings.push({
        type: 'special_characters',
        message: `Some special characters detected: ${uniqueSpecialChars.join(', ')}`
      });
    }
  }

  // Check 2: Tables (may not parse correctly)
  const tableIndicators = /\|\s*\w+\s*\|/g;
  const tableMatches = text.match(tableIndicators);
  if (tableMatches && tableMatches.length > 3) {
    issues.push({
      type: 'tables',
      severity: 'medium',
      message: 'Table formatting detected (may not parse correctly in ATS)',
      penalty: 5
    });
    score -= 5;
  }

  // Check 3: Headers/footers (should be minimal)
  const headerFooterPatterns = [
    /page\s+\d+/gi,
    /^\d+\s*$/gm,
    /confidential/gi,
    /proprietary/gi
  ];

  let headerFooterCount = 0;
  headerFooterPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      headerFooterCount += matches.length;
    }
  });

  if (headerFooterCount > 5) {
    issues.push({
      type: 'headers_footers',
      severity: 'low',
      message: 'Excessive headers/footers detected',
      penalty: 3
    });
    score -= 3;
  }

  // Check 4: Font issues (if we can detect them - limited in plain text)
  // This would be better with PDF/DOCX parsing, but we can check for
  // common issues like excessive capitalization
  const allCapsWords = text.match(/\b[A-Z]{4,}\b/g);
  if (allCapsWords && allCapsWords.length > 10) {
    warnings.push({
      type: 'all_caps',
      message: 'Many all-caps words detected (may indicate formatting issues)'
    });
  }

  // Check 5: Section structure (should have clear sections)
  const sectionHeaders = text.match(/^(experience|education|skills|summary|objective|projects|certifications|awards):?$/gim);
  if (!sectionHeaders || sectionHeaders.length < 2) {
    warnings.push({
      type: 'section_structure',
      message: 'Limited section headers detected (may affect ATS parsing)'
    });
  }

  // Check 6: Contact information format
  const emailPattern = /[\w.-]+@[\w.-]+\.\w+/g;
  const phonePattern = /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/g;
  const hasEmail = emailPattern.test(text);
  const hasPhone = phonePattern.test(text);

  if (!hasEmail && !hasPhone) {
    issues.push({
      type: 'contact_info',
      severity: 'high',
      message: 'No email or phone number detected',
      penalty: 15
    });
    score -= 15;
  } else if (!hasEmail) {
    warnings.push({
      type: 'contact_info',
      message: 'No email address detected'
    });
  }

  // Check 7: Bullet points (should use standard format)
  const bulletPatterns = [
    /^[•\-\*]\s+/gm,  // Standard bullets
    /^\d+[\.\)]\s+/gm  // Numbered lists
  ];

  let bulletCount = 0;
  bulletPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      bulletCount += matches.length;
    }
  });

  // Too many bullets might indicate poor structure
  if (bulletCount > 100) {
    warnings.push({
      type: 'bullet_points',
      message: 'Very high number of bullet points (may indicate poor structure)'
    });
  }

  // Check 8: Line length (very long lines may indicate formatting issues)
  const lines = text.split('\n');
  const longLines = lines.filter(line => line.length > 150);
  if (longLines.length > lines.length * 0.3) {
    warnings.push({
      type: 'line_length',
      message: 'Many long lines detected (may indicate formatting issues)'
    });
  }

  // Check 9: Whitespace issues
  const multipleSpaces = text.match(/  +/g);
  if (multipleSpaces && multipleSpaces.length > 20) {
    warnings.push({
      type: 'whitespace',
      message: 'Excessive whitespace detected'
    });
  }

  // Check 10: ATS-friendly file format (if resume object provided)
  if (resume && resume.metadata) {
    const format = resume.metadata.format;
    if (format === 'pdf' || format === 'docx' || format === 'text') {
      // These are generally ATS-friendly
    } else {
      issues.push({
        type: 'file_format',
        severity: 'high',
        message: `File format ${format} may not be ATS-compatible`,
        penalty: 20
      });
      score -= 20;
    }
  }

  // Ensure score doesn't go below 0
  score = Math.max(0, score);

  // Normalize to 0-1 scale
  const normalizedScore = score / 100;

  return {
    score: normalizedScore,
    issues,
    warnings,
    details: {
      totalIssues: issues.length,
      totalWarnings: warnings.length,
      rawScore: score
    }
  };
}

