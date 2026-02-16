-- Migration: Add minimum_due column and rename amount to balance
-- Run this in your Neon SQL Editor

-- Add minimum_due column (nullable for existing records)
ALTER TABLE bills ADD COLUMN minimum_due DECIMAL(10,2);

-- Rename amount to balance
ALTER TABLE bills RENAME COLUMN amount TO balance;

-- Update existing records to have minimum_due = balance (assuming full payment required)
-- You can adjust this logic as needed
UPDATE bills SET minimum_due = balance WHERE minimum_due IS NULL;

-- Make minimum_due NOT NULL after backfilling
ALTER TABLE bills ALTER COLUMN minimum_due SET NOT NULL;
