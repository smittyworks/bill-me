-- Migration: Add push_tokens table for notification support
-- Run this in your Neon SQL Editor

CREATE TABLE push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  token TEXT NOT NULL,
  device_id TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_push_tokens_user ON push_tokens(user_id);
