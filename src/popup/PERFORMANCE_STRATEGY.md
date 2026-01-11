# Real-time Score Update Strategy

## Overview

The extension implements real-time ATS score updates with debouncing and Web Worker execution to ensure smooth UI updates without blocking.

## Update Strategy

### 1. Debounced Calculation

**Debounce Delay: 500ms**
- Prevents excessive calculations while user is typing
- Balances responsiveness with performance
- Configurable per use case

**Implementation:**
```typescript
useEffect(() => {
  const timeout = setTimeout(() => {
    calculateScore();
  }, debounceDelay);
  
  return () => clearTimeout(timeout);
}, [inputs, debounceDelay]);
```

### 2. Input Change Detection

**Hash-based Change Detection:**
- Creates hash from text length and content
- Only recalculates if hash changes
- Prevents unnecessary calculations for identical inputs

**Implementation:**
```typescript
const inputHash = `${resumeText.length}-${jobText.length}-${resumeText.substring(0, 100)}`;
if (inputHash === lastHash) return; // Skip calculation
```

### 3. Abort Previous Calculations

**Request Cancellation:**
- Aborts previous calculations when new input arrives
- Prevents race conditions
- Saves computational resources

**Implementation:**
```typescript
if (abortControllerRef.current) {
  abortControllerRef.current.abort();
}
abortControllerRef.current = new AbortController();
```

### 4. Minimum Text Length

**Threshold: 50 characters**
- Skips calculation for very short inputs
- Prevents unnecessary work
- Configurable threshold

## Web Worker Implementation

### Worker Architecture

**Main Thread:**
- UI rendering
- User interactions
- State management
- Message passing

**Worker Thread:**
- Score calculations
- Keyword extraction
- TF-IDF computation
- Heavy computations

### Worker Communication

**Message Protocol:**
```typescript
// Request
{
  type: 'CALCULATE_SCORE',
  id: 'unique-request-id',
  payload: { resumeText, jobText, resume }
}

// Response
{
  type: 'SCORE_CALCULATED',
  id: 'unique-request-id',
  payload: { overallScore, breakdown, ... },
  performance: { duration, timestamp }
}
```

### Worker Lifecycle

1. **Initialization**: Worker created on first use
2. **Message Handling**: Processes calculation requests
3. **Result Caching**: Caches recent results
4. **Cleanup**: Terminated when no longer needed

## Performance Optimizations

### 1. Result Caching

**Cache Strategy:**
- Cache key: Text length + content hash
- Cache size: Limited to 10 entries
- Cache hit rate: Tracked for monitoring

**Benefits:**
- Instant results for repeated inputs
- Reduced computation
- Better user experience

### 2. Parallel Calculations

**Independent Calculations:**
- Keyword matching
- Skills alignment
- Formatting check
- Impact detection
- Readability check

**Implementation:**
- All calculations run in worker (already parallel)
- No blocking of main thread
- Smooth UI updates

### 3. Incremental Updates

**Progressive Enhancement:**
- Show partial results if available
- Update UI as calculations complete
- Final score when all complete

### 4. Memory Management

**Cache Limits:**
- Maximum cache size: 10 entries
- LRU eviction when full
- Memory monitoring

## Benchmarks

### Expected Performance

**Small Resume (< 1000 words):**
- Calculation time: 50-150ms
- UI update: < 16ms (60fps)
- Total perceived delay: < 200ms

**Medium Resume (1000-3000 words):**
- Calculation time: 150-400ms
- UI update: < 16ms
- Total perceived delay: < 500ms

**Large Resume (> 3000 words):**
- Calculation time: 400-1000ms
- UI update: < 16ms
- Total perceived delay: < 1200ms

### Optimization Targets

- **Target**: < 500ms for 95% of calculations
- **Cache Hit Rate**: > 30% for typical usage
- **UI Frame Rate**: Maintain 60fps
- **Memory Usage**: < 50MB for worker

## Monitoring

### Performance Metrics

**Tracked Metrics:**
- Calculation duration
- Cache hit rate
- Average calculation time
- Min/Max calculation times
- Total calculations

**Access:**
```typescript
const metrics = await workerManager.sendMessage('GET_PERFORMANCE');
console.log(metrics);
```

### UI Indicators

**Visual Feedback:**
- Loading spinner during calculation
- Performance indicator (duration)
- Smooth score transitions
- No UI freezing

## Best Practices

### 1. Avoid Premature Optimization

- Start with simple debouncing
- Add worker only if needed
- Profile before optimizing
- Measure actual performance

### 2. Progressive Enhancement

- Works without worker (fallback)
- Graceful degradation
- Error handling
- User feedback

### 3. User Experience First

- Smooth animations
- Loading states
- Error messages
- Performance indicators

## Implementation Details

### Debounce Configuration

**Default Settings:**
- Delay: 500ms
- Min text length: 50 characters
- Enabled: true

**Tuning:**
- Faster typing: Increase delay
- Slower typing: Decrease delay
- Long documents: Increase delay

### Worker Configuration

**Worker Options:**
- Type: 'module' (ES modules)
- Scope: Dedicated worker
- Lifecycle: Singleton pattern

### Error Handling

**Error Scenarios:**
- Worker unavailable: Fallback to main thread
- Calculation timeout: Show error, retry option
- Worker error: Restart worker, notify user

## Future Optimizations

1. **Incremental Scoring**: Calculate categories incrementally
2. **WebAssembly**: Use WASM for heavy computations
3. **Shared Workers**: Share worker across tabs
4. **Service Worker Caching**: Cache results across sessions
5. **Predictive Pre-calculation**: Pre-calculate likely inputs

