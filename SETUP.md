# Setup Guide

This document explains the foundational setup of the Resume ATS Tracker Chrome Extension.

## Project Structure

```
resume-ats-tracker/
├── manifest.json                    # Extension manifest (MV3)
├── src/
│   ├── background/
│   │   └── service-worker.js        # Background service worker
│   ├── content/
│   │   └── content-script.js        # Content script for job portals
│   ├── popup/
│   │   ├── index.html               # Popup UI (React to be added)
│   │   └── popup.js                 # Popup entry point
│   ├── options/
│   │   ├── index.html               # Options page
│   │   └── options.js               # Options entry point
│   └── shared/
│       ├── messaging.js             # Message-passing utilities
│       └── constants.js             # Shared constants
├── assets/
│   └── icons/                       # Extension icons (need to be added)
└── PERMISSIONS.md                   # Permission explanations
```

## Prerequisites

- Chrome Browser (version 88+ for Manifest V3 support)
- Basic understanding of Chrome Extension development

## Loading the Extension

### Development Mode

1. **Open Chrome Extensions Page:**
   - Navigate to `chrome://extensions/`
   - Or: Menu → Extensions → Manage Extensions

2. **Enable Developer Mode:**
   - Toggle "Developer mode" in the top right

3. **Load Unpacked Extension:**
   - Click "Load unpacked"
   - Select the `resume-ats-tracker` directory
   - Extension should appear in your extensions list

4. **Add Extension Icons:**
   - Create or add icon files to `assets/icons/`:
     - `icon16.png` (16x16)
     - `icon48.png` (48x48)
     - `icon128.png` (128x128)
   - Reload the extension

### Testing the Setup

1. **Check Service Worker:**
   - Go to `chrome://extensions/`
   - Find "Resume ATS Tracker"
   - Click "service worker" link (if available)
   - Check console for initialization logs

2. **Test Popup:**
   - Click the extension icon in toolbar
   - Open browser DevTools (F12)
   - Check console for connection messages

3. **Test Content Script:**
   - Visit any website
   - Open DevTools → Console
   - Check for "[Content Script] Content script loaded" message

4. **Test Message Passing:**
   - Open popup
   - Check console for ping/pong messages between popup and service worker

## Current Status

✅ **Foundation Complete:**
- Manifest V3 configuration
- Service worker setup
- Content script registration
- Message-passing infrastructure
- Permission structure

🚧 **Pending Implementation:**
- React UI for popup
- File processing (PDF/DOCX/Text)
- Job description parsing
- ATS scoring engine
- Content script scrapers
- Options page functionality

## Message-Passing Architecture

The extension uses a unified message-passing system:

### Message Flow

```
Popup UI ←→ Background Service Worker ←→ Content Scripts
              ↕
          Options Page
```

### Usage Example

```javascript
// In popup.js or content script
import { sendMessage } from '../shared/messaging.js';
import { MESSAGE_TYPES } from '../shared/constants.js';

const response = await sendMessage({
  type: MESSAGE_TYPES.PING,
  payload: { source: 'popup' }
});
```

### In Service Worker

```javascript
// In service-worker.js
import { onMessage } from '../shared/messaging.js';

onMessage((message, sender, sendResponse) => {
  if (message.type === MESSAGE_TYPES.PING) {
    sendResponse({ type: MESSAGE_TYPES.PONG });
  }
});
```

## Permissions

See [PERMISSIONS.md](./PERMISSIONS.md) for detailed explanation of all permissions.

**Summary:**
- `activeTab` - Access current tab when user activates extension
- `storage` - Session storage only (cleared on browser restart)
- `scripting` - Inject scripts into pages
- Host permissions - Run content scripts on web pages

## Next Steps

1. **Add Extension Icons:**
   - Create icon files (16x16, 48x48, 128x128)
   - Place in `assets/icons/`

2. **Set Up React (if using):**
   - Install React build tooling
   - Configure build pipeline
   - Create popup UI components

3. **Implement Core Features:**
   - File processors (PDF/DOCX/Text)
   - Job description parsers
   - ATS scoring engine
   - Content script scrapers

4. **Testing:**
   - Unit tests for message passing
   - Integration tests for workflows
   - End-to-end testing

## Troubleshooting

### Extension Won't Load

- Check `manifest.json` for syntax errors
- Ensure all referenced files exist
- Check Chrome's error console (`chrome://extensions/` → Errors)

### Service Worker Not Starting

- Check `src/background/service-worker.js` syntax
- Verify import paths are correct
- Check browser console for errors

### Content Script Not Running

- Verify content script is registered in manifest
- Check if page matches content script patterns
- Inspect page console for content script logs

### Messages Not Working

- Verify message types match in sender and receiver
- Check for errors in console
- Ensure message handler returns `true` for async responses

## Development Tips

1. **Reload Extension:**
   - After code changes, click reload icon on extension card
   - Or: Use keyboard shortcut in extensions page

2. **Debug Service Worker:**
   - Click "service worker" link in extensions page
   - Opens DevTools for service worker context

3. **Debug Content Scripts:**
   - Open DevTools on the page where content script runs
   - Console shows content script logs

4. **Debug Popup:**
   - Right-click popup → Inspect
   - Or: Open popup, then open DevTools

## Resources

- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Migration Guide](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Message Passing Guide](https://developer.chrome.com/docs/extensions/mv3/messaging/)
- [Architecture Documentation](./ARCHITECTURE.md)

