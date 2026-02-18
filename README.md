# Bill Me

Track bills by taking photos, extracting due dates and amounts using AI, and receiving timely reminders.

Available as both a **web app** and a **native mobile app** (iOS/Android).

## Project Structure

```
bill-me/
├── mobile/          # React Native Expo app (iOS/Android)
├── backend/         # Next.js — web app UI + shared API backend
├── shared/          # Shared TypeScript types
├── DATABASE.md      # Database schema and setup
└── README.md        # This file
```

## Tech Stack

- **Web + API**: Next.js (App Router) — serves both the web UI and API routes
- **Mobile**: React Native + Expo
- **Database**: Neon Postgres
- **AI/OCR**: Claude API (Anthropic)
- **Auth**: Clerk
- **Notifications**: Slack (web) + Expo Push Notifications (mobile)

---

## Quick Start

### Backend / Web App

```bash
cd backend
npm install
cp .env.example .env.local   # then fill in values
npm run dev
# Web app: http://localhost:3000
```

On iPhone (local dev): connect to the same WiFi as your Mac and open `http://<your-mac-ip>:3000` in Safari. The IP is printed as "Network" when the dev server starts.

### Mobile App

```bash
cd mobile
npm install
cp .env.example .env         # then fill in values
npx expo start
# Scan QR code with Expo Go app
```

---

## Environment Variables

### Backend (`backend/.env.local`)

| Variable | Description |
|---|---|
| `DATABASE_URL` | Neon Postgres connection string |
| `ANTHROPIC_API_KEY` | Claude API key for bill OCR |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `SLACK_WEBHOOK_URL` | Slack incoming webhook for bill reminders |
| `EXPO_ACCESS_TOKEN` | Expo token for mobile push notifications |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | `/dashboard` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | `/dashboard` |

### Mobile (`mobile/.env`)

| Variable | Description |
|---|---|
| `EXPO_PUBLIC_API_URL` | Backend URL (`http://localhost:3000` for dev) |
| `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |

---

## Features

- **Camera capture** — take a photo of a bill (web + mobile)
- **AI extraction** — Claude reads balance, minimum due, due date, and description
- **Review & confirm** — edit extracted data before saving
- **Bill list** — filter by paid/unpaid, sorted by due date with overdue highlighting
- **Mark paid** — one tap to mark a bill as paid
- **Reminders** — daily cron notifies via Slack (web) and push notification (mobile) for unpaid bills due within 5 days, and up to 5 days after the due date

## Notifications

The daily cron runs at **10am Pacific** (configured in `vercel.json`). It fires for all unpaid bills within a ±5 day window of the due date.

To test locally:
```
GET http://localhost:3000/api/cron/check-bills
```

To set up Slack reminders: create an incoming webhook at https://api.slack.com/messaging/webhooks and add the URL as `SLACK_WEBHOOK_URL`.

## API Endpoints

### Bills
- `GET /api/bills` — list bills (optional `?status=paid|unpaid`)
- `POST /api/bills` — create bill from image (runs OCR)
- `POST /api/bills/extract` — extract data from image without saving
- `GET /api/bills/:id` — get single bill
- `PATCH /api/bills/:id` — update bill
- `DELETE /api/bills/:id` — delete bill

### Notifications
- `POST /api/notifications/register` — register Expo push token (mobile)
- `GET /api/cron/check-bills` — trigger reminders (called by Vercel Cron)

## Theming

The color scheme is defined in `backend/app/globals.css` under the `/* BRAND THEME */` block. Change the CSS custom property values there to swap the palette.

## Building for Personal Use

### Mobile — Android APK
```bash
cd mobile && eas build --platform android --profile production
```

### Mobile — iOS (TestFlight)
```bash
cd mobile && eas build --platform ios --profile production
```
Requires Apple Developer account ($99/year).

## Database

See [DATABASE.md](./DATABASE.md) for schema and setup instructions.

## License

Personal use only.
