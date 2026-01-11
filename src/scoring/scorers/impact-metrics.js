/**
 * Impact & Metrics Scorer (10% weight)
 * 
 * Scores resume based on quantifiable achievements and impact.
 * 
 * Looks for:
 * 1. Quantifiable achievements (numbers, percentages, metrics)
 * 2. Results-oriented language
 * 3. Impact statements
 * 4. Performance improvements
 * 5. Scale indicators (team size, budget, users, etc.)
 */

/**
 * Extract metrics and quantifiable achievements from text
 * 
 * @param {string} text - Resume text
 * @returns {Object} Extracted metrics and impact indicators
 */
export function extractMetrics(text) {
  if (!text || typeof text !== 'string') {
    return {
      metrics: [],
      impactIndicators: [],
      totalCount: 0
    };
  }

  const metrics = [];
  const impactIndicators = [];

  // Patterns for quantifiable achievements
  const metricPatterns = [
    // Percentage improvements
    {
      pattern: /(?:increased|improved|reduced|decreased|boosted|enhanced|optimized|accelerated|cut|lowered)\s+(?:by\s+)?(\d+(?:\.\d+)?)%/gi,
      type: 'percentage',
      examples: ['increased by 40%', 'improved 25%', 'reduced by 15%']
    },
    // Dollar amounts / budget
    {
      pattern: /\$[\d,]+(?:K|k|M|m|B|b)?/g,
      type: 'currency',
      examples: ['$500K', '$1.2M', '$50,000']
    },
    // Numbers with scale indicators
    {
      pattern: /(\d+(?:,\d+)?(?:K|k|M|m|B|b)?)\s+(?:users|customers|clients|team members|employees|transactions|requests|queries|lines of code|lines)/gi,
      type: 'scale',
      examples: ['1M users', '50K customers', '10 team members']
    },
    // Time improvements
    {
      pattern: /(?:reduced|decreased|improved|cut|shortened)\s+(?:time|duration|latency|response time)\s+(?:by\s+)?(\d+(?:\.\d+)?)%/gi,
      type: 'performance',
      examples: ['reduced latency by 50%', 'cut response time by 30%']
    },
    // Count improvements
    {
      pattern: /(?:increased|improved|reduced|decreased)\s+(?:from\s+)?[\d,]+(?:\s+to\s+)?[\d,]+/gi,
      type: 'count',
      examples: ['increased from 100 to 500', 'reduced from 50 to 20']
    }
  ];

  metricPatterns.forEach(({ pattern, type }) => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => {
        metrics.push({
          text: match.trim(),
          type,
          extracted: true
        });
      });
    }
  });

  // Look for impact indicator phrases
  const impactPhrases = [
    /led\s+(?:a\s+)?(?:team|project|initiative)/gi,
    /managed\s+(?:a\s+)?(?:team|project|budget)/gi,
    /achieved\s+(?:[\w\s]+)?(?:result|goal|milestone)/gi,
    /delivered\s+(?:[\w\s]+)?(?:solution|project|system)/gi,
    /built\s+(?:from\s+)?(?:scratch|ground up)/gi,
    /architected\s+/gi,
    /scaled\s+(?:to|from)/gi,
    /mentored\s+\d+/gi,
    /trained\s+\d+/gi
  ];

  impactPhrases.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => {
        impactIndicators.push(match.trim());
      });
    }
  });

  return {
    metrics,
    impactIndicators,
    totalCount: metrics.length + impactIndicators.length
  };
}

/**
 * Calculate impact & metrics score
 * 
 * @param {string} resumeText - Resume text
 * @returns {Object} Impact & metrics score
 */
export function calculateImpactMetricsScore(resumeText) {
  if (!resumeText || typeof resumeText !== 'string') {
    return {
      score: 0,
      metrics: [],
      impactIndicators: [],
      explanation: 'No resume text provided'
    };
  }

  const extraction = extractMetrics(resumeText);

  // Score based on quantity and quality of metrics
  let score = 0;

  // Base score from metric count
  // 0 metrics: 0 points
  // 1-2 metrics: 30 points
  // 3-5 metrics: 60 points
  // 6-10 metrics: 85 points
  // 11+ metrics: 100 points
  const metricCount = extraction.metrics.length;
  if (metricCount === 0) {
    score = 0;
  } else if (metricCount <= 2) {
    score = 30;
  } else if (metricCount <= 5) {
    score = 60;
  } else if (metricCount <= 10) {
    score = 85;
  } else {
    score = 100;
  }

  // Bonus for impact indicators
  const impactCount = extraction.impactIndicators.length;
  if (impactCount > 0) {
    // Bonus: up to 10 points for impact indicators
    const impactBonus = Math.min(10, impactCount * 2);
    score = Math.min(100, score + impactBonus);
  }

  // Penalty if no metrics and no impact indicators
  if (extraction.totalCount === 0) {
    score = 0;
  }

  // Build explanation
  const explanation = buildImpactExplanation(score, extraction);

  return {
    score: Math.round(score * 100) / 100,
    metrics: extraction.metrics,
    impactIndicators: extraction.impactIndicators,
    metricCount,
    impactCount,
    explanation
  };
}

/**
 * Build explanation for impact & metrics score
 * 
 * @param {number} score - Final score
 * @param {Object} extraction - Extracted metrics and indicators
 * @returns {string} Explanation text
 */
function buildImpactExplanation(score, extraction) {
  const parts = [];

  parts.push(`Impact & metrics: ${Math.round(score)}/100.`);

  if (extraction.metrics.length > 0) {
    parts.push(`Found ${extraction.metrics.length} quantifiable achievements.`);
    
    // Show examples
    const examples = extraction.metrics.slice(0, 3).map(m => m.text);
    parts.push(`Examples: ${examples.join(', ')}${extraction.metrics.length > 3 ? '...' : ''}.`);
  } else {
    parts.push('⚠️ No quantifiable achievements found.');
  }

  if (extraction.impactIndicators.length > 0) {
    parts.push(`Found ${extraction.impactIndicators.length} impact indicators (leadership, delivery, etc.).`);
  }

  if (extraction.totalCount === 0) {
    parts.push('💡 Tip: Add quantifiable achievements (e.g., "increased performance by 40%", "managed team of 10") to demonstrate impact.');
  }

  return parts.join(' ');
}

