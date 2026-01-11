# Resume Processors

Client-side resume parsing for PDF, DOCX, and plain text formats.

## Overview

The processor system extracts and normalizes resume content into a structured format suitable for ATS scoring.

### Architecture

```
file-processor.js (entry point)
├── pdf-parser.js (PDF.js)
├── docx-parser.js (mammoth.js)
├── text-parser.js (native)
├── text-cleaner.js (utilities)
└── section-normalizer.js (structure)
```

## Quick Start

```javascript
import { processResumeFile } from './processors/file-processor.js';

// Process a file
const file = document.querySelector('input[type="file"]').files[0];
const result = await processResumeFile(file);

if (result.success) {
  console.log('Contact:', result.resume.contact);
  console.log('Experience:', result.resume.experience);
  console.log('Skills:', result.resume.skills);
  console.log('Raw text:', result.resume.rawText);
} else {
  console.error('Error:', result.error);
}
```

## API Reference

### `processResumeFile(file, options)`

Main entry point for processing resume files.

**Parameters:**
- `file` (File|string): File object or text string
- `options` (Object, optional):
  - `format` (string): Force format ("pdf", "docx", "text")
  - `preserveLayout` (boolean): For PDF, use layout-aware parsing

**Returns:** `Promise<ParseResult>`

**Example:**
```javascript
const result = await processResumeFile(file, { preserveLayout: true });
```

### `processResumeText(text)`

Convenience function for processing pasted text.

**Parameters:**
- `text` (string): Resume text

**Returns:** `Promise<ParseResult>`

### `validateFile(file)`

Validate file before processing.

**Parameters:**
- `file` (File): File object

**Returns:** `{ valid: boolean, error?: string, format?: string }`

## Output Schema

See [schemas.js](../shared/schemas.js) for complete schema definition.

### Resume Structure

```javascript
{
  contact: {
    name: "John Doe",
    email: "john@example.com",
    phone: "123-456-7890",
    location: "San Francisco, CA",
    linkedin: "https://linkedin.com/in/johndoe",
    github: "https://github.com/johndoe"
  },
  summary: "Professional summary...",
  experience: [
    {
      company: "Company Name",
      position: "Software Engineer",
      location: "San Francisco, CA",
      startDate: "2020",
      endDate: "Present",
      bullets: ["Achievement 1", "Achievement 2"]
    }
  ],
  education: [
    {
      institution: "University Name",
      degree: "Bachelor of Science",
      field: "Computer Science",
      graduationDate: "2020",
      gpa: "3.8"
    }
  ],
  skills: {
    technical: ["Software Engineering", "System Design"],
    languages: ["JavaScript", "Python"],
    tools: ["Git", "Docker"],
    soft: ["Leadership", "Communication"],
    all: ["JavaScript", "Python", ...]
  },
  rawText: "Cleaned, extracted text...",
  metadata: {
    format: "pdf",
    parsedAt: 1234567890,
    pageCount: 2,
    sections: ["experience", "education", "skills"],
    warnings: []
  }
}
```

## File Format Support

### PDF
- **Library**: PDF.js
- **Features**: Text extraction, page count
- **Limitations**: See [PARSING_LIMITATIONS.md](./PARSING_LIMITATIONS.md)

### DOCX
- **Library**: mammoth.js
- **Features**: Text extraction, structure preservation
- **Limitations**: See [PARSING_LIMITATIONS.md](./PARSING_LIMITATIONS.md)

### Plain Text
- **Library**: Native JavaScript
- **Features**: Direct text extraction
- **Limitations**: See [PARSING_LIMITATIONS.md](./PARSING_LIMITATIONS.md)

## Text Cleaning

The `text-cleaner.js` module provides:

- **Page number removal**: Removes page numbers
- **Header/footer removal**: Removes headers and footers
- **Bullet normalization**: Normalizes bullet points to standard format
- **Whitespace normalization**: Cleans whitespace while preserving structure
- **Noise removal**: Removes common noise patterns
- **Section extraction**: Identifies and extracts sections

