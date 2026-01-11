/**
 * Formatting Compliance Scorer (20% weight)
 * 
 * Scores resume based on ATS-friendly formatting.
 * 
 * ATS-friendly formatting checks:
 * 1. Standard fonts (Arial, Calibri, Times New Roman, etc.)
 * 2. Simple layout (no complex tables, columns)
 * 3. No headers/footers
 * 4. No images/graphics
 * 5. Standard file format (PDF, DOCX, TXT)
 * 6. Proper section headers
 * 7. Consistent formatting
 * 
 * Penalties:
 * - Complex formatting: -5 to -15 points
 * - Uncommon fonts: -3 to -10 points
 * - Headers/footers: -2 to -5 points
 * - Images/graphics: -5 to -10 points
 */

/**
 * Check formatting compliance from parsed resume data
 * 
 * Note: In a real implementation, this would check the actual file.
 * For now, we check text-based indicators and metadata.
 * 
 * @param {Object} resume - Parsed resume object
 * @param {string} rawText - Raw resume text
 * @returns {Object} Formatting compliance score
 */
export function calculateFormattingComplianceScore(resume, rawText) {
  if (!resume || !rawText) {
    return {
      score: 0,
      checks: {},
      issues: [],
      explanation: 'No resume data provided'
    };
  }

  const checks = {
    standardFont: true,      // Assume standard (can't check without file)
    simpleLayout: true,      // Check for complex patterns
    noHeadersFooters: true,  // Check for header/footer patterns
    noImages: true,          // Assume no images (can't detect from text)
    standardFormat: true,    // Check metadata format
    properSections: false,   // Check section structure
    consistentFormatting: true
  };

  const issues = [];
  let penalty = 0;

  // Check for complex layout indicators (tables, columns)
  const complexPatterns = [
    /\|\s*.+\s*\|/,              // Table markers
    /\s{10,}/,                   // Excessive whitespace (column indicators)
    /\t{2,}/,                    // Multiple tabs (table indicators)
    /\+-{3,}\+/                  // Table borders
  ];

  const hasComplexLayout = complexPatterns.some(pattern => pattern.test(rawText));
  if (hasComplexLayout) {
    checks.simpleLayout = false;
    issues.push({
      type: 'complex_layout',
      severity: 'medium',
      message: 'Complex layout detected (tables or columns may not parse correctly)',
      penalty: 10
    });
    penalty += 10;
  }

  // Check for header/footer patterns
  const headerFooterPatterns = [
    /^Page\s+\d+/m,              // Page numbers
    /^-\s*\d+\s*-$/m,            // Page number markers
    /©\s*\d{4}/,                 // Copyright
    /All\s+rights\s+reserved/i   // Copyright footer
  ];

  const hasHeadersFooters = headerFooterPatterns.some(pattern => pattern.test(rawText));
  if (hasHeadersFooters) {
    checks.noHeadersFooters = false;
    issues.push({
      type: 'headers_footers',
      severity: 'low',
      message: 'Headers or footers detected (may interfere with parsing)',
      penalty: 3
    });
    penalty += 3;
  }

  // Check for proper section structure
  const sectionHeaders = [
    /^Experience\s*$/mi,
    /^Work Experience\s*$/mi,
    /^Education\s*$/mi,
    /^Skills\s*$/mi,
    /^Summary\s*$/mi,
    /^Objective\s*$/mi
  ];

  const hasSections = sectionHeaders.some(pattern => pattern.test(rawText));
  checks.properSections = hasSections;

  if (!hasSections) {
    issues.push({
      type: 'missing_sections',
      severity: 'medium',
      message: 'Missing or unclear section headers (Experience, Education, Skills)',
      penalty: 8
    });
    penalty += 8;
  } else {
    // Bonus for good structure
    penalty = Math.max(0, penalty - 3);
  }

  // Check for inconsistent formatting
  // Look for mixed bullet styles, inconsistent spacing
  const bulletStyles = [
    rawText.match(/•/g)?.length || 0,
    rawText.match(/\*/g)?.length || 0,
    rawText.match(/-/g)?.length || 0,
    rawText.match(/\d+\./g)?.length || 0
  ].filter(count => count > 0);

  if (bulletStyles.length > 2) {
    checks.consistentFormatting = false;
    issues.push({
      type: 'inconsistent_formatting',
      severity: 'low',
      message: 'Mixed bullet styles detected (should use consistent formatting)',
      penalty: 3
    });
    penalty += 3;
  }

  // Check file format from metadata
  const validFormats = ['pdf', 'docx', 'text'];
  const format = resume.metadata?.format || 'unknown';
  checks.standardFormat = validFormats.includes(format.toLowerCase());

  if (!checks.standardFormat) {
    issues.push({
      type: 'format',
      severity: 'low',
      message: `File format "${format}" may not be fully ATS-compatible`,
      penalty: 2
    });
    penalty += 2;
  }

  // Calculate score (start at 100, subtract penalties)
  const baseScore = 100;
  const finalScore = Math.max(0, baseScore - penalty);

  // Build explanation
  const explanation = buildFormattingExplanation(finalScore, checks, issues);

  return {
    score: Math.round(finalScore * 100) / 100,
    checks,
    issues,
    penalty,
    explanation
  };
}

/**
 * Build explanation for formatting compliance score
 * 
 * @param {number} score - Final score
 * @param {Object} checks - Check results
 * @param {Array} issues - Detected issues
 * @returns {string} Explanation text
 */
function buildFormattingExplanation(score, checks, issues) {
  const parts = [];

  parts.push(`Formatting compliance: ${Math.round(score)}/100.`);

  if (checks.properSections) {
    parts.push('✓ Clear section headers found.');
  } else {
    parts.push('⚠️ Missing or unclear section headers.');
  }

  if (checks.simpleLayout) {
    parts.push('✓ Simple layout (no complex tables/columns detected).');
  } else {
    parts.push('⚠️ Complex layout detected - may cause parsing issues.');
  }

  if (checks.noHeadersFooters) {
    parts.push('✓ No headers/footers detected.');
  } else {
    parts.push('⚠️ Headers or footers detected.');
  }

  if (checks.consistentFormatting) {
    parts.push('✓ Consistent formatting.');
  } else {
    parts.push('⚠️ Inconsistent formatting (mixed bullet styles).');
  }

  if (checks.standardFormat) {
    parts.push(`✓ Standard file format (${checks.standardFormat ? 'ATS-compatible' : ''}).`);
  }

  if (issues.length === 0) {
    parts.push('✓ Formatting is ATS-friendly.');
  } else {
    parts.push(`Issues found: ${issues.length}.`);
  }

  return parts.join(' ');
}

