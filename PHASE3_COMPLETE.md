# Phase 3 Complete: Push Notifications

## ✅ What's Been Built

### Database
- **push_tokens table** - Stores Expo push tokens for each user (no device_id column)
- Schema: `id, user_id (UNIQUE), token, created_at, updated_at`
- Upsert support - Updates token if user re-registers

### Mobile App
- **Notification permissions** - Requests on app launch
- **Token registration** - Auto-registers push token with backend
- **expo-notifications** - Configured with notification handler
- **Device detection** - Only requests on physical devices (not simulator)
- **EAS Project** - Configured with real projectId from eas init

### Backend API
- **POST /api/notifications/register** - Register/update push token (without device_id)
- **GET /api/cron/check-bills** - Daily check for bills due in 5 days (PUBLIC route)
- **Notification utilities** (`lib/notifications.ts`) - Send push notifications via Expo
- **Vercel Cron** configuration - Runs daily at 9am UTC
- **Middleware updated** - Cron endpoint is public (no auth required)

## 📋 Setup Already Completed

### 1. ✅ Push Tokens Table Created

Table exists in Neon with schema:
```sql
CREATE TABLE push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  token TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_push_tokens_user ON push_tokens(user_id);
```

**Note**: No `device_id` column - backend code updated to not use it.

### 2. ✅ EAS Project Configured

Already completed:
```bash
npm install -g eas-cli
eas login
eas init
```

Result: `app.json` now contains:
```json
"extra": {
  "eas": {
    "projectId": "60ab5dcb-2ab8-4c4e-9268-49c57d3921ed"
  }
},
"owner": "smittyworks"
```

### 3. ✅ Mobile Notification Config

`mobile/lib/notifications.ts` is configured to use projectId from app.json:
```typescript
const projectId = Constants.expoConfig?.extra?.eas?.projectId;
token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
```

### 4. ✅ Middleware Updated

`backend/middleware.ts` allows public access to cron endpoint:
```typescript
const isPublicRoute = createRouteMatcher([
  '/',
  '/api/health',
  '/api/cron/check-bills',  // Added for Vercel Cron
]);
```

## 🧪 Testing Notifications

### Test 1: Permission & Registration ✅

