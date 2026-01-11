/**
 * Action Verbs Analysis
 * 
 * Detects weak action verbs and suggests stronger alternatives.
 */

/**
 * Strong action verbs (preferred)
 */
const STRONG_VERBS = new Set([
  'achieved', 'accelerated', 'accomplished', 'acquired', 'advanced', 'amplified',
  'architected', 'attained', 'automated', 'boosted', 'built', 'catalyzed',
  'championed', 'collaborated', 'conceived', 'constructed', 'created', 'delivered',
  'designed', 'developed', 'drove', 'engineered', 'established', 'executed',
  'expanded', 'generated', 'implemented', 'improved', 'increased', 'innovated',
  'launched', 'led', 'managed', 'optimized', 'orchestrated', 'pioneered',
  'produced', 'reduced', 'revolutionized', 'scaled', 'spearheaded', 'streamlined',
  'transformed', 'upgraded', 'utilized'
]);

/**
 * Weak action verbs (should be replaced)
 */
const WEAK_VERBS = new Set([
  'worked', 'did', 'made', 'helped', 'assisted', 'supported', 'participated',
  'involved', 'contributed', 'handled', 'responsible', 'duties', 'tasks',
  'helped with', 'worked on', 'was part of', 'involved in'
]);

/**
 * Medium-strength verbs (acceptable but could be stronger)
 */
const MEDIUM_VERBS = new Set([
  'maintained', 'updated', 'fixed', 'changed', 'modified', 'used', 'applied',
  'performed', 'completed', 'finished', 'started', 'began'
]);

/**
 * Detect weak action verbs in text
 * 
 * @param {string} text - Resume text
 * @returns {Object} Action verb analysis
 */
export function detectWeakActionVerbs(text) {
  if (!text || typeof text !== 'string') {
    return {
      weak: [],
      medium: [],
      suggestions: []
    };
  }

  // Extract bullet points and sentences
  const bullets = text.match(/^[•\-\*]\s+([^\n]+)/gm) || [];
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);

  const weak = [];
  const medium = [];
  const allText = [...bullets, ...sentences];

  allText.forEach((line, index) => {
    const words = line.toLowerCase().split(/\s+/);
    
    // Check for weak verbs (usually at start of bullet/sentence)
    for (let i = 0; i < Math.min(5, words.length); i++) {
      const word = words[i].replace(/[^\w]/g, '');
      
      if (WEAK_VERBS.has(word)) {
        weak.push({
          verb: word,
          context: line.trim(),
          position: index,
          suggestion: getStrongVerbSuggestion(word)
        });
        break; // Only flag once per line
      } else if (MEDIUM_VERBS.has(word) && i < 2) {
        medium.push({
          verb: word,
          context: line.trim(),
          position: index,
          suggestion: getStrongVerbSuggestion(word)
        });
        break;
      }
    }
  });

  return {
    weak,
    medium,
    totalWeak: weak.length,
    totalMedium: medium.length
  };
}

/**
 * Get suggestion for stronger verb
 * 
 * @param {string} weakVerb - Weak verb to replace
 * @returns {string[]} Array of suggested strong verbs
 */
function getStrongVerbSuggestion(weakVerb) {
  const suggestions = {
    'worked': ['developed', 'engineered', 'built', 'created', 'designed'],
    'did': ['executed', 'performed', 'accomplished', 'delivered', 'achieved'],
    'made': ['created', 'built', 'developed', 'produced', 'constructed'],
    'helped': ['collaborated', 'supported', 'facilitated', 'enabled', 'assisted'],
    'assisted': ['collaborated', 'supported', 'facilitated', 'enabled'],
    'supported': ['enabled', 'facilitated', 'contributed to', 'drove'],
    'participated': ['contributed to', 'played a key role in', 'was instrumental in'],
    'involved': ['contributed to', 'played a role in', 'participated in'],
    'contributed': ['drove', 'led', 'spearheaded', 'championed'],
    'handled': ['managed', 'orchestrated', 'oversaw', 'coordinated'],
    'responsible': ['managed', 'led', 'oversaw', 'orchestrated'],
    'duties': ['responsibilities', 'achievements', 'accomplishments'],
    'tasks': ['projects', 'initiatives', 'deliverables'],
    'maintained': ['optimized', 'enhanced', 'improved', 'upgraded'],
    'updated': ['enhanced', 'improved', 'upgraded', 'refined'],
    'fixed': ['resolved', 'solved', 'remediated', 'corrected'],
    'changed': ['transformed', 'improved', 'enhanced', 'optimized'],
    'modified': ['enhanced', 'improved', 'optimized', 'refined'],
    'used': ['utilized', 'leveraged', 'implemented', 'applied'],
    'applied': ['implemented', 'utilized', 'leveraged', 'deployed'],
    'performed': ['executed', 'delivered', 'accomplished', 'achieved'],
    'completed': ['delivered', 'accomplished', 'achieved', 'finalized'],
    'finished': ['completed', 'delivered', 'finalized', 'accomplished'],
    'started': ['initiated', 'launched', 'established', 'created'],
    'began': ['initiated', 'launched', 'established', 'created']
  };

  return suggestions[weakVerb.toLowerCase()] || ['improved', 'enhanced', 'optimized'];
}

