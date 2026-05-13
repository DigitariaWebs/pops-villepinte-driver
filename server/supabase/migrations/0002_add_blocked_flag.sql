-- Add is_blocked flag to profiles for account suspension
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_blocked boolean NOT NULL DEFAULT false;
