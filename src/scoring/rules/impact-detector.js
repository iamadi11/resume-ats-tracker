/**
 * Impact & Metrics Detection
 * 
 * Detects quantifiable achievements and impact statements in resume.
 * ATS systems and recruiters value metrics and measurable results.
 */

/**
 * Detect impact statements and metrics
 * 
 * @param {string} text - Resume text
 * @returns {Object} Impact detection result
 */
export function detectImpact(text) {
  if (!text) {
    return {
      score: 0,
      metrics: [],
      impactStatements: [],
      details: {}
    };
  }

  const metrics = [];
  const impactStatements = [];

  // Pattern 1: Percentage improvements
  const percentagePattern = /(?:increased|decreased|improved|reduced|grew|gained|saved|cut|boosted|enhanced|optimized|accelerated|streamlined)\s+(?:by\s+)?(\d+(?:\.\d+)?)\s*%/gi;
  const percentageMatches = [...text.matchAll(percentagePattern)];
  percentageMatches.forEach(match => {
    metrics.push({
      type: 'percentage',
      value: parseFloat(match[1]),
      text: match[0],
      category: 'improvement'
    });
  });

  // Pattern 2: Dollar amounts (revenue, cost savings)
  const dollarPattern = /\$[\d,]+(?:k|K|m|M|b|B)?/g;
  const dollarMatches = text.match(dollarPattern);
  if (dollarMatches) {
    dollarMatches.forEach(match => {
      metrics.push({
        type: 'currency',
        value: match,
        text: match,
        category: 'financial'
      });
    });
  }

  // Pattern 3: Counts/numbers (users, transactions, etc.)
  const countPatterns = [
    /(?:served|managed|led|handled|processed|delivered|built|created|developed|designed)\s+(?:over\s+)?(\d+(?:,\d+)?(?:k|K|m|M)?)\s+(?:users|customers|clients|projects|features|applications|systems|team members|employees)/gi,
    /(?:reduced|decreased|increased|improved)\s+(?:by\s+)?(\d+(?:,\d+)?(?:k|K|m|M)?)\s+(?:hours|days|weeks|months|years|seconds|minutes)/gi
  ];

  countPatterns.forEach(pattern => {
    const matches = [...text.matchAll(pattern)];
    matches.forEach(match => {
      metrics.push({
        type: 'count',
        value: match[1],
        text: match[0],
        category: 'scale'
      });
    });
  });

  // Pattern 4: Time improvements
  const timePattern = /(?:reduced|decreased|cut|shortened|improved)\s+(?:time|duration|latency|response time|processing time|delivery time)\s+(?:by\s+)?(\d+(?:\.\d+)?)\s*%/gi;
  const timeMatches = [...text.matchAll(timePattern)];
  timeMatches.forEach(match => {
    metrics.push({
      type: 'time',
      value: parseFloat(match[1]),
      text: match[0],
      category: 'efficiency'
    });
  });

  // Pattern 5: Scale indicators (team size, project size)
  const scalePattern = /(?:team|group|project|system|application|platform)\s+(?:of\s+)?(\d+(?:,\d+)?(?:k|K|m|M)?)\s*(?:people|users|customers|clients|lines|components)/gi;
  const scaleMatches = [...text.matchAll(scalePattern)];
  scaleMatches.forEach(match => {
    metrics.push({
      type: 'scale',
      value: match[1],
      text: match[0],
      category: 'scale'
    });
  });

  // Pattern 6: Impact verbs with results
  const impactVerbs = [
    /(?:achieved|attained|accomplished|delivered|exceeded|surpassed)\s+[^.]{10,100}/gi,
    /(?:resulted in|led to|contributed to|enabled|facilitated)\s+[^.]{10,100}/gi
  ];

  impactVerbs.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => {
        impactStatements.push({
          text: match.trim(),
          hasMetric: /\d/.test(match)
        });
      });
    }
  });

  // Calculate score based on metrics found
  // Score factors:
  // - Number of metrics (more is better, up to a point)
  // - Diversity of metric types
  // - Presence of impact statements

  const metricCount = metrics.length;
  const uniqueTypes = new Set(metrics.map(m => m.type)).size;
  const impactCount = impactStatements.length;

  // Base score: number of metrics (capped at 10 for 50 points)
  const metricScore = Math.min(50, (metricCount / 10) * 50);

  // Diversity bonus: different types of metrics (up to 20 points)
  const diversityScore = Math.min(20, uniqueTypes * 5);

  // Impact statements bonus (up to 20 points)
  const impactScore = Math.min(20, (impactCount / 5) * 20);

  // Quality bonus: metrics with high values or percentages (up to 10 points)
  const qualityScore = metrics.filter(m => {
    if (m.type === 'percentage' && m.value >= 20) return true;
    if (m.type === 'currency' && /[kmKM]/.test(m.value)) return true;
    if (m.type === 'count' && /[kmKM]/.test(m.value)) return true;
    return false;
  }).length * 2;
  const qualityBonus = Math.min(10, qualityScore);

  const totalScore = metricScore + diversityScore + impactScore + qualityBonus;
  const normalizedScore = Math.min(1, totalScore / 100);

  return {
    score: normalizedScore,
    metrics,
    impactStatements,
    details: {
      metricCount,
      uniqueTypes,
      impactCount,
      metricScore,
      diversityScore,
      impactScore,
      qualityBonus,
      totalScore
    }
  };
}

