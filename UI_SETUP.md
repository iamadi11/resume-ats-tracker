# React + TypeScript UI Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Build Extension

```bash
npm run build
```

### 3. Load in Chrome

1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `dist` folder (created after build)

## Project Structure

```
src/
├── popup/                    # Popup UI (React + TypeScript)
│   ├── main.tsx             # Entry point
│   ├── App.tsx              # Root component
│   ├── types.ts             # TypeScript definitions
│   ├── index.css            # Tailwind CSS
│   ├── context/
│   │   └── AppContext.tsx   # State management
│   └── components/
│       ├── PopupView.tsx
│       ├── ResumeUpload.tsx
│       ├── JobDescriptionInput.tsx
│       ├── ScoreMeter.tsx
│       ├── ErrorMessage.tsx
│       ├── LoadingSpinner.tsx
│       └── ViewDetailsButton.tsx
│
└── sidepanel/               # Side Panel UI (React + TypeScript)
    ├── main.tsx            # Entry point
    ├── SidePanelApp.tsx     # Root component
    └── components/
        ├── DetailedBreakdown.tsx
        └── FeedbackList.tsx
```

## Component Hierarchy

### Popup UI

```
App
└── AppProvider
    └── PopupView
        ├── ResumeUpload (drag & drop)
        ├── JobDescriptionInput (textarea + extract)
        └── ScoreMeter (circular progress + breakdown)
```

### Side Panel UI

```
SidePanelApp
├── DetailedBreakdown (score + categories)
└── FeedbackList (grouped by severity)
```

## State Management

**Context API** with `useReducer`:
- Global state in `AppContext`
- Actions: `uploadResume`, `setJobDescription`, `calculateScore`
- Auto-calculation when both resume and JD available
- Real-time updates to side panel

## Features

### Popup UI
- ✅ Resume upload (drag & drop or file picker)
- ✅ Job description input (paste or extract from page)
- ✅ Real-time ATS score meter (circular progress)
- ✅ Category breakdown (5 categories)
- ✅ View details button (opens side panel)

### Side Panel UI
- ✅ Detailed score breakdown
- ✅ Category-by-category analysis
- ✅ Feedback grouped by severity
- ✅ Actionable suggestions
- ✅ Keyword highlights

## Styling

**Tailwind CSS** with custom design system:
- Primary colors (blue)
- Success colors (green)
- Warning colors (yellow/orange)
- Error colors (red)
- Responsive design
- Clean, recruiter-friendly UI

## Accessibility

- ✅ WCAG 2.1 AA compliant
- ✅ ARIA labels on all interactive elements
- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ Focus management
- ✅ Error announcements

## Real-time Updates

1. **Auto-calculation**: Score calculated when resume + JD available
2. **Debounced input**: Job description updates debounced
3. **Side panel sync**: Updates sent via Chrome messages
4. **Loading states**: Visual feedback during processing

## Development

### Watch Mode

```bash
npm run dev
```

### Type Checking

```bash
npm run type-check
```

### Production Build

```bash
npm run build
```

Output goes to `dist/` directory.

## Integration

The UI integrates with:
- Background service worker (file processing, scoring)
- Content scripts (job extraction)
- Shared messaging system
- Scoring engine
- Feedback engine

## Next Steps

1. **Add Icons**: Create icon files in `assets/icons/`
2. **Test Build**: Run `npm run build` and load in Chrome
3. **Connect Backend**: Ensure service worker handles messages
4. **Test Flow**: Upload resume → Add JD → View score → Open side panel

## Troubleshooting

### Build Errors
- Check Node.js version (18+ recommended)
- Run `npm install` to ensure dependencies are installed
- Check TypeScript errors with `npm run type-check`

### Extension Won't Load
- Ensure `dist/` folder exists after build
- Check `manifest.json` paths are correct
- Verify all referenced files exist

### UI Not Updating
- Check browser console for errors
- Verify service worker is running
- Check message passing in DevTools

## Documentation

- [UI_README.md](./src/popup/UI_README.md) - Complete UI documentation
- [COMPONENT_HIERARCHY.md](./src/popup/components/COMPONENT_HIERARCHY.md) - Component structure
- [ACCESSIBILITY.md](./src/popup/ACCESSIBILITY.md) - Accessibility details

