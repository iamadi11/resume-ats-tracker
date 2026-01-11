# Keyword and Skill Extraction Guide

## Overview

The extraction system provides comprehensive keyword and skill extraction from resume and job description text, with normalization, categorization, and analysis capabilities.

## Data Structures

### Keyword Object

```javascript
{
  term: "react",           // Normalized keyword
  frequency: 5,            // Number of occurrences
  category: "hard"         // Category: "hard", "soft", "tool", "role", "other"
}
```

### Extraction Result

```javascript
{
  keywords: [              // Array of keyword objects
    { term: "react", frequency: 5, category: "hard" },
    { term: "javascript", frequency: 10, category: "hard" },
    // ...
  ],
  skills: {                // Categorized skills
    hard: ["react", "javascript", "python"],
    soft: ["leadership", "communication"],
    tools: ["git", "docker", "aws"],
    roles: [],
    other: []
  },
  statistics: {
    totalKeywords: 50,
    totalWords: 500,
    byCategory: {
      hard: [...],
      soft: [...],
      // ...
    }
  },
  proximity: Map,          // Proximity scores (if included)
  positions: Map           // Term positions (if included)
}
```

### Comparison Result

```javascript
{
  common: [                // Keywords in both texts
    {
      term: "react",
      frequency1: 5,       // Frequency in first text
      frequency2: 3,       // Frequency in second text
      category: "hard"
    }
  ],
  unique1: [...],          // Keywords only in first text
  unique2: [...],          // Keywords only in second text
  matchScore: 0.75         // Similarity score (0-1)
}
```

## Usage Examples

### Basic Keyword Extraction

```javascript
import { extractKeywords } from './extraction/index.js';

const text = `
  I have experience with React.js and JavaScript. 
  I've worked with React for 3 years.
  Also familiar with Node.js and Python.
`;

const result = extractKeywords(text);

console.log(result.keywords);
// [
//   { term: "react", frequency: 2, category: "hard" },
//   { term: "javascript", frequency: 1, category: "hard" },
//   { term: "node.js", frequency: 1, category: "hard" },
//   { term: "python", frequency: 1, category: "hard" }
// ]
```

### Skill Normalization

```javascript
import { normalizeSkill, normalizeSkills } from './extraction/index.js';

// Single skill
console.log(normalizeSkill("React.js"));    // "react"
console.log(normalizeSkill("reactjs"));     // "react"
console.log(normalizeSkill("Python 3"));    // "python"

// Multiple skills
const skills = ["React.js", "nodejs", "Python 3"];
const normalized = normalizeSkills(skills);
console.log(normalized);  // ["react", "node.js", "python"]
```

### Skill Categorization

```javascript
import { categorizeSkill, categorizeSkills } from './extraction/index.js';

console.log(categorizeSkill("React"));        // "hard"
console.log(categorizeSkill("leadership"));   // "soft"
console.log(categorizeSkill("docker"));       // "tool"
console.log(categorizeSkill("software engineer")); // "role"

// Categorize multiple skills
const skills = ["React", "leadership", "docker", "javascript"];
const categorized = categorizeSkills(skills);

console.log(categorized);
// {
//   hard: ["React", "javascript"],
//   soft: ["leadership"],
//   tools: ["docker"],
//   roles: [],
//   other: []
// }
```

### Resume Extraction

```javascript
import { extractFromResume } from './extraction/index.js';

const resumeText = `
  John Doe
  Software Engineer
  
  Experience:
  - Built React applications
  - Used JavaScript and TypeScript
  - Managed projects with leadership skills
  
  Skills:
  React, JavaScript, Python, Leadership, Communication
`;

const result = extractFromResume(resumeText, {
  includeProximity: true,
  includeCategoryBreakdown: true,
  minFrequency: 1,
  maxKeywords: 50
});

console.log(result.skills);
// {
//   hard: ["react", "javascript", "typescript", "python"],
//   soft: ["leadership", "communication"],
//   tools: [],
//   roles: [],
//   other: []
// }
```

### Job Description Extraction

