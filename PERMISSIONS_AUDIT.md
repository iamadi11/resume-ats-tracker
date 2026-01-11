# Permissions Audit

## Overview

This document provides a comprehensive audit of all Chrome Extension permissions, their purposes, and privacy implications.

## Required Permissions

### 1. `activeTab`

**Status:** ✅ Required and Justified

**Purpose:**
- Extract job descriptions from job portal pages (LinkedIn, Indeed, etc.)
- Only activates when user explicitly clicks "Extract from page" button

**What It Accesses:**
- Only the currently active tab's DOM
- Only when user initiates the action
- Only extracts visible job description text

**Privacy Impact:**
- ⚠️ **Low**: Only accesses active tab when user requests
- ✅ No browsing history is accessed
- ✅ No data is stored
- ✅ No background monitoring

**Justification:**
- Essential for core functionality (job description extraction)
- User-initiated only (no automatic access)
- Minimal scope (only active tab, only when needed)

**Chrome Web Store Compliance:**
- ✅ Single purpose use
- ✅ User-initiated
- ✅ Minimal scope

---

### 2. `storage`

**Status:** ✅ Required and Justified

**Purpose:**
- Store extension settings (if any)
- Temporary session state (cleared on close)

**What It Accesses:**
- Chrome's local storage API
- Only for extension settings, NOT resume/job data

**Privacy Impact:**
- ✅ **Minimal**: Only stores settings, no personal data
- ✅ No resume or job description content is stored
- ✅ Data is cleared when extension closes

**Justification:**
- Standard practice for extension settings
- No sensitive data stored
- Ephemeral storage only

**Chrome Web Store Compliance:**
- ✅ Standard permission
- ✅ No sensitive data
- ✅ Clear purpose

---

### 3. `scripting`

**Status:** ✅ Required and Justified

**Purpose:**
- Inject content scripts to extract job descriptions
- Only on job portal pages user visits

**What It Accesses:**
- DOM of pages matching job portal patterns
- Only extracts visible text
- No network requests

**Privacy Impact:**
- ⚠️ **Low**: Only extracts visible text from pages
- ✅ No data transmission
- ✅ No background monitoring
- ✅ User-initiated only

**Justification:**
- Required for job description extraction
- Limited to job portal pages
- User-initiated action

**Chrome Web Store Compliance:**
- ✅ Single purpose use
- ✅ User-initiated
- ✅ Limited scope

---

### 4. `sidePanel`

**Status:** ✅ Required and Justified

**Purpose:**
- Display detailed ATS analysis in side panel
- Better UX for viewing breakdowns and feedback

**What It Accesses:**
- Extension's own side panel UI
- No external data access

**Privacy Impact:**
- ✅ **None**: Only displays locally calculated results
- ✅ No external communication
- ✅ No data access

**Justification:**
- Enhances user experience
- No privacy implications
- Standard extension feature

**Chrome Web Store Compliance:**
- ✅ Standard permission
- ✅ No privacy concerns

---

## Host Permissions

### `http://*/*` and `https://*/*`

**Status:** ✅ Required and Justified

**Purpose:**
- Extract job descriptions from various job portals
- Support different job portal domains

**What It Accesses:**
- DOM of pages user visits
- Only when user clicks "Extract from page"
- Only extracts visible job description text

**Privacy Impact:**
- ⚠️ **Low**: Only extracts text from pages user visits
- ✅ No background monitoring
- ✅ No data transmission
- ✅ User-initiated only

**Justification:**
- Job portals use various domains
- Cannot predict all possible domains
- User-initiated action only

**Chrome Web Store Compliance:**
- ✅ User-initiated
- ✅ Single purpose
- ✅ Minimal data access

**Alternative Considered:**
- ❌ Specific domain list: Too restrictive, would break on new portals
- ✅ Current approach: Flexible, user-initiated, minimal access

---

## Permissions NOT Requested

### ❌ `tabs`
- **Not Needed**: We use `activeTab` instead (more privacy-friendly)
- **Why**: Only need current tab, not all tabs

### ❌ `history`
- **Not Needed**: No browsing history access required
- **Why**: We don't track or store browsing data

### ❌ `bookmarks`
- **Not Needed**: No bookmark access required
- **Why**: Not part of functionality

### ❌ `cookies`
- **Not Needed**: No cookie access required
- **Why**: We don't use cookies or track users

### ❌ `downloads`
- **Not Needed**: No download access required
- **Why**: Users upload files, we don't download

### ❌ `notifications`
- **Not Needed**: No notifications required
- **Why**: Not part of functionality

### ❌ `geolocation`
- **Not Needed**: No location access required
- **Why**: Not part of functionality

### ❌ `webRequest` or `webRequestBlocking`
- **Not Needed**: No network request interception
- **Why**: We don't modify network requests

---

## Permission Minimization

### Principles Applied

1. **Least Privilege**: Only request permissions absolutely necessary
2. **Active Tab Over Tabs**: Use `activeTab` instead of `tabs`
3. **User-Initiated**: All actions require user interaction
4. **No Background Monitoring**: No automatic data collection
5. **Ephemeral Data**: No permanent storage

### Privacy-First Design

- ✅ All permissions are user-initiated
- ✅ No background monitoring
- ✅ No data persistence
- ✅ No external transmission
- ✅ Minimal scope for each permission

---

## Chrome Web Store Review

### Permission Justification

All permissions are:
- ✅ **Necessary**: Required for core functionality
- ✅ **Minimal**: Only what's needed, nothing more
- ✅ **User-Initiated**: No automatic access
- ✅ **Transparent**: Clear purpose and scope

### Privacy Manifest

The extension follows Chrome's privacy guidelines:
- ✅ No personal data collection
- ✅ No data transmission
- ✅ No tracking
- ✅ Local processing only

---

## User Communication

### Permission Requests

When permissions are requested, users see:
- Clear explanation of why permission is needed
- What data is accessed
- How it's used
- Privacy guarantees

### Transparency

- Privacy policy clearly explains permissions
- No hidden functionality
- Open source (if applicable)
- Clear documentation

---

## Compliance Checklist

- ✅ All permissions justified
- ✅ Minimal permission set
- ✅ User-initiated actions
- ✅ No background monitoring
- ✅ No data persistence
- ✅ Privacy-first design
- ✅ Chrome Web Store compliant

---

## Updates

If new permissions are needed in the future:
1. Document justification
2. Update this audit
3. Update privacy policy
4. Notify users
5. Submit for review

