-- Fix profiles table ID default value
-- The current default 'auth.uid()' fails when inserted via admin client.
-- Changing it to 'gen_random_uuid()' or 'uuid_generate_v4()'.

-- Enable uuid-ossp just in case
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Alter profiles table
ALTER TABLE public.profiles 
ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- Double check crews table as well
ALTER TABLE public.crews 
ALTER COLUMN id SET DEFAULT uuid_generate_v4();
