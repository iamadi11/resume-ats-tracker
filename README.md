# Resume ATS Tracker

A Chrome Extension (Manifest V3) that calculates real-time ATS compatibility scores for resumes/CVs.

## Features

- **Multiple Resume Input Formats**: PDF, DOCX, and pasted text
- **Job Description Input**: Manual paste or auto-extraction from job portals
- **Real-Time ATS Scoring**: Instant compatibility score (0-100)
- **Explainable Scoring**: Transparent, rule-based scoring with detailed breakdowns
- **Privacy-First**: No data storage, all processing happens locally

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for complete architecture documentation including:
- High-level architecture diagram
- Data flow between components
- Folder structure
- Technical decisions & tradeoffs
- Scoring strategy overview

## Status

✅ **Foundation Complete** - Manifest V3 setup, service worker, content scripts, and message-passing infrastructure are in place.

🚧 **Implementation Pending** - UI components, file processing, scoring engine, and scrapers need to be implemented.

See [SETUP.md](./SETUP.md) for setup instructions and [PERMISSIONS.md](./PERMISSIONS.md) for permission details.
