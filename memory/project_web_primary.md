---
name: Web app is primary interface
description: The Next.js backend serves a full web UI — this is the primary interface, not the React Native app
type: project
---

The primary interface is a Next.js web app (`backend/app/(web)/`), not the React Native mobile app. The mobile app exists but is less actively developed.

**Why:** The project evolved from a mobile-first concept to a web-first app. CLAUDE.md updated 2026-05-18 to reflect this.

**How to apply:** When the user asks about UI changes, default to looking in `backend/app/(web)/` and `backend/components/` before the `mobile/` directory.
