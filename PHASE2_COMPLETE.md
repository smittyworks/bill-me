# Phase 2 Complete: Camera + OCR

## ✅ What's Been Built

### Mobile App
- **Camera Screen** - Take photos or choose from library
- **Image Upload** - Sends base64-encoded image to backend
- **Navigation** - FAB button opens camera, auto-closes on success
- **Auto-refresh** - Bills list refreshes after creating a bill

### Backend API
- **Claude AI Integration** - Extracts amount, due date, description from bill images
- **POST /api/bills** - Creates bill with OCR data
- **Database Insert** - Saves bills to Postgres

## 📋 Setup Required

Before you can test, you need to configure:

### 1. Neon Database (Required)

1. Go to https://neon.tech and create account
2. Create a new project
3. In SQL Editor, run this:

```sql
CREATE TABLE bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE NOT NULL,
  image_url TEXT,
  description TEXT,
  status TEXT DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'paid')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_bills_user_due ON bills(user_id, due_date DESC);
CREATE INDEX idx_bills_status ON bills(user_id, status, due_date);
```

4. Copy connection string from dashboard

### 2. Anthropic API Key (Required)

1. Go to https://console.anthropic.com
2. Sign up/login
3. Go to "API Keys"
4. Create a new key
5. Add some credits ($5 minimum)

### 3. Backend Environment Variables

Update `backend/.env.local`:

```bash
# Already configured
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."

# Add these:
DATABASE_URL="postgresql://[your-neon-connection-string]"
ANTHROPIC_API_KEY="sk-ant-..."
```

### 4. Restart Backend

```bash
cd backend
npm run dev
```

## 🧪 Testing

1. **Make sure backend is running** (`cd backend && npm run dev`)
2. **Reload mobile app** (shake phone → Reload)
3. **Tap the + button** in Bills List
4. **Take a photo** of a real bill or invoice
   - Make sure amount and due date are visible
   - Or choose a photo from your library
5. **Tap "Process Bill"**
6. Wait 2-3 seconds for Claude to analyze
7. You should see "Success!" alert
8. Bills list automatically refreshes and shows your new bill!

## 🎯 What Works Now

- ✅ Photo capture from camera or library
- ✅ Image sent to backend as base64
- ✅ Claude API extracts:
  - Amount (e.g., $45.67)
  - Due date (e.g., 2026-03-15)
  - Description (e.g., "Electric Bill")
- ✅ Bill saved to database
- ✅ Shows in bills list sorted by due date
- ✅ Days until due calculated
- ✅ Overdue bills highlighted in red

## 🐛 Troubleshooting

### "Failed to create bill"
- Check backend logs for Claude API errors
- Make sure ANTHROPIC_API_KEY is set correctly
- Ensure you have credits in Anthropic account

### "Failed to fetch bills"
- Check DATABASE_URL is correct
- Make sure you ran the SQL to create tables
- Check backend logs for database errors

### Image doesn't process
- Make sure the photo is clear and well-lit
- Amount and date should be clearly visible
- Try a different bill if OCR fails

## 📝 Notes

- Images are stored as base64 in database (not ideal for production, but works for personal use)
- Claude can handle various bill formats
- Confidence level returned but not shown to user yet
- No manual editing yet - if OCR fails, you'd need to retake photo

## 🚀 Next: Phase 3 - Notifications

Ready to add push notifications so you get reminded 5 days before bills are due?