## Section Normalization

The `section-normalizer.js` module:

- **Contact extraction**: Extracts contact information from header
- **Experience parsing**: Parses work experience entries
- **Education parsing**: Parses education entries
- **Skills parsing**: Parses and categorizes skills
- **Section identification**: Maps text to structured sections

## Dependencies

### Required Libraries

1. **PDF.js** (`pdfjs-dist`)
   - Load via CDN: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js`
   - Or install: `npm install pdfjs-dist`

2. **mammoth.js**
   - Load via CDN: `https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js`
   - Or install: `npm install mammoth`

### Loading Libraries

#### Option 1: CDN (Script Tags)

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js"></script>
```

#### Option 2: ES Modules (Build System)

```javascript
import * as pdfjsLib from 'pdfjs-dist';
import * as mammoth from 'mammoth';
```

## Error Handling

All parsing functions return a `ParseResult`:

```javascript
{
  success: boolean,
  resume?: Resume,      // Present if success = true
  error?: string,       // Present if success = false
  warnings?: string[]   // Optional warnings
}
```

**Example:**
```javascript
const result = await processResumeFile(file);

if (!result.success) {
  console.error('Parsing failed:', result.error);
  if (result.warnings) {
    console.warn('Warnings:', result.warnings);
  }
  return;
}

// Use result.resume
console.log('Parsed resume:', result.resume);
```

## Limitations

See [PARSING_LIMITATIONS.md](./PARSING_LIMITATIONS.md) for detailed limitations.

### Quick Summary
- **PDF**: Complex layouts, scanned images, tables
- **DOCX**: Complex formatting, tables, embedded objects
- **Text**: No structure, encoding issues
- **All**: Section detection, date parsing, skill categorization

## Testing

### Manual Testing

```javascript
// Test PDF
const pdfFile = new File([...], 'resume.pdf', { type: 'application/pdf' });
const result = await processResumeFile(pdfFile);
console.log(result);

// Test DOCX
const docxFile = new File([...], 'resume.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
const result = await processResumeFile(docxFile);
console.log(result);

// Test Text
const text = "John Doe\n...";
const result = await processResumeText(text);
console.log(result);
```

## Best Practices

1. **Validate files first**: Use `validateFile()` before processing
2. **Handle errors**: Always check `result.success`
3. **Check warnings**: Review `result.warnings` for parsing issues
4. **Review output**: Validate parsed structure matches expectations
5. **Test with various formats**: Different resume formats may parse differently

## Integration

### In Background Service Worker

```javascript
// In service-worker.js
import { processResumeFile } from './processors/file-processor.js';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'PROCESS_RESUME') {
    processResumeFile(message.payload.file)
      .then(result => {
        sendResponse({ type: 'RESUME_PROCESSED', payload: result });
      });
    return true; // Async response
  }
});
```

### In Popup UI

```javascript
// In popup.js
import { processResumeFile, validateFile } from './processors/file-processor.js';

document.querySelector('input[type="file"]').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  
  // Validate
  const validation = validateFile(file);
  if (!validation.valid) {
    alert(validation.error);
    return;
  }
  
  // Process
  const result = await processResumeFile(file);
  if (result.success) {
    console.log('Resume parsed:', result.resume);
  } else {
    console.error('Error:', result.error);
  }
});
```

## Performance Considerations

- **PDF parsing**: Can be slow for large files (>10 pages)
- **DOCX parsing**: Generally fast, but complex documents may be slower
- **Text parsing**: Fastest (no library overhead)
- **Memory**: Large files (>10MB) may cause memory issues

## Security

- **Client-side only**: All processing happens in browser
- **No server uploads**: Files never leave user's browser
- **No external APIs**: No data sent to external services
- **Privacy-first**: All processing local

