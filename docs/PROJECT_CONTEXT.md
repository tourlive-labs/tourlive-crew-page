# Project Context

> [!IMPORTANT]
> **2026-03-26**: Auth & Middleware stabilized. DO NOT touch the redirect logic or folder structure without permission.
> **DO NOT change the folder structure or middleware logic without consulting the PROJECT_CONTEXT first.**

## Auth Flow Status
- [x] Login (Entry Gate): Root / and all routes default to /login.
- [x] Sign-up: Unique check by tourlive_email only. profiles.id matches auth.uid().
- [x] Admin: Direct access for root@tourlive.co.kr only.
- [x] **[Milestone]** middleware.ts hardening for robust redirection.

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

## Admin Dashboard (V2)
- **Batch Management**: Added `batch` column to `profiles` for generation-based filtering.
- **AI Mission Verification**: Integrated AI engine for automated Naver Cafe/Blog activity validation.
- **Badge System**: Implemented automated badges for [3월], [4월], and 👑 [수료대상] (3-month streak).
- **Interactive UI**: `CrewManagementClient` handles real-time filtering by Batch, Field, and Graduation status.
- **Navigation**: "Back to List" added to mission control; Logout button added to dashboard header.

## Folder Structure Cleanup
- `/docs`: All documentation (.md files).
- `/docs/history`: Historical records.
- `/archive`: Utility scripts (tmp_*, test-*, *.html) and legacy files.
- `/src`: Application source code, with `middleware.ts` at the root.

## Vercel Build Status
- [x] Middleware: Moved to `src/middleware.ts` for correct tracing.
- [x] Output: `standalone` enabled in `next.config.ts`.
- [x] Workspace Cleanup: Temporary `.cjs` scripts moved to `scripts/database/` for better organization.
- [x] Admin UI Refinement: '포인트 현황' tab removed to focus on the Settlement Tool.
- [x] Rejection Flow: `REJECTED` status persists in Admin view; Amber banner notifies Crew users.
- [x] Settlement Tool: `point_settlements` table synced with approvals; High-density copy UI implemented.
- [x] **[New]** Profile Management: Atomic editing and real-time banner updates introduced.

## Point Settlement System
- **Trigger**: Setting mission status to `completed` (Essential) or `APPROVED` (Side) inserts a `PENDING` row into `point_settlements`.
- **Amounts**: Essential missions = 50,000 P | Side missions = Based on `pointMap`.
- **Reasons**:
  - Essential: `[14기] {n}월 필수활동 완료`
  - Side: `[14기] 추가미션: {Mission Type}`
- **Payout UI**: Dedicated tab in Admin Missions with Individual Copy buttons for fast entry.
