/**
 * Skill Categorization
 * 
 * Categorizes skills into:
 * - Hard skills (technical, measurable)
 * - Soft skills (interpersonal, behavioral)
 * - Tools (software, platforms, services)
 * - Role-specific terms (job titles, domains)
 */

/**
 * Programming languages
 */
const PROGRAMMING_LANGUAGES = new Set([
  'javascript', 'typescript', 'python', 'java', 'c++', 'cpp', 'c#', 'csharp',
  'php', 'ruby', 'go', 'golang', 'rust', 'swift', 'kotlin', 'scala', 'r',
  'perl', 'html', 'css', 'sass', 'scss', 'less', 'sql', 'bash', 'shell',
  'powershell', 'lua', 'dart', 'clojure', 'elixir', 'haskell', 'erlang'
]);

/**
 * Frameworks and libraries
 */
const FRAMEWORKS_LIBRARIES = new Set([
  'react', 'angular', 'vue', 'ember', 'backbone', 'jquery', 'express',
  'nestjs', 'django', 'flask', 'fastapi', 'spring', 'hibernate', 'rails',
  'laravel', 'symfony', 'codeigniter', 'asp.net', 'next.js', 'nuxt.js',
  'gatsby', 'remix', 'svelte', 'solid', 'preact', 'lit', 'stencil'
]);

/**
 * Databases
 */
const DATABASES = new Set([
  'mysql', 'postgresql', 'postgres', 'mongodb', 'mongo', 'redis', 'cassandra',
  'elasticsearch', 'dynamodb', 'oracle', 'sql server', 'sqlite', 'couchdb',
  'neo4j', 'influxdb', 'maria', 'cassandra', 'snowflake', 'redshift', 'bigquery'
]);

/**
 * Cloud platforms and services
 */
const CLOUD_SERVICES = new Set([
  'aws', 'azure', 'gcp', 'google cloud', 'heroku', 'vercel', 'netlify',
  'digitalocean', 'linode', 'vultr', 'cloudflare', 'akamai', 'fastly'
]);

/**
 * DevOps and infrastructure tools
 */
const DEVOPS_TOOLS = new Set([
  'docker', 'kubernetes', 'k8s', 'jenkins', 'gitlab ci', 'github actions',
  'circleci', 'travis ci', 'teamcity', 'bamboo', 'terraform', 'ansible',
  'chef', 'puppet', 'vagrant', 'packer', 'nomad', 'consul', 'vault'
]);

/**
 * Version control and collaboration
 */
const VERSION_CONTROL = new Set([
  'git', 'github', 'gitlab', 'bitbucket', 'svn', 'mercurial', 'perforce',
  'jira', 'confluence', 'slack', 'microsoft teams', 'trello', 'asana',
  'clickup', 'notion', 'linear', 'monday.com'
]);

/**
 * Testing tools and frameworks
 */
const TESTING_TOOLS = new Set([
  'jest', 'mocha', 'jasmine', 'karma', 'cypress', 'playwright', 'selenium',
  'webdriverio', 'puppeteer', 'testcafe', 'vitest', 'pytest', 'unittest',
  'junit', 'testng', 'rspec', 'phpunit', 'xunit'
]);

/**
 * Monitoring and logging
 */
const MONITORING_TOOLS = new Set([
  'datadog', 'new relic', 'splunk', 'elastic', 'kibana', 'grafana',
  'prometheus', 'sentry', 'rollbar', 'bugsnag', 'loggly', 'papertrail',
  'cloudwatch', 'stackdriver', 'azure monitor'
]);

/**
 * Soft skills
 */
const SOFT_SKILLS = new Set([
  'leadership', 'communication', 'teamwork', 'collaboration', 'problem solving',
  'critical thinking', 'creativity', 'adaptability', 'time management',
  'organization', 'multitasking', 'attention to detail', 'analytical thinking',
  'presentation', 'negotiation', 'mentoring', 'coaching', 'training',
  'project management', 'stakeholder management', 'conflict resolution',
  'emotional intelligence', 'empathy', 'patience', 'flexibility', 'initiative',
  'self-motivated', 'proactive', 'resourceful', 'persistence', 'resilience'
]);

/**
 * Role-specific terms (job titles, domains)
 */
