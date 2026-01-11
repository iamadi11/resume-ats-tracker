# Job Description Scrapers

Portal-specific scrapers for extracting job descriptions from common job portals.

## Supported Portals

1. **LinkedIn** - `linkedin.js`
2. **Indeed** - `indeed.js`
3. **Naukri** - `naukri.js`
4. **Greenhouse** - `greenhouse.js`
5. **Lever** - `lever.js`
6. **Generic Fallback** - `generic.js` (for unsupported portals)

## Architecture

### Base Scraper (`base-scraper.js`)

Common utilities used by all scrapers:
- **Text cleaning**: Removes HTML, normalizes whitespace, filters noise
- **DOM utilities**: Selector fallback functions, text extraction
- **Validation**: Job description validation heuristics
- **Result structures**: Success/error result factories

### Portal-Specific Scrapers

Each scraper implements:
- **Detection function**: `is<Portal>JobPage()` - Checks if current page is a job posting
- **Extraction function**: `extract<Portal>Job()` - Extracts job description and metadata

### Scraper Registry (`index.js`)

- Routes extraction requests to appropriate scraper
- Falls back to generic scraper if no portal-specific scraper matches
- Provides portal detection utilities

## Usage

```javascript
import { extractJobFromPage } from './scrapers/index.js';

// Extract job description from current page
const result = extractJobFromPage();

if (result.success) {
  console.log('Title:', result.title);
  console.log('Company:', result.company);
  console.log('Description:', result.text);
} else {
  console.error('Extraction failed:', result.error);
}
```

## Result Structure

```javascript
{
  success: true,
  text: "...",           // Cleaned job description text
  title: "...",          // Job title
  company: "...",        // Company name
  location: "...",       // Job location
  url: "...",           // Page URL
  portal: "linkedin",   // Portal identifier
  extractedAt: 1234567890, // Timestamp
  error: undefined      // Error message if failed
}
```

## Selector Strategies

See [SCRAPER_STRATEGY.md](./SCRAPER_STRATEGY.md) for detailed explanation of selector strategies for each portal.

### Key Principles

1. **Tiered Fallback**: Try most specific selectors first, then generic
2. **Multiple Selectors**: Each portal has 5-10 selector options
3. **Validation**: Ensure extracted content is actually a job description
4. **Text Cleaning**: Remove UI noise, normalize formatting
5. **Error Handling**: Graceful degradation with informative errors

## Features

### Text Cleaning
- Removes HTML entities and tags
- Normalizes whitespace (spaces, tabs, newlines)
- Filters noise (share buttons, cookie notices, copyrights)
- Removes zero-width characters

### Validation
- Minimum text length (100+ characters)
- Job-related keyword detection
- Noise pattern filtering
- Structure validation

### Metadata Extraction
- Job title (from `h1` or title-specific selectors)
- Company name (from company-specific elements)
- Location (from location-specific elements)

### Fallback Strategy
- Portal-specific scrapers → Generic scraper
- Multiple selector attempts per portal
- Heuristic-based extraction for unsupported portals

## Edge Cases Handled

1. **Dynamic Content**: Content loaded via JavaScript
2. **Expandable Content**: "Show more" buttons (limited support)
3. **A/B Testing**: Multiple layout variants
4. **International Variants**: Different structures for country-specific sites
5. **Custom Installations**: Greenhouse/Lever on company domains
6. **Job Listings vs. Details**: Validation prevents extraction from listing pages

## Limitations

1. **Selector Maintenance**: Portals change structures; selectors need updates
2. **Expandable Content**: Cannot reliably trigger React state changes
3. **Performance**: Multiple selector attempts can be slow
4. **Accuracy vs. Coverage**: Tradeoff between specific and generic scrapers
5. **No Authentication**: Cannot access content behind login

## Adding New Portals

1. Create new scraper file (e.g., `glassdoor.js`)
2. Implement `extract<Portal>Job()` function
3. Implement `is<Portal>JobPage()` detection function
4. Add to registry in `index.js`
5. Update documentation

Example:

```javascript
// glassdoor.js
export function extractGlassdoorJob() {
  // Implementation
}

export function isGlassdoorJobPage() {
  return window.location.href.includes('glassdoor.com/job-listing');
}

// index.js
import { extractGlassdoorJob, isGlassdoorJobPage } from './glassdoor.js';

const SCRAPERS = [
  // ... existing scrapers
  {
    name: 'glassdoor',
    detect: isGlassdoorJobPage,
    extract: extractGlassdoorJob
  }
];
```

## Testing

To test scrapers:

1. Navigate to a job posting page
2. Open browser console
3. Import and call extraction function:

```javascript
import { extractJobFromPage } from './scrapers/index.js';
const result = extractJobFromPage();
console.log(result);
```

## Documentation

- **SCRAPER_STRATEGY.md**: Detailed selector strategies and rationale
- **base-scraper.js**: JSDoc comments explain utilities
- Each scraper file: Inline comments explain selector choices

