-- Migration to add soft delete functionality
-- Adds deleted_at column to relevant tables

-- Add deleted_at column to primary tables
ALTER TABLE company ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE claim_type ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE role ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Add deleted_at column to secondary tables
ALTER TABLE claimant ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE raw_data ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE claim ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Create indexes for performance on commonly queried tables
CREATE INDEX IF NOT EXISTS idx_company_deleted_at ON company(deleted_at);
CREATE INDEX IF NOT EXISTS idx_user_deleted_at ON "user"(deleted_at);
CREATE INDEX IF NOT EXISTS idx_claim_type_deleted_at ON claim_type(deleted_at);
CREATE INDEX IF NOT EXISTS idx_claim_deleted_at ON claim(deleted_at);

-- Create a function to help with soft delete queries
CREATE OR REPLACE FUNCTION is_not_deleted(deleted_at TIMESTAMPTZ)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
