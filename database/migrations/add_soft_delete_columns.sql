-- Migration script to add soft delete functionality to existing tables
-- This adds deleted_at columns to all relevant tables

-- Add deleted_at column to company table
ALTER TABLE company ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
CREATE INDEX IF NOT EXISTS idx_company_deleted_at ON company(deleted_at);

-- Add deleted_at column to user table
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
CREATE INDEX IF NOT EXISTS idx_user_deleted_at ON "user"(deleted_at);

-- Add deleted_at column to raw_data table
ALTER TABLE raw_data ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
CREATE INDEX IF NOT EXISTS idx_raw_data_deleted_at ON raw_data(deleted_at);

-- Add deleted_at column to claimant table
ALTER TABLE claimant ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
CREATE INDEX IF NOT EXISTS idx_claimant_deleted_at ON claimant(deleted_at);

-- Add deleted_at column to claim_type table
ALTER TABLE claim_type ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
CREATE INDEX IF NOT EXISTS idx_claim_type_deleted_at ON claim_type(deleted_at);

-- Add deleted_at column to claim table
ALTER TABLE claim ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
CREATE INDEX IF NOT EXISTS idx_claim_deleted_at ON claim(deleted_at);

-- Add deleted_at column to role table
ALTER TABLE role ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
CREATE INDEX IF NOT EXISTS idx_role_deleted_at ON role(deleted_at);

-- Create a helper function for soft delete queries
CREATE OR REPLACE FUNCTION is_not_deleted(deleted_at TIMESTAMPTZ)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Note: We don't add deleted_at to role_permission since it uses ON DELETE CASCADE
-- Note: We don't add deleted_at to log since logs should never be deleted
-- Note: We don't add deleted_at to reject since rejected data is already filtered out
