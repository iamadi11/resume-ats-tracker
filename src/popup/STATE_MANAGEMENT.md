# State Management Strategy

## Overview

The extension uses **React Context API** with **useReducer** for state management. This provides:
- Centralized state
- Predictable updates
- Easy debugging
- Type safety with TypeScript

## Architecture

### Context Provider

**AppContext** (`context/AppContext.tsx`):
- Provides global state to all components
- Exposes actions via `useApp()` hook
- Handles async operations (file upload, scoring)
- Manages side panel communication

### State Structure

```typescript
interface AppState {
  resume: Resume | null;
  jobDescription: JobDescription | null;
  score: ATSResult | null;
  feedback: Feedback | null;
  loading: boolean;
  error: string | null;
}
```

### Actions

**Synchronous Actions:**
- `SET_RESUME` - Set parsed resume
- `SET_JOB_DESCRIPTION` - Set job description
- `SET_SCORE` - Set calculated score
- `SET_FEEDBACK` - Set feedback suggestions
- `SET_LOADING` - Set loading state
- `SET_ERROR` - Set error message
- `CLEAR_DATA` - Reset all state

**Async Actions (via functions):**
- `uploadResume(file)` - Process resume file
- `setJobDescription(text)` - Process job description
- `calculateScore()` - Calculate ATS score
- `clearData()` - Reset state

## State Flow

### 1. Resume Upload Flow

```
User selects file
  ↓
uploadResume(file)
  ↓
SET_LOADING(true)
  ↓
Send to background: PROCESS_RESUME
  ↓
Background processes file
  ↓
Receive: RESUME_PROCESSED
  ↓
SET_RESUME(resume)
SET_LOADING(false)
```

### 2. Job Description Flow

```
User pastes/enters text
  ↓
setJobDescription(text)
  ↓
SET_JOB_DESCRIPTION(jobDesc)
  ↓
Send to background: PROCESS_JOB_DESC
  ↓
Auto-trigger score calculation (if resume available)
```

### 3. Score Calculation Flow

```
Both resume + JD available
  ↓
useEffect triggers calculateScore()
  ↓
SET_LOADING(true)
  ↓
Send to background: CALCULATE_SCORE
  ↓
Background calculates score
  ↓
Receive: SCORE_CALCULATED
  ↓
SET_SCORE(score)
  ↓
Request feedback: GET_FEEDBACK
  ↓
Receive: FEEDBACK_GENERATED
  ↓
SET_FEEDBACK(feedback)
  ↓
Send to side panel: SCORE_UPDATE
  ↓
SET_LOADING(false)
```

## Real-time Updates

### Auto-calculation

Score is automatically calculated when both resume and job description are available:

```typescript
useEffect(() => {
  if (state.resume && state.jobDescription && !state.score && !state.loading) {
    calculateScore();
  }
}, [state.resume, state.jobDescription, state.score, state.loading, calculateScore]);
```

### Side Panel Sync

When score is calculated, it's sent to side panel:

```typescript
chrome.runtime.sendMessage({
  type: 'SCORE_UPDATE',
  payload: { score, feedback }
});
```

Side panel listens for updates:

```typescript
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'SCORE_UPDATE') {
    setState({
      score: message.payload.score,
      feedback: message.payload.feedback
    });
  }
});
```

## Debouncing

Job description input is debounced to avoid excessive calculations:

```typescript
const handleBlur = () => {
  if (text.trim().length > 50 && text !== state.jobDescription?.text) {
    setJobDescription(text);
  }
};
```

## Error Handling

Errors are captured and displayed:

```typescript
try {
  // Operation
} catch (error) {
  dispatch({ type: 'SET_ERROR', payload: error.message });
} finally {
  dispatch({ type: 'SET_LOADING', payload: false });
}
```

## Performance Considerations

1. **Memoization**: useCallback for action functions
2. **Conditional Updates**: Only update when necessary
3. **Debouncing**: Input debounced to reduce calculations
4. **Lazy Loading**: Components loaded on demand

## Usage Example

```typescript
import { useApp } from './context/AppContext';

function MyComponent() {
  const { state, uploadResume, setJobDescription, calculateScore } = useApp();
  
  return (
    <div>
      {state.loading && <LoadingSpinner />}
      {state.error && <ErrorMessage message={state.error} />}
      {state.score && <ScoreDisplay score={state.score} />}
    </div>
  );
}
```

## Benefits

1. **Type Safety**: TypeScript ensures type correctness
2. **Predictable**: Reducer pattern makes state changes predictable
3. **Testable**: Easy to test state transitions
4. **Scalable**: Easy to add new state/actions
5. **Debugging**: Redux DevTools compatible (can be added)

