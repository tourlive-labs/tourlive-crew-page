-- 1. Identify and Drop incorrect Foreign Key on profiles.id
-- This allows profiles.id to be a random UUID as expected by schema.sql
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- 2. Ensure crew_id column exists and has correct constraint
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS crew_id UUID UNIQUE;

-- Add the Foreign Key reference to crews.id
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_crew_id_fkey
FOREIGN KEY (crew_id) REFERENCES public.crews(id) ON DELETE CASCADE;

-- 3. Just in case, fix common auth-related defaults
ALTER TABLE public.profiles ALTER COLUMN id SET DEFAULT uuid_generate_v4();
