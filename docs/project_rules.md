# Project: Supporters-Hub

## Architecture
- Frontend: Next.js (App Router) + Shadcn/ui
- Backend: Supabase (PostgreSQL, Auth, RLS)
- Deployment: Vercel

## Core Entities
- Batches: Track crew generations (Current: 14th)
- Crews: Member profiles linked to a specific Batch
- Profiles: Linked to auth.users and Crews. Contains Full Name, Phone Number, TourLive Email, Contact Email, Selected Activity (Category), Nickname, and Banner Info (Travel Country/City, Banner Image URL, 3 Hashtags). One profile per crew. Nickname must be unique.
- Activities: Monthly roadmap, guidelines, and deadlines
- Submissions: Text-file uploads with automated validation logic

## Rules
- Admin-only write access (use Supabase 'role' metadata).
- Cost-Efficiency: Use client-side logic for text validation to save Edge Function usage.
- Modularity: Keep components small and reusable.
