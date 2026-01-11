# React + TypeScript UI Documentation

## Overview

Complete React + TypeScript UI for the Chrome Extension with popup and side panel interfaces.

## Component Hierarchy

### Popup UI

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
        ├── ScoreMeter (conditional)
        │   └── ScoreBreakdownItem (×5)
        └── ViewDetailsButton (conditional)
```

### Side Panel UI

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

## State Management Strategy

### Context API Pattern

**AppContext** (`context/AppContext.tsx`):
- Global state management using React Context
- useReducer for state updates
- Custom hook `useApp()` for easy access

**State Structure:**
```typescript
{
  resume: Resume | null,
  jobDescription: JobDescription | null,
  score: ATSResult | null,
  feedback: Feedback | null,
  loading: boolean,
  error: string | null
}
```

**Actions:**
- `uploadResume(file)` - Process resume file
- `setJobDescription(text)` - Set job description
- `calculateScore()` - Calculate ATS score
- `clearData()` - Reset all data

### Real-time Updates

1. **Auto-calculation**: useEffect triggers when both resume and JD are available
2. **Debounced input**: Job description updates are debounced
3. **Side panel sync**: Messages sent to side panel when score/feedback updates
4. **Loading states**: Visual feedback during processing

## UI Components

### Popup Components

**ResumeUpload**
- Drag & drop file upload
- File validation (type, size)
- Upload status display
- File format indicator

**JobDescriptionInput**
- Textarea for manual input
- Paste detection with auto-processing
- "Extract from page" button
- Character count display

**ScoreMeter**
- Circular progress indicator (0-100)
- Color-coded score (green/yellow/red)
- Category breakdown bars
- Detailed metrics per category

**ViewDetailsButton**
- Opens side panel
- Only shown when score is available

### Side Panel Components

**DetailedBreakdown**
- Overall score card
- Category-by-category breakdown
- Weighted score contributions
- Recommendations list

**FeedbackList**
- Grouped by severity (critical/warning/improvement)
- Individual feedback items
- Actionable suggestions
- Keyword highlights

## Styling

### Tailwind CSS

**Configuration:**
- Custom color palette (primary, success, warning, error)
- Responsive design
- Dark mode ready (can be extended)

**Utility Classes:**
- `btn-primary` - Primary button style
- `btn-secondary` - Secondary button style
- `input-field` - Form input style
- `card` - Card container style

### Design System

**Colors:**
- Primary: Blue tones (for main actions)
- Success: Green (for good scores)
- Warning: Yellow/Orange (for medium scores)
- Error: Red (for low scores)

**Typography:**
- Headings: Bold, larger sizes
- Body: Regular weight, readable sizes
- Labels: Medium weight, smaller sizes

**Spacing:**
- Consistent spacing scale (4px base)
- Card padding: 16px
- Section spacing: 24px

## Accessibility

### WCAG 2.1 AA Compliance

1. **ARIA Labels**: All interactive elements labeled
2. **Keyboard Navigation**: Full keyboard support
3. **Screen Readers**: Semantic HTML + ARIA
4. **Color Contrast**: Meets AA standards
5. **Focus Management**: Visible focus indicators
6. **Error Handling**: Announced to screen readers

See [ACCESSIBILITY.md](./ACCESSIBILITY.md) for detailed documentation.

## Build Setup

### Prerequisites

```bash
npm install
```

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

### Type Checking

```bash
npm run type-check
```

## Integration with Extension

### Message Passing

**Popup → Background:**
- Resume processing
- Job description processing
- Score calculation
- Feedback generation

**Popup → Side Panel:**
- Score updates
- Feedback updates
- State synchronization

**Content Script → Background:**
- Job extraction
- Page analysis

### File Structure

```
src/
├── popup/
│   ├── main.tsx              # Entry point
│   ├── App.tsx                # Root component
│   ├── index.html             # HTML template
│   ├── index.css              # Tailwind imports
│   ├── types.ts               # TypeScript types
│   ├── context/
│   │   └── AppContext.tsx     # State management
│   └── components/
│       ├── PopupView.tsx
│       ├── ResumeUpload.tsx
│       ├── JobDescriptionInput.tsx
│       ├── ScoreMeter.tsx
│       ├── ErrorMessage.tsx
│       ├── LoadingSpinner.tsx
│       └── ViewDetailsButton.tsx
└── sidepanel/
    ├── main.tsx               # Entry point
    ├── SidePanelApp.tsx       # Root component
    ├── index.html              # HTML template
    └── components/
        ├── DetailedBreakdown.tsx
        └── FeedbackList.tsx
```

## Usage Examples

### Basic Usage

```tsx
import { useApp } from './context/AppContext';

function MyComponent() {
  const { state, uploadResume, setJobDescription } = useApp();
  
  return (
    <div>
      {state.loading && <LoadingSpinner />}
      {state.score && <ScoreDisplay score={state.score} />}
    </div>
  );
}
```

### Custom Hook

```tsx
function useScore() {
  const { state, calculateScore } = useApp();
  
  useEffect(() => {
    if (state.resume && state.jobDescription) {
      calculateScore();
    }
  }, [state.resume, state.jobDescription]);
  
  return state.score;
}
```

## Real-time Updates

### Auto-calculation

When both resume and job description are available, score is automatically calculated:

```tsx
useEffect(() => {
  if (state.resume && state.jobDescription && !state.score && !state.loading) {
    calculateScore();
  }
}, [state.resume, state.jobDescription, state.score, state.loading, calculateScore]);
```

### Side Panel Sync

Score updates are sent to side panel via Chrome runtime messages:

```tsx
chrome.runtime.sendMessage({
  type: 'SCORE_UPDATE',
  payload: { score, feedback }
});
```

## Performance Considerations

1. **Debouncing**: Job description input debounced
2. **Memoization**: Expensive calculations memoized
3. **Lazy Loading**: Components loaded on demand
4. **Optimistic Updates**: UI updates immediately, syncs in background

## Browser Compatibility

- Chrome 88+ (Manifest V3 support)
- Edge 88+ (Chromium-based)
- Other Chromium browsers with Manifest V3 support

## Future Enhancements

1. **Dark Mode**: Theme switching
2. **Export**: PDF/JSON export of results
3. **History**: Previous analyses
4. **Comparisons**: Compare multiple resume versions
5. **Templates**: Resume templates and examples

