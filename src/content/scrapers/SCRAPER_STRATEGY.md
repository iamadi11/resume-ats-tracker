# Job Scraper Selector Strategies

This document explains the selector strategies used for each job portal scraper, including fallback mechanisms and rationale for each approach.

## Overview

Each scraper uses a **tiered fallback strategy** with multiple selector attempts:
1. **Primary selectors** - Most specific, stable selectors for the portal
2. **Secondary selectors** - Alternative structures (A/B tests, redesigns)
3. **Generic fallbacks** - Pattern-based selectors as last resort
4. **Heuristic validation** - Ensures extracted content is actually a job description

---

## 1. LinkedIn Scraper

### Selector Strategy

**Primary Selectors:**
- `div[data-test-id="job-details"]` - LinkedIn's data-test-id is stable across changes
- `div.description__text` - Standard class for job descriptions
- `.show-more-less-html__markup` - Expanded content container

**Why these selectors?**
- `data-test-id` attributes are used by LinkedIn for testing and are more stable than classes
- BEM-style class naming (`.description__text`) is LinkedIn's convention
- The `show-more-less-html__markup` handles LinkedIn's expandable content pattern

**Fallback Strategy:**
1. Try primary selectors in order
2. Attempt to expand "Show more" content if present
3. Fall back to class-based selectors with wildcards
4. Last resort: semantic HTML (`article`, `main`)

**Edge Cases Handled:**
- **Expandable content**: Checks for "Show more" button and attempts to access full text
- **Dynamic rendering**: Multiple selector attempts account for React re-renders
- **A/B testing**: Fallback selectors cover different LinkedIn page variants

**Limitations:**
- Cannot programmatically expand content if button requires React state updates
- May miss content behind additional "Show more" buttons in nested sections
- LinkedIn's frequent UI changes may require selector updates

---

## 2. Indeed Scraper

### Selector Strategy

**Primary Selectors:**
- `#jobDescriptionText` - ID-based selector (most stable)
- `.jobsearch-jobDescriptionText` - Class-based selector
- `[data-testid="job-description"]` - Test ID attribute

**Why these selectors?**
- **ID-based selectors** (`#jobDescriptionText`) are the most stable - IDs rarely change
- Indeed uses consistent naming conventions (`jobsearch-` prefix)
- `data-testid` provides additional stability layer

**Fallback Strategy:**
1. Try ID selector first (most reliable)
2. Fall back to class-based selectors
3. Try structured sections if main container fails
4. Combine multiple sections if job description is split

**Edge Cases Handled:**
- **Structured sections**: Indeed sometimes splits descriptions into sections (summary, requirements, etc.)
- **Multiple containers**: Handles cases where description spans multiple elements
- **Page variants**: Accounts for different Indeed page layouts

**Limitations:**
- ID-based selectors are stable but may change during major redesigns
- Some job postings may have minimal descriptions that don't meet validation thresholds
- International Indeed sites may have different structures

---

## 3. Naukri Scraper

### Selector Strategy

**Primary Selectors:**
- `.jd-container` - Naukri's standard job description container
- `.job-description` - Alternative container class
- `.jd-details` - Detail section class

**Why these selectors?**
- Naukri uses consistent abbreviations (`jd` = job description)
- Class-based selectors are primary (few IDs in Naukri structure)
- Multiple related classes provide fallback options

**Fallback Strategy:**
1. Try main container selectors
2. If insufficient content, collect from multiple `.jd-sec` sections
3. Combine text from multiple sections
4. Validate combined result

**Edge Cases Handled:**
- **Multi-section descriptions**: Naukri often splits descriptions across sections
- **Nested structure**: Handles deeply nested job detail sections
- **Combined extraction**: Merges text from multiple related elements

**Limitations:**
- Class-based selectors more prone to changes than IDs
- Some job postings may have non-standard structures
- International variants (e.g., Naukri Gulf) may differ

---

## 4. Greenhouse Scraper

### Selector Strategy

**Primary Selectors:**
- `#content` - Greenhouse's main content container (ID-based)
- `.content` - Class-based alternative
- `.section` - Structured section container