```javascript
import { extractFromJobDescription } from './extraction/index.js';

const jobText = `
  We are looking for a Software Engineer with:
  - 3+ years experience with React.js
  - Strong JavaScript skills
  - Experience with Node.js
  - Leadership and communication skills
`;

const result = extractFromJobDescription(jobText);

console.log(result.keywords);
// Extracted and normalized keywords
```

### Compare Resume and Job Description

```javascript
import { extractAndCompare } from './extraction/index.js';

const resumeText = "...";
const jobText = "...";

const comparison = extractAndCompare(resumeText, jobText, {
  includeProximity: false,
  minFrequency: 1
});

console.log(comparison.keywordComparison.matchScore);  // 0.75
console.log(comparison.skillComparison.hard.matchScore);  // 0.80
console.log(comparison.skillComparison.hard.common);  // ["react", "javascript"]
console.log(comparison.skillComparison.hard.unique1);  // Skills in resume but not job
console.log(comparison.skillComparison.hard.unique2);  // Skills in job but not resume
```

### Proximity Analysis

```javascript
import { extractKeywordsWithProximity } from './extraction/index.js';

const text = "React and JavaScript are used together. React is a library.";

const result = extractKeywordsWithProximity(text);

// Check proximity between "react" and "javascript"
const reactProximity = result.proximity.get("react");
const jsDistance = reactProximity?.get("javascript");

console.log(jsDistance);
// {
//   distance: 2,        // 2 words apart
//   occurrences: 1      // Number of times they appear within 10 words
// }
```

### Options

```javascript
const options = {
  // Minimum frequency threshold (default: 1)
  minFrequency: 2,
  
  // Maximum number of keywords to return (default: 100)
  maxKeywords: 50,
  
  // Include bigrams and trigrams (default: true)
  includeNGrams: true,
  
  // Remove stopwords (default: true)
  removeStopwords: true,
  
  // Include proximity analysis (for extractFromResume/extractFromJobDescription)
  includeProximity: true,
  
  // Include category breakdown (for extractFromResume/extractFromJobDescription)
  includeCategoryBreakdown: true
};
```

## Sample Input/Output

### Input: Resume Text

```
John Doe
Software Engineer

Experience:
- Built React.js applications using JavaScript
- Developed backend services with Node.js and Python
- Led a team of 5 engineers
- Improved system performance by 40%

Skills:
React.js, JavaScript, Node.js, Python, Leadership, Communication, Docker, AWS
```

### Output: Extraction Result

```javascript
{
  keywords: [
    { term: "javascript", frequency: 2, category: "hard" },
    { term: "react", frequency: 1, category: "hard" },
    { term: "node.js", frequency: 1, category: "hard" },
    { term: "python", frequency: 1, category: "hard" },
    { term: "leadership", frequency: 1, category: "soft" },
    { term: "communication", frequency: 1, category: "soft" },
    { term: "docker", frequency: 1, category: "tool" },
    { term: "aws", frequency: 1, category: "tool" },
    { term: "software engineer", frequency: 1, category: "role" },
    // ... more keywords
  ],
  skills: {
    hard: ["javascript", "react", "node.js", "python"],
    soft: ["leadership", "communication"],
    tools: ["docker", "aws"],
    roles: ["software engineer"],
    other: []
  },
  statistics: {
    totalKeywords: 45,
    totalWords: 78,
    byCategory: {
      hard: [...],
      soft: [...],
      tools: [...],
      roles: [...],
      other: [...]
    }
  }
}
```

### Input: Job Description Text

```
We are hiring a Senior Software Engineer

Requirements:
- 5+ years experience with React.js and JavaScript
- Strong skills in Node.js
- Experience with AWS and Docker
- Excellent leadership and communication skills
- Python experience is a plus
```

### Output: Extraction Result

```javascript
{
  keywords: [
    { term: "javascript", frequency: 1, category: "hard" },
    { term: "react", frequency: 1, category: "hard" },
    { term: "node.js", frequency: 1, category: "hard" },
    { term: "python", frequency: 1, category: "hard" },
    { term: "aws", frequency: 1, category: "tool" },
    { term: "docker", frequency: 1, category: "tool" },
    { term: "leadership", frequency: 1, category: "soft" },
    { term: "communication", frequency: 1, category: "soft" },
    { term: "senior software engineer", frequency: 1, category: "role" },
    // ... more keywords
  ],
  skills: {
    hard: ["javascript", "react", "node.js", "python"],
    soft: ["leadership", "communication"],
    tools: ["aws", "docker"],
    roles: ["senior software engineer"],
    other: []
  }
}
```

