# ATS Compatibility Score Chrome Extension - Architecture

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Chrome Browser                           │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                  Extension UI Layer                        │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │  │
│  │  │ Popup UI     │  │ Content      │  │ Options Page │    │  │
│  │  │ (React/Vue)  │  │ Script UI    │  │ (Settings)   │    │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘    │  │
│  └───────────────────────────────────────────────────────────┘  │
│                           ↕ Messages                             │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              Service Worker (Background)                   │  │
│  │  ┌────────────────────────────────────────────────────┐   │  │
│  │  │  Message Router & Orchestration                    │   │  │
│  │  └────────────────────────────────────────────────────┘   │  │
│  │  ┌──────────────────┐  ┌──────────────────┐            │  │
│  │  │ File Processor   │  │ Job Parser       │            │  │
│  │  │ (PDF/DOCX/Text)  │  │ (Portal Extract) │            │  │
│  │  └──────────────────┘  └──────────────────┘            │  │
│  │  ┌────────────────────────────────────────────────────┐   │  │
│  │  │  ATS Scoring Engine                                │   │  │
│  │  │  ┌────────────┐  ┌────────────┐  ┌────────────┐   │   │  │
│  │  │  │ Analyzer  │  │ Matcher    │  │ Scorer     │   │   │  │
│  │  │  └────────────┘  └────────────┘  └────────────┘   │   │  │
│  │  └────────────────────────────────────────────────────┘   │  │
│  └───────────────────────────────────────────────────────────┘  │
│                           ↕                                      │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              Content Scripts                               │  │
│  │  ┌──────────────────┐  ┌──────────────────┐            │  │
│  │  │ Job Portal       │  │ DOM Observer     │            │  │
│  │  │ Scrapers         │  │ (Auto-detect)    │            │  │
│  │  └──────────────────┘  └──────────────────┘            │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                    Browser APIs Used                             │
│  • File System Access API (file reading)                         │
│  • chrome.storage (ephemeral session storage)                    │
│  • chrome.runtime (messaging)                                    │
│  • chrome.scripting (content script injection)                   │
│  • chrome.tabs (tab management)                                  │
│  • chrome.action (popup management)                              │
└─────────────────────────────────────────────────────────────────┘
```

## 2. Component Breakdown

### 2.1 Extension UI Layer

**Popup UI** (`popup/`)
- Main user interface for file upload and job description input
- Displays real-time ATS score and breakdown
- Handles drag-and-drop and paste operations
- Shows explainable scoring breakdown

**Content Script UI** (`content/`)
- Floating widget injected into job portal pages
- Auto-extracts job descriptions from supported portals
- Quick "Analyze Resume" button overlay
- Minimal, non-intrusive design

**Options Page** (`options/`)
- User preferences and settings
- Portal enable/disable toggles
- Export/import scoring history (client-side only)
- Privacy settings confirmation

### 2.2 Service Worker (Background)

**Message Router**
- Central message hub for extension components
- Routes messages between UI, content scripts, and processing modules
- Manages request/response lifecycle

**File Processor**
- PDF parsing (client-side PDF.js library)
- DOCX parsing (mammoth.js or similar)
- Plain text processing
- Extracts structured data: sections, keywords, formatting metadata

**Job Parser**
- Receives job description from UI or content scripts
- Normalizes and structures job description data
- Extracts: required skills, qualifications, keywords, job title, company

**ATS Scoring Engine**
- **Analyzer**: Analyzes resume structure, formatting, keywords
- **Matcher**: Matches resume content against job description
- **Scorer**: Calculates weighted scores and generates explanations
- All processing happens in-memory, no persistence

### 2.3 Content Scripts

**Job Portal Scrapers** (`scrapers/`)
- Site-specific scrapers for major job portals (LinkedIn, Indeed, Glassdoor, etc.)
- DOM selectors and extraction logic per portal
- Normalizes extracted data to common schema

**DOM Observer**
- Watches for job description elements
- Triggers extraction when job posting is detected
- Injects floating UI widget when active

## 3. Data Flow

### 3.1 Resume Upload Flow

```
User Action (Popup UI)
    ↓
[File Selected/Dropped/Pasted]
    ↓
Message: { type: 'PROCESS_RESUME', payload: { file, format } }
    ↓
