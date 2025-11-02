-- Add rich detail fields to projects table to match the sample structure
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS full_description TEXT,
ADD COLUMN IF NOT EXISTS requirements TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS resources TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS duration TEXT,
ADD COLUMN IF NOT EXISTS contributors_count INTEGER DEFAULT 0;