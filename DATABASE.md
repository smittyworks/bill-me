# Database Schema

This project uses Neon Postgres for the database.

## Setup

1. Create a new Neon project at https://neon.tech
2. Copy the connection string
3. Add to `.env.local` in the backend directory:
   ```
   DATABASE_URL="postgresql://..."
   ```

## Schema

### bills table

```sql
CREATE TABLE bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  balance DECIMAL(10,2) NOT NULL,
  minimum_due DECIMAL(10,2) NOT NULL,
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

### push_tokens table (for notifications)

```sql
CREATE TABLE push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  token TEXT NOT NULL,
  device_id TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_push_tokens_user ON push_tokens(user_id);
```

## Running Migrations

Execute the SQL statements above in your Neon dashboard or using a migration tool.
