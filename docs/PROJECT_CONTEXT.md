# Project Context

> [!IMPORTANT]
> **2026-03-26**: Auth & Middleware stabilized. DO NOT touch the redirect logic or folder structure without permission.
> **DO NOT change the folder structure or middleware logic without consulting the PROJECT_CONTEXT first.**

## Auth Flow Status
- [x] Login (Entry Gate): Root / and all routes default to /login.
- [x] Sign-up: Unique check by tourlive_email only. profiles.id matches auth.uid().
- [x] Admin: Direct access for root@tourlive.co.kr only.

## Middleware Logic Details (Stabilized)
- **Path**: `src/middleware.ts` (Root of `src/`)
- **Public Paths**: `/login`, `/onboarding` (Both allow unauthenticated access).
- **Protected Paths**: Everything else redirects to `/login` (307) if unauthenticated.
- **Admin Bypass**: `root@tourlive.co.kr` and users with `role: 'admin'` bypass the `profiles` completion check.
- **Root `/` Redirect**: 
    - Unauthenticated -> `/login`
    - Admin -> `/admin`
    - Regular User -> `/dashboard`
- **Onboarding Redirect**: Authenticated users without a profile are allowed on `/onboarding` and `/login`.

## Folder Structure Cleanup
- `/docs`: All documentation (.md files).
- `/docs/history`: Historical records.
- `/archive`: Utility scripts (tmp_*, test-*, *.html) and legacy files.
- `/src`: Application source code, with `middleware.ts` at the root.

## Vercel Build Status
- [x] Middleware: Moved to `src/middleware.ts` for correct tracing.
- [x] Output: `standalone` enabled in `next.config.ts`.
- [x] Signup: `/onboarding` path bypasses force-login redirect.