Service Worker → File Processor
    ↓
[Parse PDF/DOCX/Text]
    ↓
Structured Resume Data {
    sections: { contact, summary, experience, education, skills },
    keywords: [],
    formatting: { fonts, structure, metadata }
}
    ↓
Message: { type: 'RESUME_PROCESSED', payload: resumeData }
    ↓
Popup UI: Display parsed resume preview
```

### 3.2 Job Description Input Flow

**Scenario A: Manual Input**
```
User Input (Popup UI)
    ↓
[Text Pasted/Entered]
    ↓
Message: { type: 'PROCESS_JOB_DESC', payload: { text } }
    ↓
Service Worker → Job Parser
    ↓
Structured Job Data {
    title, company, requirements, skills, keywords, qualifications
}
    ↓
Message: { type: 'JOB_PROCESSED', payload: jobData }
    ↓
Popup UI: Display structured job info
```

**Scenario B: Auto-Extraction from Portal**
```
User Visits Job Portal
    ↓
Content Script: DOM Observer detects job posting
    ↓
Scraper extracts job description
    ↓
Message: { type: 'JOB_EXTRACTED', payload: { url, data } }
    ↓
Service Worker → Job Parser (normalize)
    ↓
Message: { type: 'JOB_PROCESSED', payload: jobData }
    ↓
Popup UI: Display extracted job + trigger analysis
```

### 3.3 Scoring Flow

```
Both Resume + Job Data Available
    ↓
Message: { type: 'CALCULATE_SCORE', payload: { resume, job } }
    ↓
Service Worker → ATS Scoring Engine
    ↓
[Analyzer Module]
  • Resume structure analysis
  • Keyword extraction and categorization
  • Formatting compliance check
    ↓
[Matcher Module]
  • Keyword matching (exact + semantic)
  • Skill matching
  • Qualification matching
  • Section relevance scoring
    ↓
[Scorer Module]
  • Weighted score calculation
  • Category breakdown generation
  • Explanation generation
    ↓
Score Result {
    overallScore: 0-100,
    breakdown: {
        keywords: { score, matched, missing },
        skills: { score, matched, missing },
        structure: { score, issues },
        formatting: { score, issues }
    },
    explanations: []
}
    ↓
Message: { type: 'SCORE_CALCULATED', payload: result }
    ↓
Popup UI: Display score + breakdown + explanations
```

### 3.4 Real-Time Updates

```
User Modifies Input (Resume or Job)
    ↓
Debounced Update (500ms)
    ↓
Recalculate Score
    ↓
