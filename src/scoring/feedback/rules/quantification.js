/**
 * Quantification Detection
 * 
 * Identifies bullet points and statements that lack quantifiable metrics.
 */

/**
 * Detect unquantified bullet points
 * 
 * @param {string} text - Resume text
 * @returns {Object} Quantification analysis
 */
export function detectUnquantifiedBullets(text) {
  if (!text || typeof text !== 'string') {
    return {
      unquantified: [],
      quantified: [],
      suggestions: []
    };
  }

  // Extract bullet points
  const bulletPattern = /^[•\-\*]\s+([^\n]+)/gm;
  const bullets = [];
  let match;

  while ((match = bulletPattern.exec(text)) !== null) {
    bullets.push({
      text: match[1].trim(),
      fullText: match[0].trim()
    });
  }

  // Check each bullet for quantification
  const quantified = [];
  const unquantified = [];

  bullets.forEach((bullet, index) => {
    const hasNumber = /\d/.test(bullet.text);
    const hasPercentage = /%\s*/.test(bullet.text);
    const hasCurrency = /\$/.test(bullet.text);
    const hasMetric = /(?:increased|decreased|improved|reduced|grew|saved|cut|boosted|enhanced|optimized|accelerated|streamlined|by|to|from|of)\s+\d+/i.test(bullet.text);
    const hasScale = /\d+\s*(?:users|customers|clients|projects|features|applications|systems|team members|employees|lines|transactions|requests|queries)/i.test(bullet.text);

    if (hasNumber || hasPercentage || hasCurrency || hasMetric || hasScale) {
      quantified.push({
        ...bullet,
        index,
        metricType: hasPercentage ? 'percentage' : 
                    hasCurrency ? 'currency' : 
                    hasScale ? 'scale' : 
                    hasMetric ? 'metric' : 'number'
      });
    } else {
      // Check if it's an action-oriented bullet (likely should have metrics)
      const isActionBullet = /^(?:built|created|developed|designed|implemented|managed|led|improved|increased|reduced|optimized|delivered|achieved|accomplished)/i.test(bullet.text);
      
      unquantified.push({
        ...bullet,
        index,
        isActionBullet,
        suggestion: isActionBullet ? generateQuantificationSuggestion(bullet.text) : null
      });
    }
  });

  return {
    quantified,
    unquantified,
    quantifiedCount: quantified.length,
    unquantifiedCount: unquantified.length,
    quantificationRate: bullets.length > 0 ? quantified.length / bullets.length : 0
  };
}

/**
 * Generate suggestion for adding quantification
 * 
 * @param {string} bulletText - Bullet point text
 * @returns {string} Suggestion
 */
function generateQuantificationSuggestion(bulletText) {
  // Extract action verb and object
  const actionMatch = bulletText.match(/^(\w+)\s+(.+)/i);
  
  if (!actionMatch) {
    return 'Add a specific number, percentage, or metric to quantify the impact.';
  }

  const [, verb, rest] = actionMatch;
  const verbLower = verb.toLowerCase();

  // Generate context-specific suggestions
  if (/system|application|platform|service|feature|component/i.test(rest)) {
    return `Add metrics like: user count, performance improvement (%), response time reduction, or scale (e.g., "serving X users" or "improved performance by X%")`;
  }

  if (/team|group|project|initiative/i.test(rest)) {
    return `Add scale metrics: team size, project budget, number of projects, or timeline (e.g., "team of X" or "X projects")`;
  }

  if (/process|workflow|pipeline|system/i.test(rest)) {
    return `Add efficiency metrics: time reduction (%), cost savings ($), throughput increase, or error reduction (e.g., "reduced time by X%" or "saved $X")`;
  }

  if (/revenue|sales|growth|profit/i.test(rest)) {
    return `Add financial metrics: revenue increase ($ or %), sales growth (%), profit margin, or budget managed (e.g., "$X revenue" or "X% growth")`;
  }

  // Generic suggestion
  return `Add a quantifiable metric: percentage improvement, dollar amount, count, or scale (e.g., "by X%", "$X", "X users", or "X times")`;
}