const ROLE_TERMS = new Set([
  'software engineer', 'software developer', 'web developer', 'frontend developer',
  'backend developer', 'full stack developer', 'devops engineer', 'sre',
  'site reliability engineer', 'data engineer', 'data scientist', 'data analyst',
  'machine learning engineer', 'ml engineer', 'ai engineer', 'qa engineer',
  'quality assurance', 'test engineer', 'product manager', 'product owner',
  'scrum master', 'agile coach', 'tech lead', 'engineering manager',
  'software architect', 'solution architect', 'system architect', 'security engineer',
  'security analyst', 'cloud architect', 'platform engineer', 'mobile developer',
  'ios developer', 'android developer', 'game developer', 'embedded systems',
  'firmware engineer', 'hardware engineer'
]);

/**
 * Categorize a skill
 * 
 * @param {string} skill - Normalized skill name
 * @returns {string} Category ('hard', 'soft', 'tool', 'role', 'other')
 */
export function categorizeSkill(skill) {
  if (!skill || typeof skill !== 'string') {
    return 'other';
  }

  const lower = skill.toLowerCase();

  // Check exact matches
  if (PROGRAMMING_LANGUAGES.has(lower) || 
      FRAMEWORKS_LIBRARIES.has(lower) ||
      DATABASES.has(lower)) {
    return 'hard';
  }

  if (CLOUD_SERVICES.has(lower) ||
      DEVOPS_TOOLS.has(lower) ||
      VERSION_CONTROL.has(lower) ||
      TESTING_TOOLS.has(lower) ||
      MONITORING_TOOLS.has(lower)) {
    return 'tool';
  }

  if (SOFT_SKILLS.has(lower)) {
    return 'soft';
  }

  if (ROLE_TERMS.has(lower)) {
    return 'role';
  }

  // Pattern matching for partial matches
  // Frameworks/libraries (often contain keywords)
  if (/framework|library|api|sdk/i.test(skill)) {
    return 'hard';
  }

  // Tools (often end with common suffixes)
  if (/tool|platform|service|system|software/i.test(skill)) {
    return 'tool';
  }

  // Cloud-related
  if (/cloud|aws|azure|gcp|infrastructure|devops/i.test(skill)) {
    return 'tool';
  }

  // Database-related
  if (/database|db|sql|nosql/i.test(skill)) {
    return 'hard';
  }

  // Testing-related
  if (/test|testing|qa|quality assurance/i.test(skill)) {
    return 'tool';
  }

  // Soft skill patterns
  if (/communication|leadership|team|collaboration|management|presentation/i.test(skill)) {
    return 'soft';
  }

  // Default: try to infer from context
  // Single word, technical-sounding → hard
  if (!/\s/.test(skill) && /^[a-z]+$/i.test(skill) && skill.length > 3) {
    return 'hard';
  }

  return 'other';
}

/**
 * Categorize multiple skills
 * 
 * @param {string[]} skills - Array of normalized skills
 * @returns {Object} Categorized skills
 */
export function categorizeSkills(skills) {
  if (!Array.isArray(skills)) {
    return {
      hard: [],
      soft: [],
      tools: [],
      roles: [],
      other: []
    };
  }

  const categorized = {
    hard: [],
    soft: [],
    tools: [],
    roles: [],
    other: []
  };

  skills.forEach(skill => {
    const category = categorizeSkill(skill);
    switch (category) {
      case 'hard':
        categorized.hard.push(skill);
        break;
      case 'soft':
        categorized.soft.push(skill);
        break;
      case 'tool':
        categorized.tools.push(skill);
        break;
      case 'role':
        categorized.roles.push(skill);
        break;
      default:
        categorized.other.push(skill);
    }
  });

  // Remove duplicates within each category
  Object.keys(categorized).forEach(key => {
    categorized[key] = [...new Set(categorized[key])];
  });

  return categorized;
}

/**
 * Get all skill dictionaries for reference
 * 
 * @returns {Object} All skill dictionaries
 */
export function getSkillDictionaries() {
  return {
    programmingLanguages: Array.from(PROGRAMMING_LANGUAGES),
    frameworksLibraries: Array.from(FRAMEWORKS_LIBRARIES),
    databases: Array.from(DATABASES),
    cloudServices: Array.from(CLOUD_SERVICES),
    devopsTools: Array.from(DEVOPS_TOOLS),
    versionControl: Array.from(VERSION_CONTROL),
    testingTools: Array.from(TESTING_TOOLS),
    monitoringTools: Array.from(MONITORING_TOOLS),
    softSkills: Array.from(SOFT_SKILLS),
    roleTerms: Array.from(ROLE_TERMS)
  };
}

