# Privacy Policy

**Last Updated:** [Date]

## Overview

Resume ATS Tracker is designed with privacy as a core principle. This extension processes your resume and job descriptions entirely on your device. **No data is ever sent to external servers or stored permanently.**

## Data Collection

### What We Do NOT Collect

- ❌ **No personal information** is collected
- ❌ **No resume content** is stored or transmitted
- ❌ **No job descriptions** are stored or transmitted
- ❌ **No browsing history** is tracked
- ❌ **No analytics** or usage data is collected
- ❌ **No third-party services** are used
- ❌ **No cookies** or tracking technologies

### What We Process (Locally Only)

The extension processes the following data **entirely on your device**:

1. **Resume Files**: PDF, DOCX, or text files you upload
   - Processed locally in your browser
   - Never transmitted to any server
   - Cleared from memory when you close the extension

2. **Job Descriptions**: Text you paste or extract from job portals
   - Processed locally in your browser
   - Never transmitted to any server
   - Cleared from memory when you close the extension

3. **ATS Scores**: Calculated scores and feedback
   - Generated locally on your device
   - Never transmitted to any server
   - Not stored permanently

## Data Storage

### Zero Data Persistence

- **No permanent storage**: All data is processed in memory only
- **No local storage**: We do not use `localStorage`, `sessionStorage`, or `IndexedDB`
- **No cloud storage**: No data is synced to cloud services
- **No cookies**: No cookies are set or read
- **Ephemeral only**: Data exists only during active use and is cleared when:
  - You close the extension popup
  - You navigate away from the page
  - The browser session ends

### Chrome Storage API

The extension uses Chrome's `storage` permission **only** for:
- Temporary session state (cleared on close)
- Extension settings (if any)
- **No resume or job description data is stored**

## Permissions Explained

### Required Permissions

1. **`activeTab`**
   - **Purpose**: Extract job descriptions from job portal pages
   - **Scope**: Only the currently active tab
   - **Data**: Only job description text (processed locally)
   - **Privacy**: No browsing history is accessed or stored

2. **`storage`**
   - **Purpose**: Store extension settings (if any)
   - **Scope**: Local browser storage only
   - **Data**: Settings only, no resume or job data
   - **Privacy**: Data never leaves your device

3. **`scripting`**
   - **Purpose**: Inject content scripts to extract job descriptions
   - **Scope**: Only on job portal pages you visit
   - **Data**: Only extracts visible job description text
   - **Privacy**: No data is transmitted externally

4. **`sidePanel`**
   - **Purpose**: Display detailed analysis in side panel
   - **Scope**: Extension UI only
   - **Data**: Displays locally calculated results
   - **Privacy**: No external communication

### Host Permissions

- **`http://*/*` and `https://*/*`**
  - **Purpose**: Extract job descriptions from job portals
  - **Scope**: Only when you explicitly use the "Extract from page" feature
  - **Data**: Only extracts visible text from the page
  - **Privacy**: No data is transmitted; all processing is local

## How It Works

1. **You upload a resume** → Processed locally in your browser
2. **You paste/extract a job description** → Processed locally in your browser
3. **Score is calculated** → All calculations happen on your device
4. **Results are displayed** → Shown only to you, never transmitted
5. **Data is cleared** → When you close the extension or browser

## Third-Party Services

**None.** This extension:
- Does not use any third-party APIs
- Does not use analytics services
- Does not use tracking services
- Does not use external libraries that transmit data
- Operates entirely offline after installation

## Data Security

### Local Processing
- All processing happens in your browser's JavaScript engine
- Web Workers are used for heavy computations (still local)
- No network requests are made for scoring

### Code Transparency
- All code is open source (if applicable)
- No obfuscated or minified code that hides functionality
- Clear documentation of all operations

## Your Rights

- **Access**: All data is on your device; you have full access
- **Deletion**: Close the extension to clear all data
- **Control**: You control what data is processed
- **Transparency**: All operations are local and visible

## Updates to This Policy

If we update this privacy policy, we will:
- Update the "Last Updated" date
- Notify users of significant changes
- Maintain the same privacy-first principles

## Contact

For privacy concerns or questions:
- Review the source code (if open source)
- Check the extension's permissions in Chrome
- Contact the developer through the Chrome Web Store listing

## Compliance

This extension is designed to comply with:
- **GDPR**: No personal data collection or processing
- **CCPA**: No sale or sharing of personal information
- **Chrome Web Store Policies**: Privacy-first design

---

**Remember**: This extension processes everything locally. Your data never leaves your device.

