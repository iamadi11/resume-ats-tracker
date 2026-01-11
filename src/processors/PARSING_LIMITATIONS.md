# Resume Parsing Limitations

This document outlines known limitations of the resume parsing system for each supported format.

## General Limitations

### Text Extraction
- **Scanned PDFs**: Cannot extract text from image-based PDFs (requires OCR, not implemented)
- **Password-protected files**: Cannot parse password-protected files
- **Encrypted files**: Cannot parse encrypted files
- **Binary corruption**: Corrupted files may fail to parse

### Section Detection
- **Non-standard sections**: Custom section names may not be recognized
- **Missing section headers**: Content without clear section headers may not be categorized correctly
- **Mixed formats**: Resumes with inconsistent formatting may have parsing errors

### Structure Preservation
- **Complex layouts**: Multi-column layouts may merge incorrectly
- **Tables**: Table structures are converted to plain text (structure lost)
- **Nested lists**: Complex nested lists may flatten incorrectly
- **Formatting**: Bold, italic, and other formatting is lost

---

## PDF Parsing Limitations

### Library: PDF.js

#### Text Extraction
- **Complex layouts**: Text from multi-column layouts may merge in wrong order
- **Rotated text**: Text at angles may not extract correctly
- **Overlapping text**: Text layers that overlap may duplicate or merge incorrectly
- **Image text**: Text embedded in images not extracted (requires OCR)

#### Layout Issues
- **Headers/footers**: May not be reliably detected on all PDFs
- **Page numbers**: Detection is heuristic-based (may miss some patterns)
- **Wrapped text**: Text that wraps across lines may not preserve structure
- **Tables**: Tables converted to text (column alignment may be lost)

#### Font/Encoding
- **Custom fonts**: Some custom fonts may not render correctly
- **Encoding issues**: Non-UTF-8 encoding may cause character corruption
- **Symbols**: Special characters/symbols may not extract correctly

#### Performance
- **Large files**: PDFs with many pages (>10) may parse slowly
- **Complex graphics**: PDFs with heavy graphics may be slower to process
- **File size**: Very large files (>10MB) may cause memory issues

#### Known Issues
- **Text positioning**: PDF.js text extraction uses coordinate positioning, which may not perfectly preserve reading order
- **Inline graphics**: Graphics interspersed with text may disrupt extraction
- **Forms**: Form fields may extract as values or not at all

---

## DOCX Parsing Limitations

### Library: mammoth.js

#### Formatting Loss
- **Complex formatting**: Advanced Word formatting may be lost
- **Tables**: Tables converted to text (structure may be lost)
- **Images**: Images not extracted
- **Charts/graphs**: Charts and graphs not extracted

#### Structure Issues
- **Headers/footers**: Word headers and footers may appear in body text
- **Comments**: Comments and tracked changes may appear in extracted text
- **Embedded objects**: Embedded Excel sheets, PDFs, etc. not extracted
- **Watermarks**: Watermarks may appear in text

#### Compatibility
- **Old Word formats**: .doc (binary) format not supported (only .docx)
- **Macros**: VBA macros not executed/extracted
- **Field codes**: Word field codes may appear as raw text

#### Text Extraction
- **Smart quotes**: May convert to regular quotes inconsistently
- **Hyphenation**: Manual hyphens may appear in extracted text
- **Non-breaking spaces**: May appear as regular spaces

#### Known Issues
- **Complex styles**: Custom styles may not translate well
- **Multi-column layouts**: Column structure may not be preserved
- **Text boxes**: Text in Word text boxes may not extract in correct order

---

## Plain Text Parsing Limitations

### Format Detection
- **No structure**: Plain text has no inherent structure to detect
- **Section identification**: Relies entirely on heuristics (section headers, formatting)
- **Encoding**: Encoding detection is basic (may fail on non-UTF-8)

#### Structure Issues
- **Inconsistent formatting**: Text files with inconsistent formatting may parse poorly
- **No visual cues**: Cannot use visual formatting (bold, bullets) as hints
- **Whitespace dependent**: Structure inferred from whitespace (may break on inconsistent spacing)

#### Content Issues
- **No metadata**: No file metadata to extract
- **Encoding problems**: Non-UTF-8 files may have character corruption
- **Line endings**: Mixed line endings (CRLF vs LF) may cause issues

#### Known Issues
- **Tab-separated content**: Content separated by tabs may not parse correctly
- **Mixed delimiters**: Inconsistent use of bullets, dashes, etc. may cause issues
- **No font information**: Cannot use font size/style as structure hints

---

## Section Normalization Limitations

