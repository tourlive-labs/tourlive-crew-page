-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Function to check if the current user is an admin
-- Relies on 'role' metadata in the JWT (as per rules: "use Supabase 'role' metadata")
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Batches Table
-- Tracks crew generations (Current: 14th)
CREATE TABLE public.batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    year INT NOT NULL,
    term INT NOT NULL, -- e.g., 14
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Batches are viewable by everyone" ON public.batches FOR SELECT USING (true);
CREATE POLICY "Admins can insert batches" ON public.batches FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update batches" ON public.batches FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete batches" ON public.batches FOR DELETE USING (public.is_admin());


-- 2. Crews Table
-- Member profiles linked to a specific Batch and auth.users
CREATE TABLE public.crews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    batch_id UUID REFERENCES public.batches(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.crews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Crews are viewable by everyone" ON public.crews FOR SELECT USING (true);
CREATE POLICY "Admins can insert crews" ON public.crews FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update crews" ON public.crews FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete crews" ON public.crews FOR DELETE USING (public.is_admin());

-- 2.5 Profiles Table
-- Extended profile information spanning contact and site activities.
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    crew_id UUID UNIQUE REFERENCES public.crews(id) ON DELETE CASCADE, -- One profile per crew
    full_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    tourlive_email TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    selected_activity TEXT NOT NULL, -- Category
    nickname TEXT UNIQUE NOT NULL, -- Unique nickname
    -- Banner Info
    travel_country TEXT,
    travel_city TEXT,
    banner_image_url TEXT,
    hashtag_1 TEXT,
    hashtag_2 TEXT,
    hashtag_3 TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Admins can insert profiles" ON public.profiles FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update profiles" ON public.profiles FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete profiles" ON public.profiles FOR DELETE USING (public.is_admin());

-- (Optional but recommended) Policy to allow authenticated users to update their own profile
-- CREATE POLICY "Users can update their own profile" ON public.profiles
-- FOR UPDATE USING (
--     crew_id IN (SELECT id FROM public.crews WHERE user_id = auth.uid())
-- );



-- 3. Activities Table
-- Monthly roadmap, guidelines, and deadlines
CREATE TABLE public.activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id UUID REFERENCES public.batches(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    guideline_text TEXT NOT NULL,
    deadline TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Activities are viewable by everyone" ON public.activities FOR SELECT USING (true);
CREATE POLICY "Admins can insert activities" ON public.activities FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update activities" ON public.activities FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete activities" ON public.activities FOR DELETE USING (public.is_admin());


-- 4. Submissions Table
-- Text-file uploads with automated validation logic
CREATE TABLE public.submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    crew_id UUID REFERENCES public.crews(id) ON DELETE CASCADE,
    activity_id UUID REFERENCES public.activities(id) ON DELETE CASCADE,
    file_url TEXT,
    content_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Submissions are viewable by everyone" ON public.submissions FOR SELECT USING (true);
CREATE POLICY "Admins can insert submissions" ON public.submissions FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update submissions" ON public.submissions FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete submissions" ON public.submissions FOR DELETE USING (public.is_admin());

-- (Optional but recommended) Policy to allow Crews to insert their own submissions 
-- Uncomment if users should submit their own work rather than admins doing it for them:
-- CREATE POLICY "Crews can insert their own submissions" ON public.submissions 
-- FOR INSERT WITH CHECK (
--     crew_id IN (SELECT id FROM public.crews WHERE user_id = auth.uid())
-- );

-- 5. Storage
-- Insert 'banners' bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('banners', 'banners', true) 
ON CONFLICT (id) DO NOTHING;

-- Policy to allow anyone to read
CREATE POLICY "Public Access" ON storage.objects 
FOR SELECT USING (bucket_id = 'banners');

-- Policy to allow authenticated users to insert
CREATE POLICY "Auth Insert" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'banners' AND auth.role() = 'authenticated');
