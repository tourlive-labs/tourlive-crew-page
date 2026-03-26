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
2.  [x] Clean Sweep (Bank columns & Unused redirects)
3.  [x] Dashboard/Admin Restriction