**Why these selectors?**
- Greenhouse installations use consistent structure across companies
- `#content` ID is standard across Greenhouse-hosted pages
- Section-based structure allows granular extraction

**Fallback Strategy:**
1. Try main content container
2. Remove header/footer noise
3. Extract from structured sections
4. Fall back to generic content areas

**Edge Cases Handled:**
- **Custom styling**: Removes header/footer to avoid noise
- **Multi-section content**: Handles structured Greenhouse sections
- **Company customization**: Works across different Greenhouse installations

**Limitations:**
- Greenhouse can be hosted on company domains with custom styling
- Some companies heavily customize the template
- Custom sections may not follow standard patterns

---

## 5. Lever Scraper

### Selector Strategy

**Primary Selectors:**
- `.posting` - Lever's main job posting container
- `.posting-content` - Content within posting
- `.posting-header + .posting-content` - Adjacent sibling selector

**Why these selectors?**
- Lever uses consistent class naming (`.posting-*` prefix)
- Sibling selector helps isolate content from header
- Container structure is predictable

**Fallback Strategy:**
1. Try posting content container
2. Remove header/action elements
3. Extract from posting container
4. Fall back to generic content

**Edge Cases Handled:**
- **Header separation**: Removes posting header and action buttons
- **Structured content**: Handles Lever's content sections
- **Apply buttons**: Filters out application-related elements

**Limitations:**
- Lever can be hosted on company domains
- Some installations may use custom templates
- Content structure may vary between companies

---

## 6. Generic Fallback Scraper

### Strategy Overview

The generic scraper uses **heuristic-based extraction** for unsupported portals.

### Heuristic Approach

1. **Pattern Matching:**
   - Searches for elements with job-related classes/IDs
   - Looks for common indicators: `job-description`, `job-details`, `description`, etc.
   - Scores candidates based on multiple factors

2. **Scoring System:**
   - **Text length**: Optimal length (500-10,000 chars) scores higher
   - **Element type**: Semantic HTML (`main`, `article`) preferred
   - **Class/ID indicators**: Job-related keywords increase score
   - **Noise penalty**: Elements in nav/header/footer get penalized

3. **Semantic HTML Fallback:**
   - Uses `<main>`, `<article>`, `[role="main"]` elements
   - Filters out navigation and structural elements

4. **Last Resort:**
   - Extracts from `<body>` with heavy filtering
   - Removes known noise patterns
   - Validates result meets job description criteria

### Why This Approach?

- **Flexibility**: Works on any job portal structure
- **Robustness**: Multiple fallback strategies ensure extraction attempt
- **Validation**: Heuristic validation ensures quality results

### Limitations

- **Lower accuracy**: Generic approach less precise than portal-specific scrapers
- **Noise sensitivity**: May extract irrelevant content if page structure is unusual
- **Performance**: Scoring multiple candidates is more computationally expensive
- **False positives**: May extract non-job content that matches patterns

---

## Common Patterns Across All Scrapers

### 1. Text Cleaning Pipeline

All scrapers use the same text cleaning approach:

1. **HTML Removal**: Convert HTML entities and extract text
2. **Whitespace Normalization**: Multiple spaces/newlines → single space/double newline
3. **Noise Removal**: Remove share buttons, cookie notices, copyrights, etc.
4. **Character Cleaning**: Remove zero-width characters, special Unicode

**Why this pipeline?**
- Consistent output format across all portals
- Removes UI noise that doesn't contribute to job description
- Improves readability for downstream processing

### 2. Validation Strategy

All scrapers validate extracted content:

**Minimum Requirements:**
- Text length ≥ 100 characters
- Contains job-related keywords (requirements, qualifications, skills, etc.)
- Noise pattern count < 5 (not too much navigation/footer content)

**Why validate?**
- Prevents returning empty or invalid results
- Filters out false positives (e.g., job listing pages vs. job detail pages)
- Ensures quality for ATS scoring engine

### 3. Metadata Extraction

All scrapers extract:
- **Job Title**: From `h1` or title-specific selectors
- **Company Name**: From company-specific elements
- **Location**: From location-specific elements

