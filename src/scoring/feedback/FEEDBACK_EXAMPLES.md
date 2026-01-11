# Feedback Engine Examples

## Example Feedback Output

### Input

**Resume Text:**
```
John Doe
Software Engineer
john.doe@email.com

Experience:
- Worked on React applications
- Helped with team projects
- Did various tasks
- Responsible for code reviews
- Maintained existing systems
- Updated documentation

Skills: JavaScript, React, Node.js
```

**Job Description:**
```
We are looking for a Software Engineer with:
- 3+ years experience with React.js
- Strong JavaScript and TypeScript skills
- Experience with Node.js and Python
- Leadership skills
- Experience with AWS and Docker
- Ability to deliver quantifiable results
```

### Output

```javascript
{
  suggestions: [
    {
      category: "missing_keywords",
      severity: "critical",
      title: "Critical Keywords Missing",
      message: "These high-frequency keywords from the job description are missing: typescript, python, aws, docker",
      suggestion: "Add these keywords naturally throughout your resume, especially in the Skills and Experience sections.",
      keywords: ["typescript", "python", "aws", "docker"]
    },
    {
      category: "formatting",
      severity: "critical",
      title: "Contact Info",
      message: "No email address or phone number detected",
      suggestion: "Add a professional email address and phone number at the top of your resume. This is essential for ATS parsing and recruiter contact."
    },
    {
      category: "action_verbs",
      severity: "warning",
      title: "Weak Action Verbs Detected",
      message: "Found 6 instances of weak action verbs (e.g., \"worked\", \"helped\", \"did\")",
      suggestion: "Replace weak verbs with stronger alternatives. For example: \"worked\" → \"developed\", \"helped\" → \"collaborated\", \"did\" → \"executed\". Use action verbs that demonstrate impact.",
      weakVerbs: ["worked", "helped", "did", "responsible", "maintained", "updated"],
      examples: [
        { verb: "worked", context: "Worked on React applications", suggestion: ["developed", "engineered", "built", "created", "designed"] },
        { verb: "helped", context: "Helped with team projects", suggestion: ["collaborated", "supported", "facilitated", "enabled", "assisted"] },
        { verb: "did", context: "Did various tasks", suggestion: ["executed", "performed", "accomplished", "delivered", "achieved"] }
      ]
    },
    {
      category: "quantification",
      severity: "warning",
      title: "Unquantified Achievement Bullets",
      message: "Found 6 action-oriented bullet points without quantifiable metrics. Only 0% of your bullets include metrics.",
      suggestion: "Add specific numbers, percentages, or metrics to your achievements. For example: \"Increased performance by 40%\", \"Managed team of 5 engineers\", \"Reduced costs by $50K\". Quantifiable results are highly valued by ATS systems and recruiters.",
      unquantifiedCount: 6,
      quantificationRate: 0
    },
    {
      category: "word_usage",
      severity: "warning",
      title: "Overused Words Detected",
      message: "These words appear too frequently: \"various\" (1x)",
      suggestion: "Replace overused words with alternatives to improve readability and avoid repetition. Consider using synonyms or restructuring sentences.",
      overusedWords: [
        {
          word: "various",
          count: 1,
          frequency: "1.67%",
          severity: "medium",
          alternatives: ["multiple", "diverse", "several", "numerous"],
          suggestion: "Consider replacing \"various\" with: multiple, diverse, several"
        }
      ]
    },
    {
      category: "action_verbs",
      severity: "improvement",
      title: "Action Verbs Could Be Stronger",
      message: "Found 2 instances of medium-strength verbs that could be improved",
      suggestion: "Consider replacing with more impactful verbs. For example: \"maintained\" → \"optimized\", \"updated\" → \"enhanced\", \"used\" → \"leveraged\".",
      mediumVerbs: ["maintained", "updated"]
    }
  ],
  summary: "Found 2 critical issue(s) that need immediate attention. 3 warning(s) that should be addressed. 1 improvement suggestion(s) to enhance your resume. Missing 4 critical keyword(s) from the job description. Found 6 weak action verb(s) that could be strengthened. Only 0% of bullet points include quantifiable metrics.",
  bySeverity: {
    critical: [
      // Missing keywords suggestion
      // Formatting suggestion
    ],
    warning: [
      // Action verbs suggestion
      // Quantification suggestion
      // Word usage suggestion
    ],
    improvement: [
      // Action verbs improvement suggestion
    ]
  },
  statistics: {
    total: 6,
    critical: 2,
    warning: 3,
    improvement: 1
  },
  details: {
    missingKeywords: {
      missing: [
        { term: "typescript", frequency: 1, category: "hard" },
        { term: "python", frequency: 1, category: "hard" },
        { term: "aws", frequency: 1, category: "tool" },
        { term: "docker", frequency: 1, category: "tool" }
      ],
      critical: [
        { term: "typescript", frequency: 1, category: "hard" },
        { term: "python", frequency: 1, category: "hard" },
        { term: "aws", frequency: 1, category: "tool" },
        { term: "docker", frequency: 1, category: "tool" }
      ],
      totalMissing: 4
    },
    actionVerbs: {
      weak: [
        { verb: "worked", context: "Worked on React applications", suggestion: ["developed", "engineered", "built", "created", "designed"] },
        { verb: "helped", context: "Helped with team projects", suggestion: ["collaborated", "supported", "facilitated", "enabled", "assisted"] },
        { verb: "did", context: "Did various tasks", suggestion: ["executed", "performed", "accomplished", "delivered", "achieved"] },
        { verb: "responsible", context: "Responsible for code reviews", suggestion: ["managed", "led", "oversaw", "orchestrated"] }
      ],
      medium: [
        { verb: "maintained", context: "Maintained existing systems", suggestion: ["optimized", "enhanced", "improved", "upgraded"] },
        { verb: "updated", context: "Updated documentation", suggestion: ["enhanced", "improved", "upgraded", "refined"] }
      ],
      totalWeak: 4,
      totalMedium: 2
    },
    quantification: {
      quantified: [],
      unquantified: [
        { text: "Worked on React applications", isActionBullet: true, suggestion: "Add metrics like: user count, performance improvement (%), response time reduction, or scale" },
        { text: "Helped with team projects", isActionBullet: true, suggestion: "Add scale metrics: team size, project budget, number of projects, or timeline" },
        { text: "Did various tasks", isActionBullet: true, suggestion: "Add a quantifiable metric: percentage improvement, dollar amount, count, or scale" },
        { text: "Responsible for code reviews", isActionBullet: true, suggestion: "Add a quantifiable metric: percentage improvement, dollar amount, count, or scale" },
        { text: "Maintained existing systems", isActionBullet: true, suggestion: "Add efficiency metrics: time reduction (%), cost savings ($), throughput increase, or error reduction" },
        { text: "Updated documentation", isActionBullet: true, suggestion: "Add a quantifiable metric: percentage improvement, dollar amount, count, or scale" }
      ],
      quantifiedCount: 0,
      unquantifiedCount: 6,
      quantificationRate: 0
    },
    overusedWords: {
      overused: [
        {
          word: "various",
          count: 1,
          frequency: "1.67%",
          severity: "medium",
          alternatives: ["multiple", "diverse", "several", "numerous"],
          suggestion: "Consider replacing \"various\" with: multiple, diverse, several"
        }
      ],
      totalOverused: 1
    },
    formattingViolations: {
      violations: [
        {
          type: "contact_info",
          severity: "critical",
          message: "No email address or phone number detected",
          suggestion: "Add a professional email address and phone number at the top of your resume. This is essential for ATS parsing and recruiter contact.",
          count: 0
        }
      ],
      warnings: [],
      totalViolations: 1,
      totalWarnings: 0
    }
  }
}
```

