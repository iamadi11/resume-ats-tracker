# Component Hierarchy

## Popup UI Structure

```
App
└── AppProvider (Context)
    └── PopupView
        ├── Header
        ├── ErrorMessage (conditional)
        ├── LoadingSpinner (conditional)
        ├── ResumeUpload
        │   └── FileInput (hidden)
        ├── JobDescriptionInput
        │   └── Textarea
        └── ScoreMeter (conditional)
            └── ScoreBreakdownItem (×5)
```

## Side Panel Structure

```
SidePanelApp
├── Header
├── DetailedBreakdown
│   ├── OverallScoreCard
│   └── CategoryBreakdown (×5)
│       └── DetailsSection
└── FeedbackList
    ├── FeedbackSummary
    └── FeedbackSection (×3)
        └── FeedbackItem
            └── KeywordsList (conditional)
```

## Component Responsibilities

### Popup Components

**PopupView**
- Main container for popup
- Orchestrates component layout
- Handles conditional rendering

**ResumeUpload**
- File drag & drop
- File selection
- Upload status display
- File validation

**JobDescriptionInput**
- Text input/textarea
- Paste detection
- Extract from page button
- Character count

**ScoreMeter**
- Circular progress indicator
- Score display
- Breakdown visualization
- Category scores

### Side Panel Components

**SidePanelApp**
- Main container
- State management from popup
- Message listener setup

**DetailedBreakdown**
- Overall score display
- Category breakdowns
- Recommendations list

**FeedbackList**
- Feedback summary
- Grouped by severity
- Individual feedback items

## State Management

### Context API
- `AppContext`: Global state management
- `useApp`: Hook for accessing state and actions

### State Flow
1. User uploads resume → `uploadResume()` → Background processing → State update
2. User inputs JD → `setJobDescription()` → State update
3. Both available → Auto-calculate score → `calculateScore()` → State update
4. Score calculated → Generate feedback → State update
5. State changes → UI updates → Side panel receives updates via messages

## Real-time Updates

1. **Popup → Side Panel**: Chrome runtime messages
2. **Auto-calculation**: useEffect hook triggers when resume + JD available
3. **Debounced input**: Job description updates debounced to avoid excessive calculations

## Accessibility Features

### ARIA Labels
- All interactive elements have `aria-label`
- Progress bars have `role="progressbar"` with `aria-valuenow`
- Error messages have `role="alert"` and `aria-live="polite"`

### Keyboard Navigation
- All buttons keyboard accessible
- Tab order logical
- Focus indicators visible

### Screen Reader Support
- Semantic HTML
- Loading states announced
- Error messages announced
- Score changes announced

### Color Contrast
- WCAG AA compliant colors
- Not relying solely on color for information
- Icons have text labels

