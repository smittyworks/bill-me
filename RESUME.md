# How to Resume This Project

If you're picking this up in a new session, here's everything you need to know.

## Project Location
```
/Users/geoffsmith/development/mobile/bill-me/bill-me/
```

## What's Built

### Phase 1 & 2 Complete ✅
- Full authentication (Clerk)
- Camera-based bill capture
- AI extraction (Claude API)
- Bills list with due dates
- Database storage (Neon Postgres)

## Quick Start

### 1. Start Backend
```bash
cd /Users/geoffsmith/development/mobile/bill-me/bill-me/backend
npm run dev
```

Should see: `▲ Next.js ... - Local: http://localhost:3000`

### 2. Start Mobile
```bash
cd /Users/geoffsmith/development/mobile/bill-me/bill-me/mobile
npx expo start
```

Scan QR with iPhone Camera → opens in Expo Go

## Key Files to Know

### Documentation
- `STATUS.md` - Current project status
- `CLAUDE.md` - Architecture guide for AI assistants
- `DATABASE.md` - Database schema
- `PHASE2_COMPLETE.md` - Latest completion notes
- `README.md` - Full setup instructions

### Backend (`backend/`)
- `app/api/bills/route.ts` - GET/POST bills endpoints
- `app/api/bills/[id]/route.ts` - GET/PATCH/DELETE single bill
- `lib/claude.ts` - Claude AI integration for OCR
- `lib/db.ts` - Neon database client
- `middleware.ts` - Clerk authentication

### Mobile (`mobile/`)
- `App.tsx` - Main app with state-based navigation
- `screens/SignInScreen.tsx` - Email/password login
- `screens/SignUpScreen.tsx` - Account creation
- `screens/BillsListScreen.tsx` - Main bills list
- `screens/CameraScreen.tsx` - Photo capture + upload
- `lib/api.ts` - API client with auth

### Configuration
- `backend/.env.local` - Database, Clerk, Anthropic keys
- `mobile/.env` - API URL (192.168.68.139:3000), Clerk key

## Important Notes

### Known Issues/Workarounds
1. **Navigation**: Using state-based nav instead of React Navigation (hooks conflicts)
2. **Network**: Mobile uses `192.168.68.139:3000`, not `localhost:3000`
3. **SQL Syntax**: Neon requires tagged templates: `sql\`SELECT * FROM bills\``
4. **Claude Model**: Using `claude-3-haiku-20240307`
5. **Clerk Email**: Verification disabled for development

### Environment Setup
- Node.js v21.7.1
- Backend on http://localhost:3000 (or 192.168.68.139:3000 from phone)
- Mobile via Expo Go app

## What's Next: Phase 3

Push notifications system:
1. Expo notifications permissions
2. Store push tokens
3. Vercel Cron job (daily check)
4. Send reminders 5 days before due date

## Troubleshooting

**"Failed to fetch bills"**
- Backend not running: `cd backend && npm run dev`
- Wrong IP in `mobile/.env`: Should be `192.168.68.139:3000`
- Database not set up: Check `DATABASE.md`

**"Camera not working"**
- Reload app after installing new packages
- Check permissions granted in iOS settings

**"Claude API error"**
- Check `ANTHROPIC_API_KEY` in `backend/.env.local`
- Verify credits at https://console.anthropic.com
- Restart backend after changing .env

**"React hooks error"**
- Already fixed with state-based navigation
- If issue returns, check `App.tsx` - all `useState` must be at top level

## Database Schema
```sql
CREATE TABLE bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE NOT NULL,
  image_url TEXT,
  description TEXT,
  status TEXT DEFAULT 'unpaid',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## API Endpoints

**Public:**
- `GET /api/health` - Health check

**Protected (requires Clerk auth):**
- `GET /api/bills?status=paid|unpaid` - List bills
- `POST /api/bills` - Create bill from image
- `GET /api/bills/:id` - Get single bill
- `PATCH /api/bills/:id` - Update bill
- `DELETE /api/bills/:id` - Delete bill

## Tech Stack
- **Mobile**: React Native + Expo (managed workflow)
- **Backend**: Next.js 16 (App Router)
- **Database**: Neon Postgres (serverless)
- **Auth**: Clerk
- **AI**: Anthropic Claude API
- **Deployment**: Backend on Vercel (not deployed yet), Mobile via EAS (not built yet)

## Useful Commands

```bash
# Find your local IP (for mobile .env)
ifconfig | grep "inet " | grep -v 127.0.0.1

# Check backend logs
# Terminal where npm run dev is running

# Reload mobile app
# Shake phone → Reload, or press 'r' in Expo terminal

# Install new mobile package
cd mobile
npm install <package> --legacy-peer-deps

# Rebuild after package install
# Just reload the app in Expo Go
```

## Current Test Account
You have at least one test account created (email used during testing).
Check Clerk dashboard for details.

## Files Modified from Defaults
- All code is custom except standard Expo/Next.js scaffolding
- No `.gitignore` excludes code files
- Safe to commit everything except `.env*` files
