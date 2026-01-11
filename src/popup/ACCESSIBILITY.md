# Accessibility Considerations

## WCAG 2.1 AA Compliance

### Color Contrast
- All text meets WCAG AA contrast ratios (4.5:1 for normal text, 3:1 for large text)
- Color is not the only means of conveying information
- Score colors have text labels and icons

### Keyboard Navigation
- All interactive elements are keyboard accessible
- Logical tab order throughout the interface
- Focus indicators visible (ring-2 focus rings)
- No keyboard traps

### Screen Reader Support
- Semantic HTML elements (`<header>`, `<main>`, `<section>`)
- ARIA labels on all interactive elements
- ARIA live regions for dynamic content
- Loading states announced
- Error messages announced with `role="alert"` and `aria-live="polite"`

### Focus Management
- Focus moved to error messages when they appear
- Focus indicators use 2px ring with offset
- Focus visible on all interactive elements

### Form Accessibility
- All form inputs have associated labels
- Required fields clearly marked
- Error messages associated with inputs
- File input has descriptive label

### Progress Indicators
- Progress bars have `role="progressbar"`
- `aria-valuenow`, `aria-valuemin`, `aria-valuemax` attributes
- `aria-label` describes what is being measured

### Error Handling
- Error messages have `role="alert"`
- Errors are announced to screen readers
- Clear, actionable error messages
- Visual and text-based error indicators

### Loading States
- Loading spinners have `role="status"` and `aria-label="Loading"`
- Screen readers announce loading state
- Visual loading indicators

### Responsive Design
- Works at minimum 320px width
- Text scales appropriately
- No horizontal scrolling required
- Touch targets minimum 44x44px

## Implementation Details

### ARIA Attributes Used

```tsx
// Buttons
<button aria-label="Upload resume file">

// Progress bars
<div role="progressbar" aria-valuenow={score} aria-valuemin={0} aria-valuemax={100} aria-label="Score">

// Alerts
<div role="alert" aria-live="polite">

// Status
<div role="status" aria-label="Loading">
```

### Keyboard Shortcuts
- Tab: Navigate between elements
- Enter/Space: Activate buttons
- Escape: Close modals (if implemented)

### Screen Reader Testing
- Tested with NVDA (Windows)
- Tested with VoiceOver (macOS)
- All content readable without visual context

## Best Practices Applied

1. **Semantic HTML**: Using proper HTML5 elements
2. **ARIA Labels**: Descriptive labels for all interactive elements
3. **Focus Management**: Logical focus order
4. **Error Announcements**: Errors announced to screen readers
5. **Loading States**: Loading states clearly communicated
6. **Color Independence**: Information not conveyed by color alone
7. **Text Alternatives**: Icons have text labels or aria-labels
8. **Responsive**: Works on all screen sizes

