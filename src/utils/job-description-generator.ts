/**
 * Job Description Generator
 * 
 * Generates comprehensive job descriptions based on:
 * - Job role
 * - Years of experience
 * - Tech stack
 */

export interface JobRole {
  id: string;
  title: string;
  description: string;
  commonRequirements: string[];
  typicalResponsibilities: string[];
}

export interface TechStack {
  id: string;
  name: string;
  category: 'language' | 'framework' | 'tool' | 'platform' | 'database';
}

export const SOFTWARE_ENGINEERING_ROLES: JobRole[] = [
  {
    id: 'frontend',
    title: 'Frontend Developer',
    description: 'Builds user-facing web applications and interfaces',
    commonRequirements: [
      'Strong understanding of HTML, CSS, and JavaScript',
      'Experience with modern frontend frameworks',
      'Knowledge of responsive design principles',
      'Understanding of browser compatibility',
      'Experience with version control systems'
    ],
    typicalResponsibilities: [
      'Develop responsive web applications',
      'Implement user interface designs',
      'Optimize application performance',
      'Collaborate with design and backend teams',
      'Write clean, maintainable code',
      'Test and debug applications'
    ]
  },
  {
    id: 'backend',
    title: 'Backend Developer',
    description: 'Develops server-side logic and APIs',
    commonRequirements: [
      'Strong programming skills in server-side languages',
      'Experience with databases and data modeling',
      'Knowledge of API design and RESTful services',
      'Understanding of system architecture',
      'Experience with cloud platforms'
    ],
    typicalResponsibilities: [
      'Design and develop APIs',
      'Implement business logic',
      'Optimize database queries',
      'Ensure system security and scalability',
      'Collaborate with frontend developers',
      'Monitor and maintain backend services'
    ]
  },
  {
    id: 'fullstack',
    title: 'Full Stack Developer',
    description: 'Works on both frontend and backend development',
    commonRequirements: [
      'Proficiency in both frontend and backend technologies',
      'Understanding of full software development lifecycle',
      'Experience with databases and APIs',
      'Knowledge of deployment and DevOps',
      'Strong problem-solving skills'
    ],
    typicalResponsibilities: [
      'Develop end-to-end features',
      'Design system architecture',
      'Implement both UI and backend logic',
      'Deploy and maintain applications',
      'Collaborate across teams',
      'Optimize application performance'
    ]
  },
  {
    id: 'devops',
    title: 'DevOps Engineer',
    description: 'Manages infrastructure and deployment pipelines',
    commonRequirements: [
      'Experience with CI/CD pipelines',
      'Knowledge of cloud platforms',
      'Understanding of containerization',
      'Scripting and automation skills',
      'Monitoring and logging experience'
    ],
    typicalResponsibilities: [
      'Design and maintain CI/CD pipelines',
      'Manage cloud infrastructure',
      'Automate deployment processes',
      'Monitor system performance',
      'Ensure system reliability',
      'Implement security best practices'
    ]
  },
  {
    id: 'mobile',
    title: 'Mobile Developer',
    description: 'Develops mobile applications for iOS and/or Android',
    commonRequirements: [
      'Experience with mobile development frameworks',
      'Understanding of mobile UI/UX principles',
      'Knowledge of app store deployment',
      'Experience with mobile testing',
      'Understanding of mobile performance optimization'
    ],
    typicalResponsibilities: [
      'Develop mobile applications',
      'Implement mobile UI/UX designs',
      'Optimize app performance',
      'Handle app store submissions',
      'Test on various devices',
      'Collaborate with design teams'
    ]
  },
  {
    id: 'data',
    title: 'Data Engineer',
    description: 'Builds and maintains data pipelines and infrastructure',
    commonRequirements: [
      'Experience with data processing frameworks',
      'Knowledge of databases and data warehouses',
      'Understanding of ETL processes',
      'Experience with big data technologies',
      'Strong SQL skills'
    ],
    typicalResponsibilities: [
      'Design and build data pipelines',
      'Process and transform large datasets',
      'Maintain data infrastructure',
      'Ensure data quality and reliability',
      'Optimize data processing performance',
      'Collaborate with data scientists'
    ]
  },
  {
    id: 'ml',
    title: 'ML Engineer',
    description: 'Develops and deploys machine learning models',
    commonRequirements: [
      'Strong background in machine learning',
      'Experience with ML frameworks',
      'Understanding of data science principles',
      'Knowledge of model deployment',
      'Programming skills in Python or similar'
    ],
    typicalResponsibilities: [
      'Develop and train ML models',
      'Preprocess and analyze data',
      'Deploy models to production',
      'Monitor model performance',
      'Optimize model accuracy',
      'Collaborate with data scientists'
    ]
  },
  {
    id: 'security',
    title: 'Security Engineer',
    description: 'Ensures application and system security',
    commonRequirements: [
      'Deep understanding of security principles',
      'Experience with security tools and frameworks',
      'Knowledge of common vulnerabilities',
      'Understanding of compliance requirements',
      'Experience with penetration testing'
    ],
    typicalResponsibilities: [
      'Conduct security assessments',
      'Implement security measures',
      'Monitor for security threats',
      'Respond to security incidents',
      'Develop security policies',
      'Educate teams on security best practices'
    ]
  }
];

