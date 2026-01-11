/**
 * Skill Normalization
 * 
 * Normalizes skill names to canonical forms.
 * Handles variations, abbreviations, and version numbers.
 * 
 * Examples:
 * - "React.js" → "React"
 * - "JavaScript" → "JavaScript"
 * - "Node.js" → "Node.js" (common abbreviation kept)
 * - "Python 3" → "Python"
 */

/**
 * Skill normalization mappings
 * Maps variations to canonical forms
 */
export const SKILL_MAPPINGS = {
  // JavaScript frameworks/libraries
  'react.js': 'react',
  'reactjs': 'react',
  'react.jsx': 'react',
  'angular.js': 'angular',
  'angularjs': 'angular',
  'angular 2': 'angular',
  'angular 4': 'angular',
  'angular 5': 'angular',
  'angular 6': 'angular',
  'angular 7': 'angular',
  'angular 8': 'angular',
  'angular 9': 'angular',
  'angular 10': 'angular',
  'angular 11': 'angular',
  'angular 12': 'angular',
  'angular 13': 'angular',
  'angular 14': 'angular',
  'angular 15': 'angular',
  'angular 16': 'angular',
  'vue.js': 'vue',
  'vuejs': 'vue',
  'vue 2': 'vue',
  'vue 3': 'vue',
  'next.js': 'next.js',
  'nextjs': 'next.js',
  'nuxt.js': 'nuxt.js',
  'nuxtjs': 'nuxt.js',
  
  // Node.js
  'node.js': 'node.js',
  'nodejs': 'node.js',
  'node': 'node.js',
  
  // Programming languages
  'javascript': 'javascript',
  'js': 'javascript',
  'ecmascript': 'javascript',
  'typescript': 'typescript',
  'ts': 'typescript',
  'python': 'python',
  'python 2': 'python',
  'python 3': 'python',
  'python3': 'python',
  'py': 'python',
  'java': 'java',
  'c++': 'c++',
  'cpp': 'c++',
  'c#': 'c#',
  'csharp': 'c#',
  '.net': '.net',
  'dotnet': '.net',
  'php': 'php',
  'ruby': 'ruby',
  'go': 'go',
  'golang': 'go',
  'rust': 'rust',
  'swift': 'swift',
  'kotlin': 'kotlin',
  'scala': 'scala',
  'r': 'r',
  'perl': 'perl',
  'html': 'html',
  'html5': 'html',
  'css': 'css',
  'css3': 'css',
  'sass': 'sass',
  'scss': 'sass',
  'less': 'less',
  'sql': 'sql',
  'mysql': 'mysql',
  'postgresql': 'postgresql',
  'postgres': 'postgresql',
  'mongodb': 'mongodb',
  'mongo': 'mongodb',
  
  // Tools and technologies
  'git': 'git',
  'github': 'github',
  'gitlab': 'gitlab',
  'bitbucket': 'bitbucket',
  'docker': 'docker',
  'kubernetes': 'kubernetes',
  'k8s': 'kubernetes',
  'jenkins': 'jenkins',
  'ci/cd': 'ci/cd',
  'cicd': 'ci/cd',
  'aws': 'aws',
  'amazon web services': 'aws',
  'azure': 'azure',
  'microsoft azure': 'azure',
  'gcp': 'gcp',
  'google cloud platform': 'gcp',
  'terraform': 'terraform',
  'ansible': 'ansible',
  'chef': 'chef',
  'puppet': 'puppet',
  
  // Testing
  'jest': 'jest',
  'mocha': 'mocha',
  'jasmine': 'jasmine',
  'cypress': 'cypress',
  'selenium': 'selenium',
  'unit testing': 'unit testing',
  'integration testing': 'integration testing',
  'e2e testing': 'e2e testing',
  'end-to-end testing': 'e2e testing',
  
  // Other common skills
  'rest': 'rest api',
  'restful': 'rest api',
  'rest api': 'rest api',
  'graphql': 'graphql',
  'microservices': 'microservices',
  'microservice': 'microservices',
  'agile': 'agile',
  'scrum': 'scrum',
  'kanban': 'kanban',
  'devops': 'devops',
  'tdd': 'tdd',
  'test-driven development': 'tdd',
  'bdd': 'bdd',
  'behavior-driven development': 'bdd'
};