Update UI (if visible)
```

## 4. Folder Structure

```
resume-ats-tracker/
├── manifest.json                 # Extension manifest (V3)
├── README.md
├── ARCHITECTURE.md
│
├── src/
│   ├── background/
│   │   ├── service-worker.js     # Main service worker entry
│   │   ├── message-router.js     # Message routing logic
│   │   └── orchestrator.js       # Orchestrates processing workflows
│   │
│   ├── processors/
│   │   ├── file-processor.js     # PDF/DOCX/Text parsing
│   │   ├── pdf-parser.js         # PDF-specific parsing
│   │   ├── docx-parser.js        # DOCX-specific parsing
│   │   ├── text-parser.js        # Plain text parsing
│   │   └── job-parser.js         # Job description normalization
│   │
│   ├── scoring/
│   │   ├── scoring-engine.js     # Main scoring orchestrator
│   │   ├── analyzer.js           # Resume analysis
│   │   ├── matcher.js            # Resume-job matching
│   │   ├── scorer.js             # Score calculation
│   │   ├── rules/
│   │   │   ├── keyword-rules.js  # Keyword matching rules
│   │   │   ├── skill-rules.js    # Skill matching rules
│   │   │   ├── structure-rules.js # Structure scoring rules
│   │   │   └── formatting-rules.js # Formatting rules
│   │   └── weights.js            # Scoring weights configuration
│   │
│   ├── popup/
│   │   ├── index.html
│   │   ├── popup.js              # Popup entry point
│   │   ├── components/
│   │   │   ├── file-upload.js
│   │   │   ├── job-input.js
│   │   │   ├── score-display.js
│   │   │   ├── breakdown-view.js
│   │   │   └── explanation-panel.js
│   │   └── styles/
│   │       └── popup.css
│   │
│   ├── content/
│   │   ├── content-script.js     # Main content script
│   │   ├── dom-observer.js       # Job posting detection
│   │   ├── floating-widget.js    # Injected UI widget
│   │   └── scrapers/
│   │       ├── base-scraper.js   # Base scraper class
│   │       ├── linkedin.js
│   │       ├── indeed.js
│   │       ├── glassdoor.js
│   │       └── generic.js        # Fallback generic scraper
│   │
│   ├── options/
│   │   ├── index.html
│   │   ├── options.js
│   │   └── styles/
│   │       └── options.css
│   │
│   ├── shared/
│   │   ├── messaging.js          # Message protocol definitions
│   │   ├── schemas.js            # Data schemas (resume, job, score)
│   │   ├── utils.js              # Shared utilities
│   │   └── constants.js          # Constants and configurations
│   │
│   └── lib/
│       ├── pdf.js                # PDF.js library (if bundled)
│       └── mammoth.js            # DOCX parser library
│
├── assets/
│   ├── icons/
│   │   ├── icon16.png
│   │   ├── icon48.png
│   │   └── icon128.png
│   └── images/
│
├── tests/
│   ├── unit/
│   │   ├── scoring/
│   │   ├── processors/
│   │   └── scrapers/
│   └── integration/
│
├── .gitignore
└── package.json                  # Build tooling, dependencies
```

## 5. Key Technical Decisions & Tradeoffs

### 5.1 Manifest V3 Considerations

**Decision**: Use Service Worker instead of background page
- **Rationale**: V3 requirement, more efficient resource usage
- **Tradeoff**: Service workers are event-driven and stateless, requiring careful state management
- **Mitigation**: Use in-memory state during active session, rely on message passing

**Decision**: Use `chrome.scripting.executeScript` for dynamic content script injection
- **Rationale**: Required for on-demand injection into job portals
- **Tradeoff**: Requires `activeTab` or host permissions
- **Mitigation**: Request permissions contextually, explain to users

### 5.2 File Processing

**Decision**: Client-side PDF/DOCX parsing using libraries (PDF.js, mammoth.js)
- **Rationale**: Privacy-first (no server uploads), works offline
- **Tradeoff**: Larger bundle size, potential parsing limitations
- **Mitigation**: Code splitting, lazy loading, fallback to text extraction

**Decision**: Support multiple input formats (PDF, DOCX, text)
- **Rationale**: User convenience, covers 95% of use cases
- **Tradeoff**: More complex parsing logic
- **Mitigation**: Unified parsing interface, graceful degradation

### 5.3 Job Description Extraction

**Decision**: Portal-specific scrapers with DOM selectors
- **Rationale**: Reliable extraction from structured pages
- **Tradeoff**: Requires maintenance as portals change, limited to known portals
- **Mitigation**: Generic fallback scraper, community-contributed scrapers, versioned selectors

**Decision**: Real-time DOM observation for auto-extraction
- **Rationale**: Seamless user experience
- **Tradeoff**: Performance overhead, potential conflicts with site JS
- **Mitigation**: Debounced observers, minimal DOM queries, scoped selectors

### 5.4 Scoring Engine Design

**Decision**: Modular, rule-based scoring system (no ML/black-box)
- **Rationale**: Explainable scores, transparent logic, no training data needed
- **Tradeoff**: Less "intelligent" than ML approaches, requires manual rule tuning
- **Mitigation**: Extensible rule system, user feedback loop, A/B testing framework

**Decision**: Weighted category scoring (keywords, skills, structure, formatting)
- **Rationale**: Balanced evaluation, customizable weights
- **Tradeoff**: Weight calibration requires domain expertise
- **Mitigation**: Default weights based on ATS research, user-customizable weights

**Decision**: In-memory processing only (no storage)
- **Rationale**: Privacy-first, no data persistence
- **Tradeoff**: No history, no offline analysis of past scores
- **Mitigation**: Optional client-side export (user-controlled), session-only memory

### 5.5 Real-Time Updates

**Decision**: Debounced recalculation (500ms delay)
- **Rationale**: Balance between responsiveness and performance
- **Tradeoff**: Slight delay in score updates
- **Mitigation**: Immediate feedback for UI actions, debounce only for text input

### 5.6 Communication Architecture

**Decision**: Message-based architecture (chrome.runtime.sendMessage)
- **Rationale**: Standard V3 pattern, decoupled components
- **Tradeoff**: Async complexity, potential message loss
- **Mitigation**: Request-response pattern with timeouts, error handling

### 5.7 UI Framework Choice

**Decision**: Vanilla JS with optional lightweight framework (Preact/Vue)
- **Rationale**: Smaller bundle, faster load times, easier debugging
- **Tradeoff**: More manual DOM management if vanilla
- **Mitigation**: Use framework only if complexity justifies it, consider build step

### 5.8 Privacy & Security

**Decision**: No network requests (except for library CDN if needed)
- **Rationale**: Complete privacy, no data exfiltration risk
- **Tradeoff**: Limited to client-side capabilities
- **Mitigation**: Acceptable tradeoff for privacy-first design

**Decision**: Ephemeral chrome.storage.session for temporary state
- **Rationale**: Cleared on browser restart, no persistent tracking
- **Tradeoff**: No cross-session persistence
- **Mitigation**: Acceptable for privacy-first design

## 6. Scoring Strategy Overview

### 6.1 Score Components (Weighted Categories)

1. **Keyword Matching** (40% weight)
   - Exact keyword matches between job description and resume
   - Categorized: technical terms, industry terms, soft skills
   - Frequency weighting (mentioned multiple times = higher relevance)

2. **Skills Alignment** (30% weight)
   - Required vs. listed skills comparison
   - Skill category matching (technical, tools, languages)
   - Experience level indicators

3. **Resume Structure** (20% weight)
   - Section presence (contact, summary, experience, education, skills)
   - Section order and hierarchy
   - Information completeness

4. **Formatting Compliance** (10% weight)
   - ATS-friendly formatting checks (standard fonts, simple layouts)
   - File format considerations
   - Parsing quality indicators

### 6.2 Scoring Algorithm (Conceptual)

```
For each category:
  1. Calculate raw score (0-100) based on matches/compliance
  2. Apply category weight
  3. Sum weighted scores