export const TECH_STACK_OPTIONS: TechStack[] = [
  // Languages
  { id: 'javascript', name: 'JavaScript', category: 'language' },
  { id: 'typescript', name: 'TypeScript', category: 'language' },
  { id: 'python', name: 'Python', category: 'language' },
  { id: 'java', name: 'Java', category: 'language' },
  { id: 'csharp', name: 'C#', category: 'language' },
  { id: 'go', name: 'Go', category: 'language' },
  { id: 'rust', name: 'Rust', category: 'language' },
  { id: 'php', name: 'PHP', category: 'language' },
  { id: 'ruby', name: 'Ruby', category: 'language' },
  { id: 'swift', name: 'Swift', category: 'language' },
  { id: 'kotlin', name: 'Kotlin', category: 'language' },
  
  // Frontend Frameworks
  { id: 'react', name: 'React', category: 'framework' },
  { id: 'vue', name: 'Vue.js', category: 'framework' },
  { id: 'angular', name: 'Angular', category: 'framework' },
  { id: 'nextjs', name: 'Next.js', category: 'framework' },
  { id: 'nuxt', name: 'Nuxt.js', category: 'framework' },
  { id: 'svelte', name: 'Svelte', category: 'framework' },
  
  // Backend Frameworks
  { id: 'nodejs', name: 'Node.js', category: 'framework' },
  { id: 'express', name: 'Express.js', category: 'framework' },
  { id: 'nestjs', name: 'NestJS', category: 'framework' },
  { id: 'django', name: 'Django', category: 'framework' },
  { id: 'flask', name: 'Flask', category: 'framework' },
  { id: 'fastapi', name: 'FastAPI', category: 'framework' },
  { id: 'spring', name: 'Spring Boot', category: 'framework' },
  { id: 'dotnet', name: '.NET', category: 'framework' },
  { id: 'rails', name: 'Ruby on Rails', category: 'framework' },
  
  // Databases
  { id: 'postgresql', name: 'PostgreSQL', category: 'database' },
  { id: 'mysql', name: 'MySQL', category: 'database' },
  { id: 'mongodb', name: 'MongoDB', category: 'database' },
  { id: 'redis', name: 'Redis', category: 'database' },
  { id: 'elasticsearch', name: 'Elasticsearch', category: 'database' },
  { id: 'dynamodb', name: 'DynamoDB', category: 'database' },
  
  // Cloud Platforms
  { id: 'aws', name: 'AWS', category: 'platform' },
  { id: 'azure', name: 'Azure', category: 'platform' },
  { id: 'gcp', name: 'Google Cloud', category: 'platform' },
  
  // Tools
  { id: 'docker', name: 'Docker', category: 'tool' },
  { id: 'kubernetes', name: 'Kubernetes', category: 'tool' },
  { id: 'git', name: 'Git', category: 'tool' },
  { id: 'jenkins', name: 'Jenkins', category: 'tool' },
  { id: 'github-actions', name: 'GitHub Actions', category: 'tool' },
  { id: 'terraform', name: 'Terraform', category: 'tool' },
  { id: 'ansible', name: 'Ansible', category: 'tool' }
];

/**
 * Generate a comprehensive job description based on role, experience, and tech stack
 */