/**
 * Pattern-based normalization rules
 * Applied when exact match not found
 */
export const NORMALIZATION_PATTERNS = [
  // Remove version numbers
  {
    pattern: /^(.+?)\s+v?(\d+\.\d+|\d+)$/i,
    replacement: (match, skill) => skill.toLowerCase()
  },
  // Remove common suffixes
  {
    pattern: /^(.+?)(?:\.js|\.jsx|\.ts|\.tsx)$/i,
    replacement: (match, skill) => {
      const normalized = skill.toLowerCase();
      // Keep known abbreviations
      if (normalized === 'node' || normalized === 'next' || normalized === 'nuxt') {
        return normalized + '.js';
      }
      return normalized;
    }
  },
  // Normalize capitalization (make title case for multi-word)
  {
    pattern: /^[a-z]+(?:\s+[a-z]+)*$/i,
    replacement: (match) => {
      const words = match.toLowerCase().split(/\s+/);
      // Don't capitalize common lowercase prefixes
      const keepLowercase = ['de', 'da', 'di', 'la', 'le', 'van', 'von', 'der', 'den'];
      return words.map((word, index) => {
        if (index > 0 && keepLowercase.includes(word)) {
          return word;
        }
        return word.charAt(0).toUpperCase() + word.slice(1);
      }).join(' ');
    }
  }
];

/**
 * Normalize a skill name to canonical form
 * 
 * @param {string} skill - Skill name to normalize
 * @returns {string} Normalized skill name
 */
export function normalizeSkill(skill) {
  if (!skill || typeof skill !== 'string') {
    return '';
  }

  // Trim and lowercase for matching
  const trimmed = skill.trim();
  const lower = trimmed.toLowerCase();

  // Check exact mappings first
  if (SKILL_MAPPINGS[lower]) {
    return SKILL_MAPPINGS[lower];
  }

  // Try pattern-based normalization
  for (const rule of NORMALIZATION_PATTERNS) {
    if (rule.pattern.test(trimmed)) {
      const normalized = trimmed.replace(rule.pattern, rule.replacement);
      // Check if normalized form exists in mappings
      const normalizedLower = normalized.toLowerCase();
      if (SKILL_MAPPINGS[normalizedLower]) {
        return SKILL_MAPPINGS[normalizedLower];
      }
      return normalized;
    }
  }

  // Default: lowercase single word, title case multi-word
  const words = trimmed.split(/\s+/);
  if (words.length === 1) {
    return trimmed.toLowerCase();
  }
  
  // Multi-word: title case
  return words.map(word => {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join(' ');
}

/**
 * Normalize an array of skills
 * 
 * @param {string[]} skills - Array of skill names
 * @returns {string[]} Array of normalized skills
 */
export function normalizeSkills(skills) {
  if (!Array.isArray(skills)) {
    return [];
  }

  return skills
    .map(skill => normalizeSkill(skill))
    .filter(skill => skill.length > 0);
}

/**
 * Build skill mapping index for faster lookup
 * 
 * @returns {Map<string, string>} Mapping from variations to canonical forms
 */
export function buildSkillIndex() {
  const index = new Map();

  // Add direct mappings
  Object.entries(SKILL_MAPPINGS).forEach(([variation, canonical]) => {
    index.set(variation, canonical);
    // Also add canonical form to itself
    index.set(canonical, canonical);
  });

  // Add common variations
  Object.values(SKILL_MAPPINGS).forEach(canonical => {
    // Add plural forms
    if (!canonical.endsWith('s')) {
      index.set(canonical + 's', canonical);
    }
    // Add with spaces vs without
    const noSpaces = canonical.replace(/\s+/g, '');
    if (noSpaces !== canonical) {
      index.set(noSpaces, canonical);
    }
  });

  return index;
}

