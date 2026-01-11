/**
 * Section Normalization Utilities
 * 
 * Normalizes extracted resume sections into structured format:
 * - Contact information extraction
 * - Experience parsing
 * - Education parsing
 * - Skills parsing
 * - Section categorization
 */

import { cleanResumeText, extractSections } from './text-cleaner.js';

/**
 * Extract contact information from text
 * 
 * @param {string} text - Resume text (typically header/preamble)
 * @returns {import('../shared/schemas.js').ContactInfo} Contact information
 */
export function extractContactInfo(text) {
  if (!text || typeof text !== 'string') {
    return {};
  }

  const contact = {};

  // Email pattern
  const emailPattern = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/g;
  const emailMatch = text.match(emailPattern);
  if (emailMatch && emailMatch[0]) {
    contact.email = emailMatch[0].trim();
  }

  // Phone patterns (various formats)
  const phonePatterns = [
    /(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g,  // US: (123) 456-7890
    /(?:\+?\d{1,3}[-.\s]?)?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g,    // International
    /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/g                                         // Simple: 123-456-7890
  ];

  for (const pattern of phonePatterns) {
    const phoneMatch = text.match(pattern);
    if (phoneMatch && phoneMatch[0]) {
      contact.phone = phoneMatch[0].trim();
      break;
    }
  }

  // LinkedIn URL
  const linkedinPattern = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[\w-]+\/?/gi;
  const linkedinMatch = text.match(linkedinPattern);
  if (linkedinMatch && linkedinMatch[0]) {
    contact.linkedin = linkedinMatch[0].trim();
  }

  // GitHub URL
  const githubPattern = /(?:https?:\/\/)?(?:www\.)?github\.com\/[\w-]+\/?/gi;
  const githubMatch = text.match(githubPattern);
  if (githubMatch && githubMatch[0]) {
    contact.github = githubMatch[0].trim();
  }

  // Website/Portfolio URL (generic)
  const websitePattern = /(?:https?:\/\/)?(?:www\.)?[\w-]+\.[a-z]{2,}(?:\/[\w-]*)?/gi;
  const websiteMatches = text.match(websitePattern);
  if (websiteMatches) {
    // Filter out LinkedIn, GitHub (already captured), email domains
    const filtered = websiteMatches.filter(url => {
      const lower = url.toLowerCase();
      return !lower.includes('linkedin.com') && 
             !lower.includes('github.com') && 
             !lower.includes('@') &&
             !lower.includes('gmail.com') &&
             !lower.includes('yahoo.com') &&
             !lower.includes('outlook.com');
    });
    if (filtered[0]) {
      contact.website = filtered[0].trim();
    }
  }

  // Location (city, state/country pattern)
  // This is heuristic - looks for common location patterns
  const locationPatterns = [
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?),\s*([A-Z]{2}|[A-Z][a-z]+)/g,  // "City, State" or "City, Country"
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s*[-–—]\s*([A-Z]{2}|[A-Z][a-z]+)/g  // "City - State"
  ];

  for (const pattern of locationPatterns) {
    const locationMatch = text.match(pattern);
    if (locationMatch && locationMatch[0]) {
      contact.location = locationMatch[0].trim();
      break;
    }
  }

  // Name (usually first line or first 2-3 words)
  const lines = text.split('\n').filter(line => line.trim());
  if (lines.length > 0) {
    const firstLine = lines[0].trim();
    // Name is typically first line, 2-4 words, title case
    const words = firstLine.split(/\s+/);
    if (words.length >= 2 && words.length <= 4 && 
        /^[A-Z]/.test(firstLine) && 
        !firstLine.includes('@') && 
        !firstLine.includes('http')) {
      contact.name = firstLine;
    }
  }

  return contact;
}

/**
 * Parse experience section
 * 
 * @param {string} experienceText - Experience section text
 * @returns {import('../shared/schemas.js').Experience[]} Parsed experience entries
 */
