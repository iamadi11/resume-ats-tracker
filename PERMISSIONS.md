# Extension Permissions Explanation

This document explains all permissions requested by the Resume ATS Tracker Chrome Extension and why each is necessary.

## Required Permissions

### `activeTab`
**What it does:** Grants temporary access to the currently active tab when the user invokes the extension.

**Why we need it:**
- Allows the extension to inject content scripts into job portal pages
- Enables reading page content to extract job descriptions
- Only active when user explicitly interacts with the extension (clicking icon/button)

**Privacy impact:** ✅ **Minimal** - Only accesses tabs when user actively uses the extension. No background access.

**Alternative considered:** Host permissions (`*://linkedin.com/*`) - Rejected because it would require access to all pages on those domains, not just when needed.

---

### `storage`
**What it does:** Allows the extension to use `chrome.storage` APIs for data storage.

**Why we need it:**
- Uses `chrome.storage.session` for ephemeral, in-memory data storage
- Stores parsed resume data, job descriptions, and scores during active session only
- Data is automatically cleared when browser session ends
- No persistent storage - respects privacy-first design

**Privacy impact:** ✅ **None** - Session storage only, cleared on browser close. No data persistence.

**Storage usage:**
- `chrome.storage.session` - Temporary session data (cleared on restart)
- `chrome.storage.local` - NOT used (respects privacy-first design)

---

### `scripting`
**What it does:** Allows the extension to programmatically inject JavaScript and CSS into web pages.

**Why we need it:**
- Dynamically inject content scripts into job portal pages
- Inject floating UI widgets for job extraction
- More flexible than static content script declarations

**Privacy impact:** ✅ **Minimal** - Only injects scripts when user activates extension on specific pages.

**Manifest V3 requirement:** Replaces deprecated `chrome.tabs.executeScript()` API.

---

## Host Permissions

### `http://*/*` and `https://*/*`
**What it does:** Grants permission to interact with web pages (read content, inject scripts).

**Why we need it:**
- Content scripts need to run on job portal pages (LinkedIn, Indeed, Glassdoor, etc.)
- Cannot predict all job portal domains in advance
- Generic pattern allows extension to work on any job portal

**Privacy impact:** ⚠️ **Controlled** - Content scripts only execute on pages user visits. Extension respects `activeTab` permission for most operations.

**Mitigation:**
- Content scripts are marked `run_at: "document_idle"` to minimize impact
- Only active when user explicitly uses extension features
- No background data collection
- All processing happens locally in browser

**Alternative considered:** Specific host permissions for known portals - Rejected because:
- Too restrictive (wouldn't work on smaller job boards)
- Requires constant updates as new portals are added
- Generic pattern with `activeTab` provides better user control

---

## Permissions NOT Requested (Privacy-First Design)

### ❌ `tabs` (read access)
**Why not needed:** We use `activeTab` instead, which only grants access when user activates extension.

### ❌ `background`
**Why not needed:** Service worker runs automatically in Manifest V3, doesn't need explicit permission.

### ❌ `webRequest` / `webRequestBlocking`
**Why not needed:** We don't intercept or modify network requests. All processing is client-side.

### ❌ `downloads`
**Why not needed:** Export functionality (if added) will use browser's download API triggered by user action, not extension permission.

### ❌ `identity` / `cookies`
**Why not needed:** No authentication, no server communication. Completely offline/private.

---

## Permission Best Practices

1. **Minimal Permissions:** Only request permissions absolutely necessary for core functionality
2. **Active Tab Pattern:** Use `activeTab` instead of broad host permissions where possible
3. **Session Storage Only:** No persistent data storage to respect user privacy
4. **User Control:** All permissions are clearly explained in Chrome Web Store listing
5. **Transparency:** This document explains every permission in detail

---

## How Permissions Are Used

### User Flow with Permissions

1. **User installs extension:**
   - Chrome shows permission prompt listing `activeTab`, `storage`, `scripting`
   - User can review permissions before installing

2. **User clicks extension icon:**
   - `activeTab` permission activates for current tab
   - Popup opens (no additional permission needed)

3. **User uploads resume:**
   - File is read in popup context (no special permission needed)
   - Processed data stored in `chrome.storage.session`

4. **User visits job portal:**
   - Content script runs (declared in manifest)
   - When user activates extension, `activeTab` + `scripting` allow job extraction

5. **User closes browser:**
   - `chrome.storage.session` data is cleared
   - No data persists

---

## Privacy Guarantee

✅ **No data leaves your browser** - All processing is client-side
✅ **No persistent storage** - Data cleared on browser restart  
✅ **No tracking** - No analytics, no external APIs
✅ **No background access** - Only active when you use the extension
✅ **Open source** - Code is inspectable and auditable

---

## References

- [Chrome Extension Permissions Documentation](https://developer.chrome.com/docs/extensions/mv3/declare_permissions/)
- [Manifest V3 Migration Guide](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Privacy Best Practices](https://developer.chrome.com/docs/extensions/mv3/user_privacy/)