**Strategy:**
- Use fallback selector arrays
- Extract from most specific to generic
- Clean and normalize extracted text

### 4. Error Handling

All scrapers:
- Wrap extraction in try-catch blocks
- Return structured error results
- Log errors for debugging
- Fall back gracefully (generic scraper as last resort)

---

## Selector Stability Considerations

### Most Stable → Least Stable

1. **ID-based selectors** (`#jobDescriptionText`)
   - Most stable, rarely change
   - Used when available

2. **Data attributes** (`[data-test-id="..."]`, `[data-testid="..."]`)
   - Stable for testing purposes
   - LinkedIn uses these extensively

3. **Semantic class names** (`.job-description`, `.posting-content`)
   - Relatively stable if part of design system
   - May change during redesigns

4. **BEM-style classes** (`.description__text`)
   - Stable within design system
   - May change if naming convention changes

5. **Pattern-based selectors** (`[class*="description"]`)
   - Least stable, but broadest coverage
   - Used as last resort fallback

---

## Edge Cases & Limitations

### Common Edge Cases

1. **Dynamic Content Loading**
   - **Problem**: Content loaded via JavaScript after page load
   - **Solution**: Content scripts run at `document_idle`, retry mechanism could be added
   - **Limitation**: May miss content that loads very late

2. **Expandable Content**
   - **Problem**: Job descriptions behind "Show more" buttons
   - **Solution**: Attempt to find expanded content containers, try clicking (limited success)
   - **Limitation**: Cannot trigger React state changes reliably

3. **A/B Testing & Redesigns**
   - **Problem**: Portals test different layouts
   - **Solution**: Multiple fallback selectors cover variants
   - **Limitation**: Major redesigns may require selector updates

4. **International Variants**
   - **Problem**: Different structures for country-specific sites
   - **Solution**: URL-based detection, fallback to generic
   - **Limitation**: May not work optimally on all variants

5. **Custom Installations**
   - **Problem**: Greenhouse/Lever hosted on company domains with customization
   - **Solution**: Generic fallback handles variations
   - **Limitation**: Highly customized sites may fail

6. **Job Listing Pages vs. Detail Pages**
   - **Problem**: Extracting from listing pages (multiple jobs)
   - **Solution**: Validation ensures single job description, URL patterns help
   - **Limitation**: May attempt extraction on wrong page type

### General Limitations

1. **Selector Maintenance**
   - Portals change structures regularly
   - Requires periodic selector updates
   - No automatic adaptation mechanism

2. **Performance**
   - Multiple selector attempts can be slow
   - Generic scraper's scoring system is more expensive
   - Optimized for accuracy over speed

3. **Accuracy vs. Coverage Tradeoff**
   - Specific selectors = higher accuracy, lower coverage
   - Generic fallback = lower accuracy, higher coverage
   - Balance achieved through tiered approach

4. **Privacy & Content Access**
   - Cannot access content behind authentication
   - Cannot interact with page (clicking, scrolling) reliably
   - Limited to DOM inspection

---

## Recommendations for Maintenance

1. **Monitor Selector Failures**
   - Log when selectors fail
   - Track which portals need updates
   - Set up alerts for high failure rates

2. **Version Selectors**
   - Track selector versions
   - Allow multiple selector sets per portal
   - Enable A/B testing of new selectors

3. **User Feedback**
   - Allow users to report extraction failures
   - Collect page structure data for analysis
   - Use feedback to improve selectors

4. **Automated Testing**
   - Test selectors against known job pages
   - Run tests periodically to detect breakages
   - Use screenshots/DOM snapshots for analysis

5. **Fallback Strategy**
   - Always have generic fallback
   - Graceful degradation is better than failure
   - Log when generic fallback is used

---

## Conclusion

The selector strategies balance **specificity** (for accuracy) with **flexibility** (for coverage). Each scraper uses a tiered fallback approach to handle:

- Portal structure changes
- A/B testing variants
- International variants
- Custom installations
- Edge cases

The generic fallback ensures extraction attempts even on unsupported portals, though with lower accuracy. Combined with robust validation and error handling, this approach provides a reliable foundation for job description extraction.

