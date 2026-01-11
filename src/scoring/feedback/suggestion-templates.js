/**
 * Suggestion Templates
 * 
 * Provides templates for generating actionable feedback suggestions.
 */

/**
 * Severity levels
 */
export const SEVERITY = {
  CRITICAL: 'critical',
  WARNING: 'warning',
  IMPROVEMENT: 'improvement'
};

/**
 * Generate suggestion object
 * 
 * @param {string} category - Category of suggestion
 * @param {string} severity - Severity level
 * @param {string} title - Suggestion title
 * @param {string} message - Detailed message
 * @param {string} suggestion - Actionable suggestion
 * @param {Object} [metadata] - Additional metadata
 * @returns {Object} Suggestion object
 */
export function createSuggestion(category, severity, title, message, suggestion, metadata = {}) {
  return {
    category,
    severity,
    title,
    message,
    suggestion,
    ...metadata
  };
}

/**
 * Missing keywords suggestions
 */
export function createMissingKeywordsSuggestions(missingKeywords) {
  const suggestions = [];

  if (missingKeywords.critical && missingKeywords.critical.length > 0) {
    const topCritical = missingKeywords.critical.slice(0, 5).map(k => k.term).join(', ');
    suggestions.push(createSuggestion(
      'missing_keywords',
      SEVERITY.CRITICAL,
      'Critical Keywords Missing',
      `These high-frequency keywords from the job description are missing: ${topCritical}`,
      `Add these keywords naturally throughout your resume, especially in the Skills and Experience sections.`,
      { keywords: missingKeywords.critical.map(k => k.term) }
    ));
  }

  if (missingKeywords.important && missingKeywords.important.length > 0) {
    const topImportant = missingKeywords.important.slice(0, 5).map(k => k.term).join(', ');
    suggestions.push(createSuggestion(
      'missing_keywords',
      SEVERITY.WARNING,
      'Important Keywords Missing',
      `These keywords appear multiple times in the job description: ${topImportant}`,
      `Consider adding these keywords where relevant in your resume to improve ATS matching.`,
      { keywords: missingKeywords.important.map(k => k.term) }
    ));
  }

  return suggestions;
}

/**
 * Weak action verbs suggestions
 */
export function createActionVerbSuggestions(actionVerbs) {
  const suggestions = [];

  if (actionVerbs.weak && actionVerbs.weak.length > 0) {
    const examples = actionVerbs.weak.slice(0, 3);
    const examplesText = examples.map(e => `"${e.verb}"`).join(', ');
    
    suggestions.push(createSuggestion(
      'action_verbs',
      SEVERITY.WARNING,
      'Weak Action Verbs Detected',
      `Found ${actionVerbs.weak.length} instances of weak action verbs (e.g., ${examplesText})`,
      `Replace weak verbs with stronger alternatives. For example: "worked" → "developed", "helped" → "collaborated", "did" → "executed". Use action verbs that demonstrate impact.`,
      { 
        weakVerbs: actionVerbs.weak.map(v => v.verb),
        examples: examples
      }
    ));
  }

  if (actionVerbs.medium && actionVerbs.medium.length > 0) {
    suggestions.push(createSuggestion(
      'action_verbs',
      SEVERITY.IMPROVEMENT,
      'Action Verbs Could Be Stronger',
      `Found ${actionVerbs.medium.length} instances of medium-strength verbs that could be improved`,
      `Consider replacing with more impactful verbs. For example: "maintained" → "optimized", "updated" → "enhanced", "used" → "leveraged".`,
      { mediumVerbs: actionVerbs.medium.map(v => v.verb) }
    ));
  }

  return suggestions;
}

/**
 * Unquantified bullets suggestions
 */
export function createQuantificationSuggestions(quantification) {
  const suggestions = [];

  if (quantification.unquantified && quantification.unquantified.length > 0) {
    const actionBullets = quantification.unquantified.filter(b => b.isActionBullet);
    const rate = (quantification.quantificationRate * 100).toFixed(0);

    if (actionBullets.length > 0) {
      suggestions.push(createSuggestion(
        'quantification',
        SEVERITY.WARNING,
        'Unquantified Achievement Bullets',
        `Found ${actionBullets.length} action-oriented bullet points without quantifiable metrics. Only ${rate}% of your bullets include metrics.`,
        `Add specific numbers, percentages, or metrics to your achievements. For example: "Increased performance by 40%", "Managed team of 5 engineers", "Reduced costs by $50K". Quantifiable results are highly valued by ATS systems and recruiters.`,
        { 
          unquantifiedCount: actionBullets.length,
          quantificationRate: quantification.quantificationRate
        }
      ));
    } else {
      suggestions.push(createSuggestion(
        'quantification',
        SEVERITY.IMPROVEMENT,
        'Add More Quantifiable Metrics',
        `Only ${rate}% of your bullet points include quantifiable metrics.`,
        `Consider adding numbers, percentages, dollar amounts, or scale metrics to more of your achievements to demonstrate concrete impact.`,
        { quantificationRate: quantification.quantificationRate }
      ));
    }
  }

  return suggestions;
}

/**
 * Overused words suggestions
 */
export function createOverusedWordsSuggestions(overusedWords) {
  const suggestions = [];

  if (overusedWords.overused && overusedWords.overused.length > 0) {
    const critical = overusedWords.overused.filter(w => w.severity === 'high');
    const others = overusedWords.overused.filter(w => w.severity !== 'high');

    if (critical.length > 0) {
      const examples = critical.slice(0, 3).map(w => `"${w.word}" (${w.count}x)`).join(', ');
      suggestions.push(createSuggestion(
        'word_usage',
        SEVERITY.WARNING,
        'Overused Words Detected',
        `These words appear too frequently: ${examples}`,
        `Replace overused words with alternatives to improve readability and avoid repetition. Consider using synonyms or restructuring sentences.`,
        { overusedWords: critical }
      ));
    }

    if (others.length > 0 && critical.length === 0) {
      const examples = others.slice(0, 3).map(w => `"${w.word}" (${w.count}x)`).join(', ');
      suggestions.push(createSuggestion(
        'word_usage',
        SEVERITY.IMPROVEMENT,
        'Consider Varying Word Choice',
        `These words appear frequently: ${examples}`,
        `Vary your word choice to improve readability. Consider using synonyms or alternative phrasing.`,
        { overusedWords: others }
      ));
    }
  }

  return suggestions;
}

/**
 * Formatting violations suggestions
 */
export function createFormattingSuggestions(formattingViolations) {
  const suggestions = [];

  // Critical violations
  const critical = formattingViolations.violations.filter(v => v.severity === 'critical');
  critical.forEach(violation => {
    suggestions.push(createSuggestion(
      'formatting',
      SEVERITY.CRITICAL,
      violation.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      violation.message,
      violation.suggestion,
      { violationType: violation.type }
    ));
  });

  // Warnings
  const warnings = formattingViolations.warnings.filter(w => w.severity === 'warning');
  warnings.forEach(warning => {
    suggestions.push(createSuggestion(
      'formatting',
      SEVERITY.WARNING,
      warning.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      warning.message,
      warning.suggestion,
      { violationType: warning.type }
    ));
  });

  // Improvements
  const improvements = formattingViolations.warnings.filter(w => w.severity === 'improvement');
  if (improvements.length > 0) {
    suggestions.push(createSuggestion(
      'formatting',
      SEVERITY.IMPROVEMENT,
      'Formatting Improvements',
      `Found ${improvements.length} formatting areas that could be improved`,
      improvements.map(i => i.suggestion).join(' '),
      { improvements: improvements }
    ));
  }

  return suggestions;
}