export function generateJobDescription(
  role: JobRole,
  yearsOfExperience: number,
  techStack: TechStack[]
): string {
  const experienceLevel = getExperienceLevel(yearsOfExperience);
  const techNames = techStack.map(t => t.name).join(', ');
  const techCategories = {
    languages: techStack.filter(t => t.category === 'language').map(t => t.name),
    frameworks: techStack.filter(t => t.category === 'framework').map(t => t.name),
    databases: techStack.filter(t => t.category === 'database').map(t => t.name),
    platforms: techStack.filter(t => t.category === 'platform').map(t => t.name),
    tools: techStack.filter(t => t.category === 'tool').map(t => t.name)
  };

  let description = `# ${role.title} Position\n\n`;
  
  description += `## Job Overview\n\n`;
  description += `We are seeking a ${experienceLevel} ${role.title.toLowerCase()} to join our team. `;
  description += `${role.description}. `;
  description += `The ideal candidate will have ${yearsOfExperience}+ years of experience in software development `;
  description += `and a strong background in modern technologies.\n\n`;

  description += `## Required Experience\n\n`;
  description += `- ${yearsOfExperience}+ years of professional software development experience\n`;
  description += `- Proven track record of delivering high-quality software solutions\n`;
  description += `- Experience working in agile development environments\n`;
  description += `- Strong problem-solving and analytical skills\n`;
  description += `- Excellent communication and collaboration abilities\n\n`;

  description += `## Technical Requirements\n\n`;
  
  if (techCategories.languages.length > 0) {
    description += `### Programming Languages\n`;
    description += `- Proficiency in ${techCategories.languages.join(', ')}\n\n`;
  }
  
  if (techCategories.frameworks.length > 0) {
    description += `### Frameworks & Libraries\n`;
    description += `- Experience with ${techCategories.frameworks.join(', ')}\n\n`;
  }
  
  if (techCategories.databases.length > 0) {
    description += `### Databases\n`;
    description += `- Knowledge of ${techCategories.databases.join(', ')}\n\n`;
  }
  
  if (techCategories.platforms.length > 0) {
    description += `### Cloud Platforms\n`;
    description += `- Experience with ${techCategories.platforms.join(', ')}\n\n`;
  }
  
  if (techCategories.tools.length > 0) {
    description += `### Tools & Technologies\n`;
    description += `- Familiarity with ${techCategories.tools.join(', ')}\n\n`;
  }

  description += `## Additional Requirements\n\n`;
  role.commonRequirements.forEach(req => {
    description += `- ${req}\n`;
  });
  description += `\n`;

  description += `## Key Responsibilities\n\n`;
  role.typicalResponsibilities.forEach((resp, index) => {
    description += `${index + 1}. ${resp}\n`;
  });
  description += `\n`;

  description += `## Preferred Qualifications\n\n`;
  description += `- Bachelor's degree in Computer Science, Engineering, or related field (or equivalent experience)\n`;
  description += `- Experience with code review and mentoring junior developers\n`;
  description += `- Understanding of software design patterns and best practices\n`;
  description += `- Knowledge of testing methodologies (unit, integration, e2e)\n`;
  description += `- Experience with performance optimization and scalability\n`;
  description += `- Strong attention to detail and commitment to code quality\n\n`;

  description += `## What We Offer\n\n`;
  description += `- Competitive salary and benefits package\n`;
  description += `- Opportunity to work with cutting-edge technologies\n`;
  description += `- Collaborative and innovative work environment\n`;
  description += `- Professional development and growth opportunities\n`;
  description += `- Flexible work arrangements\n\n`;

  description += `## About the Role\n\n`;
  description += `This position requires a ${experienceLevel} professional who can work independently `;
  description += `and as part of a team. You will be responsible for ${role.typicalResponsibilities[0].toLowerCase()} `;
  description += `and contribute to the overall success of our engineering team. `;
  description += `Strong technical skills in ${techNames} are essential for this role.\n\n`;

  description += `## Technical Skills Summary\n\n`;
  description += `The ideal candidate should have hands-on experience with:\n\n`;
  if (techCategories.languages.length > 0) {
    description += `**Languages:** ${techCategories.languages.join(', ')}\n\n`;
  }
  if (techCategories.frameworks.length > 0) {
    description += `**Frameworks:** ${techCategories.frameworks.join(', ')}\n\n`;
  }
  if (techCategories.databases.length > 0) {
    description += `**Databases:** ${techCategories.databases.join(', ')}\n\n`;
  }
  if (techCategories.platforms.length > 0) {
    description += `**Cloud Platforms:** ${techCategories.platforms.join(', ')}\n\n`;
  }
  if (techCategories.tools.length > 0) {
    description += `**DevOps Tools:** ${techCategories.tools.join(', ')}\n\n`;
  }

  description += `## Application Process\n\n`;
  description += `Please ensure your resume highlights your experience with the technologies mentioned above, `;
  description += `your ${yearsOfExperience}+ years of experience, and relevant projects that demonstrate your `;
  description += `expertise in ${role.title.toLowerCase()}.\n`;

  return description;
}

/**
 * Get experience level description
 */
function getExperienceLevel(years: number): string {
  if (years < 2) {
    return 'Junior';
  } else if (years < 5) {
    return 'Mid-level';
  } else if (years < 8) {
    return 'Senior';
  } else {
    return 'Lead/Senior';
  }
}

/**
 * Get default tech stack for a role
 */
export function getDefaultTechStackForRole(roleId: string): TechStack[] {
  const defaults: Record<string, string[]> = {
    frontend: ['javascript', 'typescript', 'react', 'nextjs', 'nodejs'],
    backend: ['python', 'nodejs', 'postgresql', 'aws', 'docker'],
    fullstack: ['javascript', 'typescript', 'react', 'nodejs', 'postgresql', 'aws'],
    devops: ['docker', 'kubernetes', 'aws', 'terraform', 'github-actions'],
    mobile: ['javascript', 'swift', 'kotlin', 'react'],
    data: ['python', 'postgresql', 'aws', 'docker', 'elasticsearch'],
    ml: ['python', 'postgresql', 'aws', 'docker'],
    security: ['python', 'aws', 'docker', 'kubernetes', 'terraform']
  };

  const defaultIds = defaults[roleId] || defaults.fullstack;
  return TECH_STACK_OPTIONS.filter(tech => defaultIds.includes(tech.id));
}

