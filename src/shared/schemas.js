/**
 * Data Schemas
 * 
 * Defines the structure of data objects used throughout the extension.
 */

/**
 * Normalized Resume Schema
 * 
 * @typedef {Object} Resume
 * @property {ContactInfo} contact - Contact information
 * @property {string} [summary] - Professional summary/objective
 * @property {Experience[]} experience - Work experience entries
 * @property {Education[]} education - Education entries
 * @property {Skills} skills - Skills categorized
 * @property {string[]} [certifications] - Certifications/licenses
 * @property {string[]} [projects] - Project descriptions
 * @property {string[]} [awards] - Awards and achievements
 * @property {string} rawText - Clean, extracted raw text
 * @property {ResumeMetadata} metadata - Resume metadata
 */

/**
 * Contact Information
 * 
 * @typedef {Object} ContactInfo
 * @property {string} [name] - Full name
 * @property {string} [email] - Email address
 * @property {string} [phone] - Phone number
 * @property {string} [location] - Location (city, state/country)
 * @property {string} [linkedin] - LinkedIn profile URL
 * @property {string} [website] - Personal website/portfolio
 * @property {string} [github] - GitHub profile URL
 */

/**
 * Work Experience Entry
 * 
 * @typedef {Object} Experience
 * @property {string} company - Company name
 * @property {string} [position] - Job title/position
 * @property {string} [location] - Job location
 * @property {string} [startDate] - Start date (formatted)
 * @property {string} [endDate] - End date (formatted, "Present" if current)
 * @property {string[]} bullets - Achievement/responsibility bullets
 * @property {string} [description] - Full description (if bullets not parsed)
 */

/**
 * Education Entry
 * 
 * @typedef {Object} Education
 * @property {string} institution - School/university name
 * @property {string} [degree] - Degree type (e.g., "Bachelor of Science")
 * @property {string} [field] - Field of study
 * @property {string} [location] - Institution location
 * @property {string} [graduationDate] - Graduation date
 * @property {string} [gpa] - GPA (if mentioned)
 * @property {string[]} [honors] - Honors/awards
 */

/**
 * Skills Categorization
 * 
 * @typedef {Object} Skills
 * @property {string[]} [technical] - Technical skills
 * @property {string[]} [languages] - Programming languages
 * @property {string[]} [tools] - Tools and technologies
 * @property {string[]} [soft] - Soft skills
 * @property {string[]} [other] - Other skills
 * @property {string[]} [all] - All skills (flat list)
 */

/**
 * Resume Metadata
 * 
 * @typedef {Object} ResumeMetadata
 * @property {string} format - Original format ("pdf", "docx", "text")
 * @property {number} parsedAt - Timestamp when parsed
 * @property {number} [pageCount] - Number of pages (for PDF)
 * @property {string[]} [sections] - Detected section names
 * @property {string[]} [warnings] - Parsing warnings
 * @property {Object} [original] - Original file metadata
 */

/**
 * Parsing Result
 * 
 * @typedef {Object} ParseResult
 * @property {boolean} success - Whether parsing was successful
 * @property {Resume} [resume] - Parsed resume data
 * @property {string} [error] - Error message if failed
 * @property {string[]} [warnings] - Parsing warnings
 */

