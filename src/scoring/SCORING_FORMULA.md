# ATS Scoring Formula & Documentation

## Overview

The ATS scoring algorithm calculates a compatibility score (0-100) between a resume and job description using five weighted factors. The scoring is explainable, with detailed breakdowns for each factor.

## Scoring Formula

```
Overall Score = Σ(Category Score × Category Weight) × 100

Where:
- Category Score: 0-1 (normalized)
- Category Weight: Percentage weight
- Overall Score: 0-100
```

### Detailed Formula

```
Score = (
  KeywordMatch × 0.35 +
  SkillsAlignment × 0.25 +
  Formatting × 0.20 +
  ImpactMetrics × 0.10 +
  Readability × 0.10
) × 100
```

## Weight Justification

### 1. Keyword Match (35%)

**Weight:** 0.35 (35%)

**Justification:**
- Keywords are the primary mechanism ATS systems use to match resumes to job descriptions
- High weight ensures resumes with relevant keywords are properly identified
- Uses TF-IDF and cosine similarity for semantic matching
- Detects and penalizes keyword stuffing

**Calculation:**
```
KeywordMatch = (BaseMatch × 0.7 + TFIDFSimilarity × 0.3) × (1 - StuffingPenalty)

Where:
- BaseMatch = MatchedKeywords / TotalJobKeywords
- TFIDFSimilarity = Cosine similarity of TF-IDF vectors
- StuffingPenalty = 0-0.2 (based on keyword repetition)
```

### 2. Skills Alignment (25%)

**Weight:** 0.25 (25%)

**Justification:**
- Skills directly indicate candidate qualifications
- Strong alignment shows fit for the role
- Categorized into hard skills, soft skills, and tools
- Weighted by importance: Hard skills (60%), Soft skills (25%), Tools (15%)

**Calculation:**
```
SkillsAlignment = (
  HardSkillsScore × 0.6 +
  SoftSkillsScore × 0.25 +
  ToolsScore × 0.15
)

Where:
- CategoryScore = MatchedSkills / RequiredSkills (for that category)
```

### 3. Formatting Compliance (20%)

**Weight:** 0.20 (20%)

**Justification:**
- ATS systems must parse resumes correctly
- Poor formatting can cause information loss or parsing errors
- Detects ATS-unsafe elements (special characters, tables, etc.)
- Ensures resume is machine-readable

**Calculation:**
```
Formatting = (100 - TotalPenalties) / 100

Penalties:
- Special characters: -10 points
- Tables: -5 points
- Headers/footers: -3 points
- Missing contact info: -15 points
- Unsupported file format: -20 points
```

### 4. Impact & Metrics (10%)

**Weight:** 0.10 (10%)

**Justification:**
- Quantifiable achievements demonstrate value and results
- Recruiters and ATS systems value metrics
- Shows concrete impact rather than just responsibilities
- Differentiates strong candidates

**Calculation:**
```
ImpactMetrics = (
  MetricCountScore (0-50) +
  DiversityScore (0-20) +
  ImpactStatementsScore (0-20) +
  QualityBonus (0-10)
) / 100

Where:
- MetricCountScore = min(50, (metrics / 10) × 50)
- DiversityScore = min(20, uniqueTypes × 5)
- ImpactStatementsScore = min(20, (statements / 5) × 20)
- QualityBonus = high-value metrics bonus
```

### 5. Readability & Length (10%)

**Weight:** 0.10 (10%)

**Justification:**
- Readable resumes are easier for both ATS systems and humans to process
- Appropriate length ensures completeness without overwhelming
- Clear structure improves parsing accuracy
- Optimal length: 400-800 words

**Calculation:**
```
Readability = (100 - TotalPenalties) / 100

Penalties:
- Too short (<200 words): -20 points
- Too long (>1200 words): -10 points
- Long sentences (>25 words avg): -5 points
- Poor section structure (<2 sections): -10 points
```

## Scoring Rules Explained

### Keyword Matching Rules

1. **TF-IDF Calculation**
   - Term Frequency (TF): How often a term appears in a document
   - Inverse Document Frequency (IDF): How rare/common a term is
   - TF-IDF = TF × IDF
   - Higher TF-IDF = more important keyword

2. **Cosine Similarity**
   - Measures angle between two TF-IDF vectors
   - Range: 0-1 (1 = identical, 0 = no similarity)
   - Captures semantic similarity, not just exact matches

3. **Keyword Stuffing Detection**
   - Detects excessive repetition of keywords
   - Threshold: Keyword appears >5% of total words
   - Penalty: Up to 20% score reduction
   - Prevents gaming the system

4. **Match Calculation**
   - Base match: Percentage of job keywords found in resume
   - Combined with TF-IDF similarity (70% base, 30% similarity)
   - Applies stuffing penalty if detected

### Skills Matching Rules

1. **Skill Normalization**
   - Normalizes variations (React.js → react)
   - Removes version numbers (Python 3 → python)
   - Handles abbreviations (JS → javascript)

2. **Categorization**
   - Hard skills: Programming languages, frameworks, databases
   - Soft skills: Leadership, communication, teamwork
   - Tools: Docker, AWS, Git, CI/CD platforms

