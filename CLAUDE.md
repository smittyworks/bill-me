# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Bill Me is a personal mobile app for tracking bills via photo capture, AI-powered OCR, and push notification reminders. Built as a monorepo with:

- **mobile/** - React Native Expo app (TypeScript)
- **backend/** - Next.js API backend (TypeScript, App Router)
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
React Native App → Next.js API Routes → Neon Postgres
                        ↓
                   Claude API (OCR)
                        ↓
                   Cloudinary (Images)
```

### Key Technologies
- **Database**: Neon Postgres (serverless)
- **Auth**: Clerk (handles both mobile + backend)
- **AI/OCR**: Claude API (Anthropic) for bill text extraction
- **Notifications**: Expo Push Notifications
- **Storage**: Cloudinary or Vercel Blob for bill images
- **Deployment**: Backend on Vercel, mobile via EAS

## Code Architecture

### Shared Types (shared/types.ts)
All data models are defined in `shared/types.ts` and imported by both mobile and backend. When adding new API endpoints or modifying data structures:
1. Update types in `shared/types.ts` first
2. Import into backend API routes
3. Import into mobile app API client

### Backend API Structure
- **App Router**: Uses Next.js 13+ app directory structure
- **API Routes**: Located in `backend/app/api/`
  - `bills/route.ts` - Bill CRUD operations
  - `notifications/` - Push token registration
- **No src/ directory**: Files at root of `backend/`
- **Auth Middleware**: Clerk auth wraps all protected routes

### Mobile App Structure
- Uses Expo managed workflow (not bare)
- Camera access via `expo-camera`
- Notifications via `expo-notifications`
- Navigation: To be implemented (React Navigation recommended)

### Database Schema
See `DATABASE.md` for full schema. Key tables:
- **bills**: id, user_id, amount, due_date, image_url, status, timestamps
- **push_tokens**: user_id, token, timestamps

Indexes optimized for:
- Listing bills by user + due date (DESC)
- Filtering by status (paid/unpaid)

## Critical Implementation Details

### Bill Image Processing Flow
1. Mobile app captures photo → uploads to Cloudinary
2. POST to `/api/bills` with image URL
3. Backend sends image to Claude API with extraction prompt
4. Claude returns structured JSON: `{amount, due_date, description}`
5. Store in database with `confidence` level
6. Return to mobile for user confirmation/editing

### Authentication
- Clerk handles JWT validation
- User ID from Clerk JWT stored as `user_id` in bills table
- All API routes must verify auth token
- Mobile app uses `@clerk/clerk-expo`

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

1. Start backend: `cd backend && npm run dev`
2. Update mobile `.env` with `EXPO_PUBLIC_API_URL=http://localhost:3000`
3. Start mobile: `cd mobile && npx expo start`
4. Use Expo Go or development build to test

**Note**: Camera and notifications require development build or physical device - won't work fully in Expo Go.

## Database Migrations

No migration framework currently. Execute SQL directly in Neon dashboard or add Drizzle/Prisma later.

## Common Pitfalls

- **CORS**: Backend must allow requests from mobile app (configured in Next.js)
- **iOS Camera**: Requires `NSCameraUsageDescription` in `app.json` (already configured)
- **Android Permissions**: Camera + notifications need manifest permissions (configured)
- **Development URLs**: Use your local IP (not localhost) when testing on physical device
- **EAS Build**: Requires Expo account and `eas-cli` installed globally

## Personal Deployment

This is a personal app - no app store submission required:
- **Android**: Install APK directly ("Unknown Sources" enabled)
- **iOS**: TestFlight (requires Apple Developer $99/year) or Ad Hoc provisioning