export function parseExperience(experienceText) {
  if (!experienceText || typeof experienceText !== 'string') {
    return [];
  }

  const entries = [];
  const lines = experienceText.split('\n').filter(line => line.trim());

  // Split by common patterns that indicate new entry
  // Usually: Company/Position on one line, then date, then bullets
  const entrySeparators = [
    /^[A-Z][^•\n]+(?:Inc\.?|LLC|Corp\.?|Ltd\.?|Company|Co\.?)?\s*$/i,  // Company name
    /^\d{4}\s*[-–—]\s*(?:\d{4}|Present|Current)/,                    // Date range
    /^[A-Z][^•\n]{10,}$/                                             // Position title
  ];

  let currentEntry = null;
  let currentBullets = [];
  let currentDescription = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Check if line is a bullet point
    const isBullet = /^[•\-\*]\s+/.test(line) || /^\d+[\.\)]\s+/.test(line);

    // Check if line looks like a company name
    const looksLikeCompany = /^[A-Z][^•\n]{5,}(?:Inc\.?|LLC|Corp\.?|Ltd\.?|Company|Co\.?)?\s*$/i.test(line);

    // Check if line looks like a position/title
    const looksLikePosition = /^[A-Z][^•\n]{10,100}$/.test(line) && 
                             !looksLikeCompany && 
                             !isBullet &&
                             !/\d{4}/.test(line);

    // Check if line contains date range
    const datePattern = /(\d{4}|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[\s\w\.,-]*(?:[-–—]|to)[\s\w\.,-]*(Present|Current|\d{4})/i;
    const hasDate = datePattern.test(line);

    if (looksLikeCompany || (looksLikePosition && !currentEntry)) {
      // Start new entry
      if (currentEntry) {
        // Save previous entry
        if (currentBullets.length > 0) {
          currentEntry.bullets = currentBullets.map(b => b.replace(/^[•\-\*\d\.\)]\s+/, '').trim());
        } else if (currentDescription.length > 0) {
          currentEntry.description = currentDescription.join('\n');
        }
        entries.push(currentEntry);
      }

      // Create new entry
      currentEntry = {
        company: looksLikeCompany ? line : '',
        position: looksLikePosition ? line : '',
        bullets: [],
        description: ''
      };
      currentBullets = [];
      currentDescription = [];

      if (looksLikePosition && !looksLikeCompany) {
        currentEntry.position = line;
      }

    } else if (currentEntry && hasDate) {
      // Parse date range
      const dateMatch = line.match(datePattern);
      if (dateMatch) {
        const dateParts = line.split(/[-–—]|to/i);
        if (dateParts.length >= 2) {
          currentEntry.startDate = dateParts[0].trim();
          currentEntry.endDate = dateParts[1].trim();
        } else {
          currentEntry.startDate = line.trim();
        }
      }
    } else if (currentEntry && isBullet) {
      // Bullet point
      currentBullets.push(line);
    } else if (currentEntry && line) {
      // Regular content
      if (currentBullets.length === 0) {
        // No bullets yet, might be description
        currentDescription.push(line);
      } else {
        // After bullets, treat as additional description
        currentDescription.push(line);
      }
    } else if (!currentEntry && line) {
      // Content before first entry - might be section header or intro text
      // Skip for now
    }
  }

  // Save last entry
  if (currentEntry) {
    if (currentBullets.length > 0) {
      currentEntry.bullets = currentBullets.map(b => b.replace(/^[•\-\*\d\.\)]\s+/, '').trim());
    } else if (currentDescription.length > 0) {
      currentEntry.description = currentDescription.join('\n');
    }
    entries.push(currentEntry);
  }

  return entries;
}

/**
 * Parse education section
 * 
 * @param {string} educationText - Education section text
 * @returns {import('../shared/schemas.js').Education[]} Parsed education entries
 */
export function parseEducation(educationText) {
  if (!educationText || typeof educationText !== 'string') {
    return [];
  }

  const entries = [];
  const lines = educationText.split('\n').filter(line => line.trim());

  let currentEntry = null;

  for (const line of lines) {
    // Check if line looks like institution name
    const looksLikeInstitution = /^[A-Z][^•\n]{5,}(?:University|College|Institute|School|Academy)/i.test(line);

    // Check if line contains degree
    const degreePattern = /(Bachelor|Master|PhD|Doctorate|Associate|Diploma|Certificate)/i;
    const hasDegree = degreePattern.test(line);

    // Check if line contains graduation date
    const datePattern = /\d{4}/;
    const hasDate = datePattern.test(line);

    if (looksLikeInstitution) {
      // Start new entry
      if (currentEntry) {
        entries.push(currentEntry);
      }

      currentEntry = {
        institution: line.trim(),
        degree: '',
        field: '',
        graduationDate: '',
        gpa: ''
      };

    } else if (currentEntry && hasDegree) {
      // Parse degree and field
      const degreeMatch = line.match(degreePattern);
      if (degreeMatch) {
        currentEntry.degree = line.trim();
      }
    } else if (currentEntry && hasDate && !currentEntry.graduationDate) {
      // Graduation date
      const dateMatch = line.match(/\d{4}/);
      if (dateMatch) {
        currentEntry.graduationDate = dateMatch[0];
      }
    } else if (currentEntry && /GPA|G\.P\.A\.|Grade Point Average/i.test(line)) {
      // GPA
      const gpaMatch = line.match(/(\d\.\d+)/);
      if (gpaMatch) {
        currentEntry.gpa = gpaMatch[1];
      }
    }
  }

  // Save last entry
  if (currentEntry) {
    entries.push(currentEntry);
  }

  return entries;
}

/**
 * Parse skills section
 * 
 * @param {string} skillsText - Skills section text
 * @returns {import('../shared/schemas.js').Skills} Parsed skills
 */