1. **Start both servers**:
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Mobile
   cd mobile
   npx expo start
   ```

2. **Open app in Expo Go on iPhone**
3. **Grant notification permission** when prompted
4. **Check backend logs** - should see:
   ```
   POST /api/notifications/register 200
   ```
5. **Check Neon database**:
   ```sql
   SELECT * FROM push_tokens;
   ```
   Should show your user_id and push token starting with `ExponentPushToken[...]`

### Test 2: Manual Notification (Local Testing) ✅

**IMPORTANT**: Make sure the `user_id` in your test bill matches the `user_id` in `push_tokens` table exactly (including `user_` prefix).

1. **Get your correct user_id**:
   ```sql
   SELECT user_id FROM push_tokens;
   ```
   Copy this value (e.g., `user_2abcdefgh...`)

2. **Create a test bill** with due date = today + 5 days:
   ```sql
   INSERT INTO bills (user_id, balance, minimum_due, due_date, description, status)
   VALUES ('user_2abcdefgh...', 150.00, 50.00, CURRENT_DATE + INTERVAL '5 days', 'Test Electric Bill', 'unpaid');
   ```
   **Replace** `'user_2abcdefgh...'` with your actual user_id from step 1.

3. **Verify the bill was created correctly**:
   ```sql
   SELECT
     b.description,
     b.due_date,
     b.user_id,
     p.user_id as push_user_id,
     p.token
   FROM bills b
   INNER JOIN push_tokens p ON b.user_id = p.user_id
   WHERE b.due_date = CURRENT_DATE + INTERVAL '5 days'
     AND b.status = 'unpaid';
   ```
   This should return 1 row with your test bill and push token.

4. **Call the cron endpoint** in any browser (phone or computer):
   ```
   http://192.168.68.139:3000/api/cron/check-bills
   ```
   **Note**: Use your local IP, not localhost

5. **Check response** - should show:
   ```json
   {
     "message": "Reminders sent",
     "count": 1,
     "bills": [{
       "description": "Test Electric Bill",
       "balance": 150,
       "dueDate": "2026-02-20T08:00:00.000Z"
     }]
   }
   ```

6. **Check your iPhone** - you should receive push notification:
   ```
   Title: Bill Due in 5 Days
   Body: Test Electric Bill: $150.00 (Min: $50.00)
   ```

### Test 3: Production Cron (After Deployment)

Once deployed to Vercel:
- Cron runs automatically at 9am UTC daily
- Check Vercel logs to see execution
- Can manually trigger via Vercel dashboard

## 🎯 How It Works

### Daily Flow
1. **9am UTC daily** - Vercel Cron triggers `/api/cron/check-bills`
2. **Query database** - Find all unpaid bills due in exactly 5 days
3. **Join with push_tokens** - Get user's Expo push token
4. **Send notifications** - Via Expo Push Notification service
5. **User sees notification** - "{Bill}: $XX.XX (Min: $YY.YY)"

### Notification Format
```
Title: Bill Due in 5 Days
Body: Electric Bill: $125.50 (Min: $25.00)
```

### When Notifications Are Sent
- Only for **unpaid** bills
- Only when due date is **exactly 5 days away**
- Only if user has **registered push token**
- Runs **once per day** at 9am UTC

## 🐛 Troubleshooting

### "Must use physical device for Push Notifications"
- Expo Go on simulators doesn't support push notifications
- Use physical iPhone to test
- Or create a development build with `eas build --profile development`

### "No projectId found" or "Experience does not exist"
**Solution**: Run `eas init` to create real EAS project
```bash
cd mobile
npm install -g eas-cli
eas login
eas init
```
This adds a real `projectId` to `app.json` that Expo recognizes.

### "column device_id does not exist"
**Solution**: Backend was updated to NOT use `device_id` column. If you see this error:
- Make sure `backend/app/api/notifications/register/route.ts` doesn't reference `device_id`
- Restart backend server

### "No bills due in 5 days" (but you created a test bill)
**Common causes**:

1. **User ID mismatch** (most common):
   - Bills table has different `user_id` than push_tokens table
   - Solution: Check both tables have exact same user_id:
     ```sql
     SELECT user_id FROM push_tokens;
     SELECT DISTINCT user_id FROM bills;
     ```
   - Update test bill to use correct user_id from push_tokens

2. **Wrong due date**:
   - Verify bill is exactly 5 days from today:
     ```sql
     SELECT
       description,
       due_date,
       CURRENT_DATE + INTERVAL '5 days' as should_be
     FROM bills
     WHERE status = 'unpaid';
     ```

3. **Bill status not 'unpaid'**:
   - Check: `SELECT description, status FROM bills;`
   - Update: `UPDATE bills SET status = 'unpaid' WHERE description = 'Test Bill';`

### Cron endpoint redirects to login page
**Solution**: Make sure `/api/cron/check-bills` is in public routes list in `backend/middleware.ts`:
```typescript
const isPublicRoute = createRouteMatcher([
  '/',
  '/api/health',
  '/api/cron/check-bills',
]);
```
Restart backend after updating.

## 📝 Production Deployment Notes

### Vercel Deployment
1. Deploy backend: `vercel` from backend directory
2. Cron job automatically configured via `vercel.json`
3. Add all environment variables in Vercel dashboard
4. Cron logs visible in Vercel dashboard

### EAS Build (Mobile)
For production notifications:
```bash
cd mobile
eas build --platform ios --profile production
```

Distribute via TestFlight (iOS) or direct APK (Android).

## 🚀 What's Complete

- ✅ Push token registration
- ✅ Daily cron job checking
- ✅ Notification sending
- ✅ 5-day advance warning
- ✅ Shows balance and minimum due
- ✅ Works with multiple users

## 📱 Features Not Yet Implemented

- [ ] Handle notification tap (deep link to bill detail)
- [ ] Notification when bill becomes overdue
- [ ] Custom notification time preference
- [ ] Test notification button in UI
- [ ] Notification history/log

## 🎊 Project Status

All 3 phases complete:
- ✅ Phase 1: Authentication
- ✅ Phase 2: Camera + OCR
- ✅ Phase 3: Notifications

Your bill tracking app is fully functional for personal use!
