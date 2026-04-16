# Supporters Hub — Beta Launch Status

> Last updated: 2026-04-15  
> TypeScript: ✅ Zero compile errors  
> Dev server: ✅ Running

---

## 1. Architecture Overview

```
/dashboard              → Home (Stamp Board + Essential Task List)
/dashboard/mission      → Mission Submission Page
/dashboard/challenge    → Challenge Action Hub (Blog/Cafe missions)
/dashboard/mypage       → Profile Management (read-only activity type)
/dashboard/guide        → Activity Guidelines
/dashboard/faq          → FAQ
/dashboard/notice       → Notices
/admin/missions         → Admin Mission Approval Dashboard
```

**Data flow:** All pages fetch from `getDashboardData()` → `profiles.selected_activity` determines team UI.

---

## 2. Dashboard Home (`/dashboard`)

### Layout
- **50:50 grid** (`grid-cols-1 lg:grid-cols-2`) — balanced columns
- Mobile: single-column vertical stack
- Left: MissionStampBoard + QuickLinks
- Right: EssentialTaskList + TourliveMiniBanner

### MissionStampBoard (Left Column)
- **D-Day badge** — pill showing days until month-end deadline (rose/amber/slate)
- **Progress bar** — thin `h-1` bar showing month percentage elapsed
- **3 stamp slots** — compact `w-16 h-16` circles (status-check, not hero)
  - 필수 활동 (Essential) → links to `/dashboard/mission`
  - 블로그 챌린지 (Blog Challenge) → links to `/dashboard/challenge`
  - 카페 챌린지 (Cafe Challenge) → links to `/dashboard/challenge`
- States: `none` (grey) → `pending` (REVIEW) → `approved` (DONE)
- Data source: `getStampStatus()` server action → reads `missions` table

### EssentialTaskList (Right Column)
- **Team-differentiated UI** based on `selected_activity`:
  - **Blog team** (`naver_blog`): Single task card "가이드북 사용후기 포스팅 2건" + collapsible 5-item checklist
  - **Cafe team** (`naver_cafe`): 3 numbered rows (게시글 5건 / 댓글 30건 / 후기 1건)
- Header icon: BookOpen (blog) vs Coffee (cafe), different accent colors
- Footer: instruction to submit via '활동 제출' tab

### QuickLinks
- Slim horizontal row cards (not large boxes)
- 3 links: 활동 가이드, FAQ, 공식 커뮤니티 (네이버 지식여행 카페)
- Single unified container with `divide-y` separators

### TourliveMiniBanner
- Dark (`bg-slate-900`) horizontal strip with logo + arrow
- Links to `https://www.tourlive.co.kr`

---

## 3. Challenge Page (`/dashboard/challenge`)

- Single-column vertical stack layout (`max-w-2xl`)
- Blog & Cafe challenge cards stacked vertically on all devices
- Museum tab bar: horizontal scroll on mobile, `grid-cols-3` on desktop
- Touch targets: all buttons `min-h-[44px]`
- Keyboard clearance: `pb-32` wrapper + `pb-safe`

---

## 4. Team-Based Access Logic

### Principle: Activity Type is a Fixed Identity

| Layer | Protection |
|---|---|
| **Onboarding** | `selected_activity` set once in `onboarding.ts` line 187 |
| **My Page UI** | Field rendered as read-only badge with 🔒 Lock icon + "변경 불가" label |
| **Server Action** | `updateProfile()` strips `selected_activity` with `delete finalUpdates.selected_activity` |
| **DB** | Only write path is onboarding; `updateProfile` guards the column |

### Team Values
- `naver_blog` → Blog team (네이버 블로그)
- `naver_cafe` → Cafe team (지식여행 카페)

### UI Differentiation
| Component | Blog | Cafe |
|---|---|---|
| EssentialTaskList | 1 task + 5-checklist toggle | 3 numbered rows |
| Header icon | BookOpen (slate-900) | Coffee (indigo-900) |
| Badge accent | #FF5C00 (orange) | indigo-500 |
| Stamp sublabel | "파리 미술관" | "연속 출석 도전 !" |

---

## 5. Code Cleanup Summary

### Removed from `dashboard/page.tsx`
| Item | Type | Reason |
|---|---|---|
| `MonthlyMissionCard` | Component | Legacy progress card, replaced by MissionStampBoard |
| `DashboardHeader` | Component | Legacy header, replaced by inline welcome header |
| `TeamMissionList` | Component | v1 mission counter, replaced by EssentialTaskList |
| `WebsiteBanner` | Component | Oversized banner, replaced by TourliveMiniBanner |
| `MissionGuide` | Component | v2 challenge-mixed guide, replaced by EssentialTaskList |
| `UnifiedMissionCalendar` | Component | Calendar grid, replaced by MissionStampBoard |
| `CardHeader`, `CardTitle`, `CardDescription` | Import | No longer used after component cleanup |
| `Bell`, `Target` | Import | Icons from removed components |
| `submitMission`, `signOut` | Import | Actions used only in deleted headers |
| `toast`, `Skeleton`, `useRouter` | Import | Stale dependencies |

### Preserved
- All active components: `EssentialTaskList`, `MissionStampBoard`, `StampSlot`, `QuickLinks`, `TourliveMiniBanner`, `DashboardContent`
- Server actions: `getDashboardData`, `getStampStatus`, `updateProfile`
- Mobile-responsive CSS: `.scrollbar-none`, `.pb-safe`, `-webkit-tap-highlight-color`
- Sidebar navigation (`/components/dashboard/Sidebar.tsx`)

---

## 6. Data Consistency Verification

All 3 core pages fetch the same `selected_activity` via the same data path:

```
profiles.selected_activity
  └─ getDashboardData() → data.team
       ├─ /dashboard           → EssentialTaskList(team)
       ├─ /dashboard/mission   → isBlog = data.team !== 'naver_cafe'
       └─ /dashboard/mypage    → read-only display
```

The `getStampStatus()` action independently resolves `profile_id` from `crews.user_id` → `profiles.crew_id` and reads the `missions` table for stamp state.

---

## 7. File Sizes (Post-Cleanup)

| File | Lines | Purpose |
|---|---|---|
| `dashboard/page.tsx` | ~547 | Home page (all components inline) |
| `dashboard/mypage/page.tsx` | ~413 | Profile editor |
| `dashboard/challenge/page.tsx` | ~600+ | Challenge Action Hub |
| `dashboard/mission/page.tsx` | ~800+ | Mission Submission |
| `actions/dashboard.ts` | ~327 | Server actions (data + stamps + profile) |

---

## 8. Known Tech Debt

- [ ] `dashboard/page.tsx` components are inline (not extracted to `/components/`)
- [ ] Blog checklist items are hardcoded constants (could be DB-driven)
- [ ] Cafe task details are hardcoded (could be DB-driven)
- [ ] `getStampStatus()` uses `rejection_reason` field to tag challenge type — not ideal
- [ ] No automated E2E tests for team-differentiated UI
