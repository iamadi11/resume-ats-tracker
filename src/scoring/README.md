# ATS Scoring System

Complete explainable ATS scoring algorithm that calculates compatibility scores (0-100) between resumes and job descriptions.

## Quick Start

```javascript
import { calculateATSScore } from './scoring/scoring-engine.js';

const resumeText = "...";
const jobText = "...";

const result = calculateATSScore(resumeText, jobText);

console.log('Overall Score:', result.overallScore);
console.log('Breakdown:', result.breakdown);
console.log('Recommendations:', result.recommendations);
```

## Architecture

```
scoring-engine.js          # Main orchestrator
├── rules/
│   ├── keyword-matcher.js      # Keyword matching (TF-IDF)
│   ├── skills-matcher.js        # Skills alignment
│   ├── formatting-checker.js    # Formatting compliance
│   ├── impact-detector.js       # Impact & metrics
│   └── readability-checker.js   # Readability & length
├── utils/
│   └── tfidf.js                 # TF-IDF & cosine similarity
└── extraction/                  # Keyword/skill extraction
```

## Scoring Formula

```
Overall Score = (
  KeywordMatch × 0.35 +
  SkillsAlignment × 0.25 +
  Formatting × 0.20 +
  ImpactMetrics × 0.10 +
  Readability × 0.10
) × 100
```

## Weight Justification

See [SCORING_FORMULA.md](./SCORING_FORMULA.md) for detailed justification of each weight.

### Summary

1. **Keyword Match (35%)**: Primary ATS matching mechanism
2. **Skills Alignment (25%)**: Direct qualification indicator
3. **Formatting (20%)**: Ensures ATS can parse correctly
4. **Impact & Metrics (10%)**: Demonstrates value
5. **Readability (10%)**: Ensures clarity for ATS and humans

## Output Structure

```javascript
{
  overallScore: 78.5,        // 0-100
  breakdown: {
    keywordMatch: {
      score: 75.0,
      weight: 35,
      weightedScore: 26.25,
      details: {...}
    },
    skillsAlignment: {...},
    formatting: {...},
    impactMetrics: {...},
    readability: {...}
  },
  explanation: "...",
  recommendations: [...],
  rawScores: {...}
}
```

## Features

- ✅ **TF-IDF & Cosine Similarity**: Semantic keyword matching
- ✅ **Keyword Stuffing Detection**: Prevents gaming the system
- ✅ **Skills Normalization**: Handles variations (React.js → react)
- ✅ **Formatting Checks**: Detects ATS-unsafe elements
- ✅ **Impact Detection**: Finds quantifiable achievements
- ✅ **Readability Analysis**: Checks length, structure, clarity
- ✅ **Explainable**: Detailed breakdowns and recommendations

## Documentation

- [SCORING_FORMULA.md](./SCORING_FORMULA.md) - Complete formula documentation
- [EXTRACTION_GUIDE.md](./extraction/EXTRACTION_GUIDE.md) - Keyword/skill extraction guide

## Example

See [SCORING_FORMULA.md](./SCORING_FORMULA.md) for complete sample evaluation with input/output.