Overall Score = Σ(category_score × category_weight)

Example:
  Keywords: 75/100 × 0.40 = 30.0
  Skills: 80/100 × 0.30 = 24.0
  Structure: 90/100 × 0.20 = 18.0
  Formatting: 85/100 × 0.10 = 8.5
  ─────────────────────────────────
  Overall: 80.5/100
```

### 6.3 Explainability

**For Each Category:**
- List matched items (what worked)
- List missing/weak items (what to improve)
- Provide specific, actionable recommendations

**Overall Explanation:**
- Summary of strengths
- Top 3 improvement areas
- Specific examples from the resume

**Example Output:**
```
Overall Score: 72/100

✓ Keywords (75/100): Strong match on "JavaScript", "React", "Node.js"
  Missing: "TypeScript", "GraphQL"

✓ Skills (80/100): All required technical skills present
  Missing: "Docker" (listed as preferred)

✓ Structure (85/100): Well-organized sections
  Consider: Adding a summary section

✓ Formatting (60/100): Some complex formatting detected
  Issue: Custom fonts may not parse correctly
  Recommendation: Use standard fonts (Arial, Calibri)
```

### 6.4 Scoring Rules Philosophy

- **Transparent**: All rules are explicit and inspectable
- **Configurable**: Weights can be adjusted (advanced users)
- **Educational**: Explanations help users understand ATS requirements
- **Fair**: No bias toward specific formats, focuses on content quality

## 7. Extension Permissions

### Required Permissions
- `activeTab`: For content script injection into job portals
- `storage`: For ephemeral session storage (chrome.storage.session)
- `scripting`: For dynamic content script injection

### Optional Permissions
- Host permissions for specific job portals (requested contextually)

## 8. Future Considerations

- **Extensibility**: Plugin system for custom scoring rules
- **Localization**: Multi-language support for job descriptions
- **Export**: Client-side export of score reports (PDF/JSON)
- **Comparison**: Compare multiple resume versions
- **A/B Testing**: Test different resume formats
- **Offline Mode**: Service worker caching for libraries
- **Accessibility**: WCAG 2.1 AA compliance

