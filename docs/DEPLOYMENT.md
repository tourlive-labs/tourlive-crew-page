# Supabase and Vercel Deployment Guide

This guide covers the necessary steps to configure the Supabase infrastructure and connect this repository to Vercel.

## 1. Supabase Infrastructure

### A. Database & Storage Configuration
1. In your **Supabase Dashboard**, go to the **SQL Editor**.
2. Run the SQL commands located in `schema.sql` at the root of this repository.
   - This sets up all tables (`batches`, `crews`, `profiles`, `activities`, `submissions`) and configures **Row Level Security (RLS)** policies.
   - It also automatically generates the **`banners`** storage bucket and applies the necessary public read access and authenticated write access policies.

### B. Authentication Configure (Redirect URLs)
To ensure that authentication and redirections work correctly in your Vercel deployment:
1. Navigate to **Authentication** > **URL Configuration** in the Supabase Dashboard.
2. Under **Site URL**, set your production Vercel URL (e.g., `https://your-project.vercel.app`).
3. Under **Redirect URLs**, add your deployment URLs to allow previews and valid production authentications (e.g., `https://*-your-username.vercel.app/*` if using Vercel preview environments, or explicitly `https://your-project.vercel.app/*`).

## 2. Environment Variables

In your Vercel project, you need to configure the following environment variables. You can view the `.env.local.template` file for reference:

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project URL (found in Settings > API > Project URL).
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase Project Anon Key (found in Settings > API > Project API Keys).

## 3. Vercel Deployment

1. On the **Vercel Dashboard**, click **Add New...** > **Project**.
2. **Import** the GitHub repository for "Supporters-Hub".
3. The framework preset should automatically be evaluated and detected as **Next.js**.
4. In the **Environment Variables** section, paste the values mentioned in Section 2 above.
5. Click **Deploy**. Vercel will process the build and your site will be live!