export function parseSkills(skillsText) {
  if (!skillsText || typeof skillsText !== 'string') {
    return { all: [] };
  }

  // Extract all skills (comma-separated, bullet points, or line-separated)
  const skillPatterns = [
    /[•\-\*]\s*([^\n]+)/g,      // Bullet points
    /([A-Z][a-zA-Z\s]+)(?:,|$)/g  // Comma-separated
  ];

  const allSkills = new Set();
  const skillLines = skillsText.split('\n');

  for (const line of skillLines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Try bullet extraction
    const bulletMatch = trimmed.match(/^[•\-\*]\s*(.+)$/);
    if (bulletMatch) {
      const skills = bulletMatch[1].split(',').map(s => s.trim());
      skills.forEach(skill => {
        if (skill && skill.length > 2) {
          allSkills.add(skill);
        }
      });
      continue;
    }

    // Try comma-separated
    if (trimmed.includes(',')) {
      const skills = trimmed.split(',').map(s => s.trim());
      skills.forEach(skill => {
        if (skill && skill.length > 2) {
          allSkills.add(skill);
        }
      });
      continue;
    }

    // Single skill per line
    if (trimmed.length > 2 && trimmed.length < 50) {
      allSkills.add(trimmed);
    }
  }

  const skillsArray = Array.from(allSkills);

  // Categorize skills (basic heuristics)
  const technical = [];
  const languages = [];
  const tools = [];
  const soft = [];
  const other = [];

  const programmingLanguages = [
    'javascript', 'java', 'python', 'c++', 'c#', 'php', 'ruby', 'go', 'rust',
    'swift', 'kotlin', 'typescript', 'html', 'css', 'sql', 'r', 'scala',
    'perl', 'shell', 'bash', 'powershell'
  ];

  const toolsKeywords = [
    'docker', 'kubernetes', 'jenkins', 'git', 'github', 'gitlab', 'aws',
    'azure', 'gcp', 'terraform', 'ansible', 'jira', 'confluence', 'slack'
  ];

  const softSkills = [
    'leadership', 'communication', 'teamwork', 'problem solving', 'management',
    'collaboration', 'presentation', 'negotiation', 'mentoring'
  ];

  for (const skill of skillsArray) {
    const skillLower = skill.toLowerCase();
    
    if (programmingLanguages.some(lang => skillLower.includes(lang))) {
      languages.push(skill);
    } else if (toolsKeywords.some(tool => skillLower.includes(tool))) {
      tools.push(skill);
    } else if (softSkills.some(soft => skillLower.includes(soft))) {
      soft.push(skill);
    } else if (/programming|development|coding|software|engineering|technical/i.test(skill)) {
      technical.push(skill);
    } else {
      other.push(skill);
    }
  }

  return {
    technical: technical.length > 0 ? technical : undefined,
    languages: languages.length > 0 ? languages : undefined,
    tools: tools.length > 0 ? tools : undefined,
    soft: soft.length > 0 ? soft : undefined,
    other: other.length > 0 ? other : undefined,
    all: skillsArray
  };
}

/**
 * Normalize resume sections into structured format
 * 
 * @param {string} rawText - Cleaned resume text
 * @param {string} format - Original format ("pdf", "docx", "text")
 * @returns {import('../shared/schemas.js').Resume} Normalized resume object
 */
export function normalizeResumeSections(rawText, format = 'text') {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('Invalid text input');
  }

  // Extract sections
  const sections = extractSections(rawText);

  // Extract contact info from preamble or full text
  const preamble = sections['_preamble'] || '';
  const contact = extractContactInfo(preamble || rawText.substring(0, 500));

  // Parse sections
  const experience = sections.experience ? parseExperience(sections.experience) : [];
  const education = sections.education ? parseEducation(sections.education) : [];
  const skills = sections.skills ? parseSkills(sections.skills) : { all: [] };

  // Extract other sections
  const summary = sections.summary || undefined;
  const certifications = sections.certifications ? 
    sections.certifications.split('\n')
      .filter(line => line.trim())
      .map(line => line.replace(/^[•\-\*]\s+/, '').trim()) : 
    undefined;

  const projects = sections.projects ? 
    sections.projects.split('\n')
      .filter(line => line.trim())
      .map(line => line.replace(/^[•\-\*]\s+/, '').trim()) : 
    undefined;

  const awards = sections.awards ? 
    sections.awards.split('\n')
      .filter(line => line.trim())
      .map(line => line.replace(/^[•\-\*]\s+/, '').trim()) : 
    undefined;

  // Build resume object
  const resume = {
    contact,
    summary: summary || undefined,
    experience,
    education,
    skills,
    certifications: certifications && certifications.length > 0 ? certifications : undefined,
    projects: projects && projects.length > 0 ? projects : undefined,
    awards: awards && awards.length > 0 ? awards : undefined,
    rawText: cleanResumeText(rawText, { name: contact.name }),
    metadata: {
      format,
      parsedAt: Date.now(),
      sections: Object.keys(sections).filter(key => key !== '_preamble'),
      warnings: []
    }
  };

  return resume;
}