## Improved Resume Example

After applying feedback, the resume could look like:

```
John Doe
Software Engineer
john.doe@email.com | (555) 123-4567

Experience:
- Developed React.js applications serving 10K+ users, improving performance by 40%
- Collaborated with cross-functional teams of 5+ engineers to deliver 3 major projects
- Executed code reviews and implemented best practices, reducing bugs by 25%
- Optimized existing systems, reducing response time by 30% and saving $50K annually
- Enhanced documentation and created developer guides, improving onboarding time by 50%

Skills: JavaScript, TypeScript, React, Node.js, Python, AWS, Docker, Leadership
```

## Feedback Categories Explained

### 1. Missing Keywords (Critical/Warning)
- **Critical**: High-frequency keywords from job description that are missing
- **Warning**: Important keywords that appear multiple times
- **Suggestion**: Add keywords naturally in Skills and Experience sections

### 2. Action Verbs (Warning/Improvement)
- **Warning**: Weak verbs like "worked", "helped", "did"
- **Improvement**: Medium-strength verbs that could be stronger
- **Suggestion**: Replace with impactful verbs that demonstrate results

### 3. Quantification (Warning)
- **Warning**: Action-oriented bullets without metrics
- **Suggestion**: Add numbers, percentages, dollar amounts, or scale metrics

### 4. Word Usage (Warning/Improvement)
- **Warning**: Overused words appearing frequently
- **Improvement**: Words that could be varied
- **Suggestion**: Use synonyms or restructure sentences

### 5. Formatting Violations (Critical/Warning/Improvement)
- **Critical**: Issues that break ATS parsing (special characters, missing contact info)
- **Warning**: Issues that may affect parsing (tables, headers/footers)
- **Improvement**: Issues that affect readability (long lines, whitespace)

## Severity Levels

### Critical
- Must fix immediately
- Breaks ATS parsing or significantly reduces score
- Examples: Missing critical keywords, no contact info, unsupported file format

### Warning
- Should address
- Affects ATS matching or readability
- Examples: Weak action verbs, unquantified bullets, overused words

### Improvement
- Recommended enhancements
- Improves overall quality
- Examples: Stronger verbs, better word variety, formatting polish

## Usage

```javascript
import { generateFeedback } from './feedback/feedback-engine.js';

const feedback = generateFeedback(resumeText, jobText, resumeObject);

// Get critical issues
const critical = feedback.bySeverity.critical;

// Get all suggestions
const allSuggestions = feedback.suggestions;

// Get by category
import { getFeedbackByCategory } from './feedback/feedback-engine.js';
const keywordSuggestions = getFeedbackByCategory(feedback, 'missing_keywords');
```

