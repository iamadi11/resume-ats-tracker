# Feedback Engine

Actionable feedback system that generates practical suggestions based on ATS analysis.

## Quick Start

```javascript
import { generateFeedback } from './feedback/feedback-engine.js';

const feedback = generateFeedback(resumeText, jobText, resumeObject);

// Get all suggestions (prioritized)
console.log(feedback.suggestions);

// Get by severity
console.log(feedback.bySeverity.critical);
console.log(feedback.bySeverity.warning);
console.log(feedback.bySeverity.improvement);

// Get summary
console.log(feedback.summary);
```

## Features

### Detection Rules

1. **Missing Keywords** (`rules/missing-keywords.js`)
   - Identifies keywords from job description missing in resume
   - Categorizes by importance (critical, important, suggested)
   - Prioritizes high-frequency and hard skills

2. **Weak Action Verbs** (`rules/action-verbs.js`)
   - Detects weak verbs (worked, helped, did)
   - Identifies medium-strength verbs that could be stronger
   - Provides specific replacement suggestions

3. **Unquantified Bullets** (`rules/quantification.js`)
   - Finds bullet points without metrics
   - Identifies action-oriented bullets that should have numbers
   - Suggests appropriate metric types

4. **Overused Words** (`rules/word-usage.js`)
   - Detects frequently repeated words
   - Identifies common resume clichés
   - Suggests alternatives

5. **Formatting Violations** (`rules/formatting-violations.js`)
   - Detects ATS-unsafe formatting
   - Checks for missing contact information
   - Identifies structural issues

### Severity Levels

- **Critical**: Must fix immediately (breaks ATS parsing)
- **Warning**: Should address (affects matching/readability)
- **Improvement**: Recommended enhancements (improves quality)

### Suggestion Structure

```javascript
{
  category: "missing_keywords",
  severity: "critical",
  title: "Critical Keywords Missing",
  message: "These keywords are missing: ...",
  suggestion: "Add these keywords naturally...",
  // Category-specific metadata
  keywords: [...]
}
```

## Output Structure

```javascript
{
  suggestions: [...],           // All suggestions (prioritized)
  summary: "...",               // Human-readable summary
  bySeverity: {
    critical: [...],
    warning: [...],
    improvement: [...]
  },
  statistics: {
    total: 6,
    critical: 2,
    warning: 3,
    improvement: 1
  },
  details: {
    missingKeywords: {...},
    actionVerbs: {...},
    quantification: {...},
    overusedWords: {...},
    formattingViolations: {...}
  }
}
```

## Examples

See [FEEDBACK_EXAMPLES.md](./FEEDBACK_EXAMPLES.md) for complete examples with:
- Sample resume and job description
- Full feedback output
- Before/after comparison
- Category explanations

## Usage Examples

### Get Critical Issues Only

```javascript
const critical = feedback.bySeverity.critical;
critical.forEach(issue => {
  console.log(`[CRITICAL] ${issue.title}: ${issue.suggestion}`);
});
```

### Get Suggestions by Category

```javascript
import { getFeedbackByCategory } from './feedback-engine.js';

const keywordSuggestions = getFeedbackByCategory(feedback, 'missing_keywords');
const formattingSuggestions = getFeedbackByCategory(feedback, 'formatting');
```

### Filter by Severity

```javascript
import { getFeedbackBySeverity } from './feedback-engine.js';

const warnings = getFeedbackBySeverity(feedback, 'warning');
```

## Integration with Scoring

The feedback engine works alongside the scoring system:

```javascript
import { calculateATSScore } from '../scoring-engine.js';
import { generateFeedback } from './feedback-engine.js';

// Calculate score
const score = calculateATSScore(resumeText, jobText, resume);

// Generate feedback
const feedback = generateFeedback(resumeText, jobText, resume);

// Combine for complete analysis
const analysis = {
  score: score.overallScore,
  breakdown: score.breakdown,
  feedback: feedback.suggestions,
  recommendations: [...score.recommendations, ...feedback.suggestions.map(s => s.suggestion)]
};
```

## Best Practices

1. **Prioritize Critical Issues**: Address critical issues first
2. **Focus on Keywords**: Missing keywords have highest impact on ATS matching
3. **Add Metrics**: Quantifiable achievements significantly improve scores
4. **Use Strong Verbs**: Replace weak verbs with action-oriented alternatives
5. **Fix Formatting**: Ensure ATS can parse your resume correctly

## Customization

### Adjust Severity Thresholds

Modify thresholds in individual rule files:
- `missing-keywords.js`: Adjust frequency thresholds
- `action-verbs.js`: Add/remove weak/medium verbs
- `word-usage.js`: Adjust overuse thresholds
- `quantification.js`: Modify quantification detection patterns

### Add Custom Rules

1. Create new rule file in `rules/`
2. Export detection function
3. Add suggestion template in `suggestion-templates.js`
4. Integrate in `feedback-engine.js`

## Documentation

- [FEEDBACK_EXAMPLES.md](./FEEDBACK_EXAMPLES.md) - Complete examples
- Individual rule files - Detailed detection logic
- `suggestion-templates.js` - Suggestion generation

