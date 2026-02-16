# Bill Me

A mobile app for tracking bills by taking photos, extracting due dates and amounts using AI, and receiving timely reminders.

**Status**: ✅ All features complete and working! See `CURRENT_STATUS.md` for details.

## Quick Start

### Clone the Repository
```bash
git clone git@github.com:smittyworks/bill-me.git
cd bill-me
```

### Start Development

```bash
# Terminal 1 - Backend
cd backend
npm install
npm run dev

# Terminal 2 - Mobile
cd mobile
npm install
npx expo start
# Scan QR code with Expo Go app on iPhone
```

See detailed setup instructions below if this is your first time.

## Project Structure

```
bill-me/
├── mobile/          # React Native Expo app
├── backend/         # Next.js API backend
├── shared/          # Shared TypeScript types
├── DATABASE.md      # Database schema and setup
└── README.md        # This file
```

## Tech Stack

- **Mobile**: React Native + Expo
- **Backend**: Next.js API Routes
- **Database**: Neon Postgres
- **AI/OCR**: Claude API (Anthropic)
- **Auth**: Clerk
- **Notifications**: Expo Push Notifications
- **Storage**: Cloudinary or Vercel Blob

## Quick Start

### Prerequisites

- Node.js 20+ (you have 21.7.1)
- npm or yarn
- Expo Go app (for development) or EAS CLI (for builds)
- Neon account (https://neon.tech)
- Clerk account (https://clerk.com)
- Anthropic API key (https://console.anthropic.com)

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env.local` file:
   ```bash
   cp .env.example .env.local
   ```

4. Add your environment variables to `.env.local`:
   - `DATABASE_URL` - Neon Postgres connection string
   - `ANTHROPIC_API_KEY` - Claude API key
   - `CLERK_SECRET_KEY` - Clerk secret key
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk publishable key

5. Set up the database (see DATABASE.md)

6. Run development server:
   ```bash
   npm run dev
   ```

   Backend will run on http://localhost:3000

### Mobile App Setup

1. Navigate to mobile directory:
   ```bash
   cd mobile
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file:
   ```bash
   cp .env.example .env
   ```

4. Add your environment variables:
   - `EXPO_PUBLIC_API_URL` - Backend API URL (http://localhost:3000 for dev)
   - `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk publishable key

5. Start Expo development server:
   ```bash
   npx expo start
   ```

6. Scan QR code with Expo Go app (iOS/Android)

## Development Commands

### Backend
```bash
cd backend
npm run dev       # Start development server
npm run build     # Build for production
npm run start     # Start production server
```

### Mobile
```bash
cd mobile
npx expo start    # Start development server
npm run android   # Run on Android emulator
npm run ios       # Run on iOS simulator (macOS only)
```

## Building for Personal Use

### Android (APK)
```bash
cd mobile
eas build --platform android --profile production
```
Download the APK and install on your Android device.

### iOS (TestFlight)
```bash
cd mobile
eas build --platform ios --profile production
```
Requires Apple Developer account ($99/year). Distribute via TestFlight.

## ✅ Completed Features (All Phases Done!)

- ✅ **Camera capture for bill photos** - Uses expo-image-picker
- ✅ **Claude API integration for OCR** - Extracts balance, minimum_due, due_date, description
- ✅ **Bill CRUD operations** - Full API implementation
- ✅ **Bill list with sorting/filtering** - Display by due date
- ✅ **Push notification setup** - Expo Push Notifications with EAS
- ✅ **Daily CRON job for reminders** - Configured for 5 days before due
- ✅ **Mark bills as paid** - Status field in database
- ✅ **Authentication with Clerk** - Sign up, sign in, sessions

**Status**: Fully functional for personal use! See `CURRENT_STATUS.md` for setup details.

## 📚 Documentation

- **CURRENT_STATUS.md** - Current state, how to resume work, configuration
- **PHASE3_COMPLETE.md** - Push notification setup and testing guide
- **DATABASE.md** - Database schema and migrations

## API Endpoints

### Bills
- `GET /api/bills` - List all bills for authenticated user
- `POST /api/bills` - Create new bill from image
- `GET /api/bills/:id` - Get single bill
- `PATCH /api/bills/:id` - Update bill (mark paid, edit details)
- `DELETE /api/bills/:id` - Delete bill

### Notifications
- `POST /api/notifications/register` - Register push token
- `POST /api/notifications/test` - Test notification (dev only)

## Environment Variables

See `.env.example` files in both `backend/` and `mobile/` directories.

## Database

See [DATABASE.md](./DATABASE.md) for schema and setup instructions.

## License

Personal use only.