### Output: Comparison

```javascript
{
  keywordComparison: {
    common: [
      { term: "javascript", frequency1: 2, frequency2: 1, category: "hard" },
      { term: "react", frequency1: 1, frequency2: 1, category: "hard" },
      { term: "node.js", frequency1: 1, frequency2: 1, category: "hard" },
      { term: "python", frequency1: 1, frequency2: 1, category: "hard" },
      { term: "aws", frequency1: 1, frequency2: 1, category: "tool" },
      { term: "docker", frequency1: 1, frequency2: 1, category: "tool" },
      { term: "leadership", frequency1: 1, frequency2: 1, category: "soft" },
      { term: "communication", frequency1: 1, frequency2: 1, category: "soft" }
    ],
    unique1: [],  // No unique keywords in resume
    unique2: [
      { term: "senior software engineer", frequency: 1, category: "role" }
    ],
    matchScore: 0.89  // High match score
  },
  skillComparison: {
    hard: {
      common: ["javascript", "react", "node.js", "python"],
      unique1: [],
      unique2: [],
      matchScore: 1.0,    // Perfect match
      coverage: 1.0       // 100% of job requirements covered
    },
    soft: {
      common: ["leadership", "communication"],
      unique1: [],
      unique2: [],
      matchScore: 1.0,
      coverage: 1.0
    },
    tools: {
      common: ["aws", "docker"],
      unique1: [],
      unique2: [],
      matchScore: 1.0,
      coverage: 1.0
    }
  }
}
```

## Algorithm Details

### Keyword Extraction Algorithm

1. **Text Preprocessing**
   - Convert to lowercase
   - Split into words
   - Remove punctuation from boundaries
   - Filter short words (< 3 characters)

2. **Stopword Removal**
   - Remove common stopwords
   - Remove technical stopwords
   - Optional: keep custom stopwords

3. **N-gram Extraction** (optional)
   - Extract bigrams (2-word phrases)
   - Extract trigrams (3-word phrases)
   - Helps capture multi-word terms like "machine learning"

4. **Normalization**
   - Normalize skill variations
   - Remove version numbers
   - Standardize abbreviations

5. **Frequency Calculation**
   - Count occurrences of each term
   - Aggregate by normalized form
   - Filter by minimum frequency

6. **Categorization**
   - Categorize each keyword
   - Group by category

### Skill Normalization Strategy

1. **Exact Mappings**
   - Check against predefined skill mappings
   - Handles common variations (React.js → react)

2. **Pattern-Based Rules**
   - Remove version numbers (Python 3 → Python)
   - Handle suffixes (.js, .jsx)
   - Preserve common abbreviations (Node.js)

3. **Fallback Normalization**
   - Title case for multi-word skills
   - Lowercase for single words
   - Preserve common lowercase prefixes

### Proximity Detection

1. **Position Tracking**
   - Track position of each keyword occurrence
   - Build position maps

2. **Distance Calculation**
   - Calculate minimum distance between term pairs
   - Count co-occurrences within threshold (default: 10 words)

3. **Proximity Scores**
   - Store proximity information in Map structure
   - Useful for semantic analysis

## Performance Considerations

- **Text Length**: Performance scales with text length
- **N-grams**: Including n-grams increases computation
- **Proximity**: Proximity analysis adds overhead
- **Caching**: Consider caching normalized skills

## Limitations

- **Context**: Cannot understand context (e.g., "not experienced with React")
- **Synonyms**: Doesn't handle synonyms automatically (e.g., "JS" vs "JavaScript")
- **Multi-word Skills**: Some multi-word skills may not be captured correctly
- **Language**: Optimized for English

## Future Improvements

- Synonym expansion
- Context-aware extraction
- ML-based skill extraction
- Multi-language support
- Industry-specific dictionaries

