# Project Context

## Auth Flow Status
- [x] Login (Entry Gate): Root / and all routes default to /login.
- [x] Sign-up: Unique check by tourlive_email only. profiles.id matches auth.uid().
- [x] Admin: Direct access for root@tourlive.co.kr only.

## DB Schema State
- [x] profiles: Removal of bank_ columns.
- [x] profiles.id: Strict alignment with auth.uid().

## Logic Priority
1.  [x] Auth Refactor (Middleware & Login/Signup)
2.  [x] Emergency Fixes (Vercel Build & /onboarding bypass)
3.  [x] Clean Sweep (Bank columns & Unused redirects)
4.  [x] Dashboard/Admin Restriction

## Vercel Build Status
- [x] Middleware: Moved to `src/middleware.ts` for correct tracing.
- [x] Output: `standalone` enabled in `next.config.ts`.
- [x] Signup: `/onboarding` path bypasses force-login redirect.
