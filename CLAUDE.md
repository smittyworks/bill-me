# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Bill Me is a personal app for tracking bills via photo capture, AI-powered OCR, push notification reminders, and a day planner. The primary interface is a web app; a React Native mobile app exists but is secondary. Built as a monorepo with:

- **backend/** - Next.js app (TypeScript, App Router) — serves both the web UI and API routes
- **mobile/** - React Native Expo app (TypeScript) — secondary, less actively developed
- **shared/** - Shared TypeScript types between mobile and backend

## Development Commands

### Backend (Next.js API)
```bash
cd backend
npm run dev        # http://localhost:3000
npm run build
npm run start
```

### Mobile (React Native Expo)
```bash
cd mobile
npx expo start     # Scan QR with Expo Go
npm run android    # Android emulator
npm run ios        # iOS simulator (macOS only)
```

### Building for Personal Use
```bash
cd mobile
eas build --platform android --profile production  # APK for sideloading
eas build --platform ios --profile production      # TestFlight distribution
```

## Architecture

### Request Flow
```
Browser (Next.js web UI) → Next.js API Routes → Neon Postgres
React Native App        →         ↓
                              Claude API (OCR)
                                   ↓
                              Cloudinary (Images)
```

### Key Technologies
- **Database**: Neon Postgres (serverless)
- **Auth**: Clerk (web via `@clerk/nextjs`, mobile via `@clerk/clerk-expo`)
- **AI/OCR**: Claude API (Anthropic, `claude-haiku-4-5-20251001`) for bill text extraction
- **Notifications**: Expo Push Notifications
- **Storage**: Cloudinary for bill images
- **Deployment**: Backend (web + API) on Vercel, mobile via EAS

## Code Architecture

### Shared Types (shared/types.ts)
All data models are defined in `shared/types.ts` and imported by both mobile and backend. When adding new API endpoints or modifying data structures:
1. Update types in `shared/types.ts` first
2. Import into backend API routes
3. Import into mobile app API client

### Web UI Structure (`backend/app/(web)/`)
- **`/dashboard`** - Bills list with All/Unpaid/Paid filter tabs (defaults to Unpaid)
- **`/bills/new`** - Upload a bill photo, trigger OCR, confirm/edit extracted data
- **`/bills/[id]`** - Bill detail view
- **`/planner`** - Day planner with time-blocking for today
- Shared layout with nav bar and Clerk `UserButton`

### Backend API Structure
- **App Router**: Next.js app directory, no `src/` directory
- **API Routes**: Located in `backend/app/api/`
  - `bills/route.ts` - Bill CRUD operations
  - `bills/extract/route.ts` - OCR extraction via Claude
  - `time-blocks/` - Planner CRUD
  - `notifications/register/` - Push token registration
  - `cron/check-bills/` - Due date notification cron
- **Auth**: Clerk middleware protects all web and API routes

### Mobile App Structure
- Uses Expo managed workflow (not bare)
- Camera access via `expo-camera`, notifications via `expo-notifications`
- Less actively developed — web app is the primary interface

### Database Schema
See `DATABASE.md` for full schema. Key tables:
- **bills**: id, user_id, amount, due_date, image_url, status, timestamps
- **push_tokens**: user_id, token, timestamps

Indexes optimized for:
- Listing bills by user + due date (DESC)
- Filtering by status (paid/unpaid)

## Critical Implementation Details

### Bill Image Processing Flow
1. User uploads photo via `/bills/new` (web) or camera (mobile)
2. Image uploaded to Cloudinary, URL sent to `/api/bills/extract`
3. Backend sends image to Claude API with extraction prompt
4. Claude returns structured JSON: `{balance, minimum_due, due_date, description, confidence}`
5. User confirms/edits extracted data, then saves via POST `/api/bills`

### Authentication
- Clerk handles auth for both web and mobile
- User ID from Clerk stored as `user_id` in all tables
- Web uses `@clerk/nextjs`, mobile uses `@clerk/clerk-expo`

### Notification System
Daily CRON job (Vercel Cron or separate service):
1. Query bills with `due_date = CURRENT_DATE + 5`
2. Lookup user's push token
3. Send via Expo Push API
4. Handle notification tap → deep link to bill detail

## Environment Configuration

### Backend (.env.local)
- `DATABASE_URL` - Neon connection string
- `ANTHROPIC_API_KEY` - Claude API key
- `CLERK_SECRET_KEY` - Auth
- `CLOUDINARY_*` - Image storage credentials
- `EXPO_ACCESS_TOKEN` - For sending push notifications

### Mobile (.env)
- `EXPO_PUBLIC_API_URL` - Backend URL (localhost:3000 dev, production URL)
- `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` - Auth

## Testing Locally

### Web (primary)
1. `cd backend && npm run dev`
2. Open http://localhost:3000

### Mobile (secondary)
1. Start backend first (above)
2. Update `mobile/.env` with `EXPO_PUBLIC_API_URL=http://<local-ip>:3000`
3. `cd mobile && npx expo start`
4. Use Expo Go or a development build

**Note**: Camera and notifications require a development build or physical device.

## Database Migrations

No migration framework currently. Execute SQL directly in Neon dashboard or add Drizzle/Prisma later.

## Common Pitfalls

- **Mobile CORS**: Backend must allow requests from the mobile app (configured in Next.js)
- **Mobile dev URLs**: Use your local IP (not `localhost`) when testing on a physical device
- **iOS Camera**: Requires `NSCameraUsageDescription` in `app.json` (already configured)
- **Android Permissions**: Camera + notifications need manifest permissions (configured)
- **EAS Build**: Requires Expo account and `eas-cli` installed globally

## Personal Deployment

This is a personal app - no app store submission required:
- **Android**: Install APK directly ("Unknown Sources" enabled)
- **iOS**: TestFlight (requires Apple Developer $99/year) or Ad Hoc provisioning