3. **Matching**
   - Exact match after normalization
   - Case-insensitive comparison
   - Multi-word skills handled correctly

4. **Scoring**
   - Category score = Matched / Required
   - Overall = Weighted average of categories
   - Hard skills weighted highest (most important)

### Formatting Rules

1. **Special Characters**
   - Detects non-standard characters
   - Threshold: >5 unique special characters
   - Penalty: -10 points

2. **Tables**
   - Detects table formatting (pipe characters)
   - May not parse correctly in ATS
   - Penalty: -5 points

3. **Headers/Footers**
   - Excessive headers/footers indicate poor formatting
   - Threshold: >5 occurrences
   - Penalty: -3 points

4. **Contact Information**
   - Must have email or phone
   - Missing both: -15 points
   - Missing email: Warning only

5. **File Format**
   - Supported: PDF, DOCX, TXT
   - Unsupported formats: -20 points

### Impact Detection Rules

1. **Percentage Improvements**
   - Pattern: "increased by X%", "improved X%"
   - Detects quantifiable improvements
   - Higher percentages score better

2. **Currency Values**
   - Pattern: "$X", "$Xk", "$Xm"
   - Revenue, cost savings, budget managed
   - Larger values score better

3. **Counts/Scale**
   - Pattern: "managed X users", "built X features"
   - Team size, project scale
   - Larger numbers score better

4. **Time Improvements**
   - Pattern: "reduced time by X%"
   - Efficiency improvements
   - Higher percentages score better

5. **Impact Statements**
   - Action verbs: "achieved", "delivered", "exceeded"
   - Result phrases: "resulted in", "led to"
   - Statements with metrics score higher

### Readability Rules

1. **Word Count**
   - Optimal: 400-800 words
   - Too short (<200): -20 points
   - Too long (>1200): -10 points

2. **Sentence Length**
   - Optimal: 15-20 words average
   - Too long (>25 words): -5 points
   - Affects readability

3. **Section Structure**
   - Should have 4-6 clear sections
   - Less than 2 sections: -10 points
   - Improves ATS parsing

4. **Bullet Points**
   - Should use bullets for achievements
   - Too many (>15% of words): Warning
   - Too few (<5%): Warning

5. **Repetition**
   - Detects frequently repeated words
   - Indicates poor writing
   - Warning only (no penalty)

## Sample Evaluation

### Input

**Resume Text:**
```
John Doe
Software Engineer
john.doe@email.com | (555) 123-4567

Experience:
- Built React.js applications using JavaScript
- Increased performance by 40%
- Managed team of 5 engineers
- Reduced load time by 30%

Skills: React, JavaScript, Node.js, Python, Leadership
```

**Job Description:**
```
We are looking for a Software Engineer with:
- 3+ years experience with React.js
- Strong JavaScript skills
- Experience with Node.js
- Leadership skills
- Python experience preferred
```

### Output

```javascript
{
  overallScore: 78.5,
  breakdown: {
    keywordMatch: {
      score: 75.0,
      weight: 35,
      weightedScore: 26.25,
      details: {
        matchedKeywords: 8,
        missingKeywords: 2,
        similarity: 0.72,
        stuffingDetected: false
      }
    },
    skillsAlignment: {
      score: 90.0,
      weight: 25,
      weightedScore: 22.5,
      details: {
        hardSkills: {
          matched: 4,
          missing: 0,
          score: 100
        },
        softSkills: {
          matched: 1,
          missing: 0,
          score: 100
        }
      }
    },
    formatting: {
      score: 85.0,
      weight: 20,
      weightedScore: 17.0,
      details: {
        issues: 0,
        warnings: 1
      }
    },
    impactMetrics: {
      score: 60.0,
      weight: 10,
      weightedScore: 6.0,
      details: {
        metricsCount: 2,
        impactStatements: 0
      }
    },
    readability: {
      score: 80.0,
      weight: 10,
      weightedScore: 8.0,
      details: {
        wordCount: 45,
        issues: 1 // Too short
      }
    }
  },
  explanation: "Good ATS compatibility. Some improvements could enhance your score. Good skills alignment with job requirements. Consider adding more quantifiable achievements and metrics.",
  recommendations: [
    "Add more detail to reach 400-800 words",
    "Add more quantifiable achievements with numbers, percentages, and metrics."
  ]
}
```

## Algorithm Complexity

- **Time Complexity:** O(n × m) where n = resume words, m = job description words
- **Space Complexity:** O(n + m) for storing TF-IDF vectors
- **Optimization:** Uses Maps for O(1) lookups, efficient similarity calculation

## Limitations

1. **Language:** Optimized for English
2. **Context:** Cannot understand context (e.g., "not experienced with X")
3. **Synonyms:** Limited synonym handling
4. **Industry-specific:** May need tuning for specific industries

## Future Improvements

1. **Machine Learning:** Train models on successful resumes
2. **Semantic Understanding:** Better context awareness
3. **Industry Adaptation:** Industry-specific scoring
4. **Multi-language:** Support for other languages

