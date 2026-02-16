# Next Steps

Follow these steps to get your Bill Me app running:

## 1. Set Up Database (5 minutes)

1. Create a Neon account: https://neon.tech
2. Create a new project
3. Copy the connection string
4. Run the SQL from `DATABASE.md` in the Neon SQL Editor

## 2. Set Up Authentication (10 minutes)

1. Create a Clerk account: https://clerk.com
2. Create a new application
3. Enable email/password authentication (or Google/Apple)
4. Copy the API keys from Dashboard → API Keys

## 3. Get AI API Access (5 minutes)

1. Create Anthropic account: https://console.anthropic.com
2. Generate an API key
3. Add credits to your account

## 4. Configure Backend (5 minutes)

```bash
cd backend
cp .env.example .env.local
```

Edit `.env.local` and add:
- `DATABASE_URL` from Neon
- `ANTHROPIC_API_KEY` from Anthropic
- `CLERK_SECRET_KEY` and `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` from Clerk

Install dependencies and start:
```bash
npm install
npm run dev
```

Verify it's running: http://localhost:3000

## 5. Configure Mobile App (5 minutes)

```bash
cd mobile
cp .env.example .env
```

Edit `.env` and add:
- `EXPO_PUBLIC_API_URL=http://localhost:3000` (for local dev)
- `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` from Clerk

Install dependencies:
```bash
npm install
npx expo install expo-camera expo-notifications @clerk/clerk-expo
```

Start Expo:
```bash
npx expo start
```

Scan QR code with Expo Go app.

## 6. First Feature to Build

Start with authentication and basic bill listing:

1. **Backend**: Add Clerk middleware to API routes
2. **Mobile**: Add Clerk provider and login screen
3. **Backend**: Implement `GET /api/bills` (query database)
4. **Mobile**: Create bills list screen
5. Test authentication flow end-to-end

## 7. Then Build Camera + OCR

1. **Mobile**: Add camera screen with `expo-camera`
2. **Backend**: Add image upload endpoint (Cloudinary)
3. **Backend**: Add Claude API integration for OCR
4. **Backend**: Implement `POST /api/bills`
5. **Mobile**: Connect camera → upload → save flow

## 8. Finally Add Notifications

1. **Mobile**: Request notification permissions
2. **Mobile**: Register push token with backend
3. **Backend**: Store push tokens in database
4. **Backend**: Create CRON job (Vercel Cron)
5. Test notifications locally

## Optional: Deploy Backend

```bash
cd backend
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
```

Update mobile `.env`:
```
EXPO_PUBLIC_API_URL=https://your-app.vercel.app
```

## Need Help?

- See `README.md` for full documentation
- See `CLAUDE.md` for architecture details
- See `DATABASE.md` for schema reference