### Contact Information Extraction
- **Name detection**: Heuristic-based (may miss or incorrectly identify names)
- **Email patterns**: Only standard email patterns recognized
- **Phone formats**: International formats may not all be recognized
- **URLs**: May miss URLs in non-standard formats

### Experience Parsing
- **Date formats**: Only common date formats recognized
- **Company detection**: May incorrectly identify company names
- **Position titles**: May not correctly separate position from company
- **Bullet points**: Requires consistent bullet formatting
- **Multi-line entries**: Entries spanning many lines may not parse correctly

### Education Parsing
- **Institution names**: May not recognize all institution name patterns
- **Degree abbreviations**: May not understand all degree abbreviations
- **GPA formats**: Only standard GPA formats recognized
- **Multiple degrees**: Complex education entries may not parse completely

### Skills Parsing
- **Categorization**: Skill categorization is heuristic-based (may mis-categorize)
- **Duplicate detection**: May not detect all duplicates (variations in naming)
- **Skill grouping**: Skills in categories may not be parsed correctly
- **Technical vs. soft**: Distinction may not always be accurate

---

## Text Cleaning Limitations

### Header/Footer Removal
- **Detection**: Heuristic-based (may remove actual content or miss headers)
- **Name-based**: Name extraction may fail, causing header detection to fail
- **Repeated content**: May incorrectly identify repeated content as headers/footers
- **Variable headers**: Headers that change per page may not all be removed

### Page Number Removal
- **Patterns**: Only common page number patterns recognized
- **Formats**: Non-standard page number formats may not be removed
- **False positives**: May remove numbers that aren't page numbers

### Bullet Normalization
- **Variety**: Not all bullet point styles recognized
- **Nested bullets**: Complex nested bullets may not normalize correctly
- **Numbered lists**: Numbered lists converted to bullets (numbering lost)

### Whitespace Normalization
- **Intentional spacing**: May remove intentional spacing (tables, columns)
- **Line breaks**: May not preserve all intended line breaks
- **Indentation**: Indentation used for structure may be lost

---

## Known Edge Cases

### PDF-Specific
1. **Image-only PDFs**: Cannot extract text (requires OCR)
2. **Form-filled PDFs**: Form values may extract incorrectly
3. **Digital signatures**: Signature blocks may appear in text
4. **Annotated PDFs**: Annotations may appear in extracted text

### DOCX-Specific
1. **Tracked changes**: Changes may appear in extracted text
2. **Comments**: Comments may appear in extracted text
3. **Hyperlinks**: Link text extracted, URLs may be lost
4. **Cross-references**: Cross-references may appear as raw codes

### Text-Specific
1. **Markdown**: Markdown formatting not parsed (treated as plain text)
2. **HTML**: HTML tags may appear in text if not cleaned
3. **RTF**: Rich Text Format not supported (would need conversion)

---

## Mitigation Strategies

### For Users
1. **Use ATS-friendly formats**: Simple, single-column layouts parse best
2. **Clear section headers**: Use standard section names (Experience, Education, Skills)
3. **Consistent formatting**: Use consistent bullet points, spacing, and dates
4. **Avoid complex layouts**: Multi-column layouts, tables, and complex formatting may parse poorly
5. **Check output**: Always review parsed output for accuracy

### For Developers
1. **Error handling**: All parsing functions return error objects
2. **Warnings**: Parsing warnings collected and returned with results
3. **Fallback strategies**: Multiple parsing strategies attempted
4. **Validation**: Output validated before returning
5. **Logging**: Errors logged for debugging and improvement

---

## Future Improvements

### Planned Enhancements
1. **OCR support**: Add OCR for image-based PDFs
2. **Better table parsing**: Preserve table structure from PDF/DOCX
3. **Improved date parsing**: Better recognition of various date formats
4. **Machine learning**: Use ML for better section detection and categorization
5. **Format detection**: Better file format detection and handling

### Research Areas
1. **Layout analysis**: Better understanding of document layout
2. **Entity recognition**: Use NER for better contact/company extraction
3. **Date normalization**: Standardize various date formats
4. **Skill extraction**: Better skill categorization and extraction

---

## Testing Recommendations

When testing the parser:
1. Test with various resume formats and layouts
2. Test with different languages (English-focused currently)
3. Test with edge cases (minimal content, maximum content)
4. Test with corrupted or malformed files
5. Test with files from different sources (Word versions, PDF generators)

---

## Support and Feedback

If you encounter parsing issues:
1. Check this document for known limitations
2. Review the extracted text to understand what was captured
3. Check console logs for warnings/errors
4. Report issues with sample files (if possible, anonymized)

