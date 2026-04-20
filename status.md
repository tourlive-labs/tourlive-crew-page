# Supporters Hub — Beta Launch Status

> Last updated: 2026-04-20 (커밋 3b17309)
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
/dashboard/notice       → Notices (정적 하드코딩 — DB 연동 미완)
/admin                  → Admin Root (Crew Member Master List)
/admin/missions         → Mission Approval Dashboard (필수 + 추가 + 챌린지)
/admin/notices          → Notice Management (공지 CRUD)
/admin/challenge        → Challenge Config Management (월별 설정)
```

**Data flow:** All pages fetch from `getDashboardData()` → `profiles.selected_activity` determines team UI.

**Challenge config flow:** `challenge_configs` table (Supabase) → `getActiveChallengeConfig()` → `ChallengeContent.tsx` renders museum tabs / tier buttons dynamically.

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

## 3. Challenge System

### challenge_configs Table
- `id`, `month` (YYYY-MM), `badge_label`, `blog_museums` (JSONB array), `cafe_tiers` (JSONB array), `is_active` (bool)
- `blog_museums`: `[{ name, date_range, keywords[] }]` — 최대 3개 미술관 슬롯
- `cafe_tiers`: `[{ label, target, points }]` — 최대 3개 카페 등급

### Blog Challenge (`blog_paris`)
- 크루가 미술관 탭 선택 → 리워드 타입 선택(`points` 5,000P / `naver_pay` 2만원권)
- `naver_pay` 선택 시 미술관 키워드 목록에서 **3개 필수 선택** (체크마크 유지 UI)
- 제출 시 `missions` 테이블에 저장:
  - `post_url`: `[CHALLENGE] https://...`
  - `rejection_reason` (metaTag): `[CHALLENGE:blog_paris:미술관명:rewardType] kw:키워드1|키워드2|키워드3`

### Cafe Challenge (`cafe_streak`)
- 네이버 카페 URL 제출 (AI 검증 없음, 어드민 수동 확인)

### Admin Challenge View (`/admin/missions` 추가미션 탭)
- `getChallengeMissions()`: missions 테이블에서 `[CHALLENGE]%` prefix 행 조회 후 metaTag 파싱
- `ParsedChallengeMission` 타입: challengeType, challengeName, museum, rewardType, rewardLabel, keywords[]
- `updateChallengeStatus()`: COMPLETED 승인 시 `points` 타입이면 5,000P 정산 행 자동 생성 (`naver_pay`는 수동)

### Admin Challenge Config (`/admin/challenge`)
- `ChallengeConfigClient`: 월별 설정 목록 + 편집 폼 (미술관 3슬롯, 카페 등급 3슬롯)
- 활성화 버튼으로 단일 `is_active` 레코드 유지 (`setActiveConfig()` 트랜잭션)

---

## 3b. Challenge Page (`/dashboard/challenge`)

- Single-column vertical stack layout (`max-w-2xl`)
- Blog & Cafe challenge cards stacked vertically on all devices
- Museum tab bar: horizontal scroll on mobile, `grid-cols-3` on desktop
- Touch targets: all buttons `min-h-[44px]`
- Keyboard clearance: `pb-32` wrapper + `pb-safe`
- KeywordPill 컴포넌트: `mode="copy"` (클릭 복사) / `mode="select"` (체크마크 토글, 최대 3개 선택)
- naver_pay 선택 시 키워드 3개 미선택이면 제출 버튼 비활성화 + "키워드 X/3개 선택 필요" 라벨

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
| `dashboard/challenge/ChallengeContent.tsx` | ~700+ | Challenge Action Hub (Client Component) |
| `dashboard/mission/page.tsx` | ~800+ | Mission Submission |
| `actions/dashboard.ts` | ~327 | Server actions (data + stamps + profile) |
| `actions/admin.ts` | ~406 | Admin server actions (missions, challenge, settlements) |
| `actions/challenge.ts` | ~129 | Challenge submit server action |
| `actions/challenge-config.ts` | ~120+ | Challenge config CRUD server actions |
| `admin/missions/page.tsx` | ~500+ | Admin mission approval dashboard (3 tabs) |
| `admin/challenge/ChallengeConfigClient.tsx` | ~400+ | Challenge config admin UI |

---

## 8. Known Tech Debt

- [ ] `dashboard/page.tsx` components are inline (not extracted to `/components/`)
- [ ] Blog checklist items are hardcoded constants (could be DB-driven)
- [ ] Cafe task details are hardcoded (could be DB-driven)
- [ ] `getStampStatus()` uses `rejection_reason` field to tag challenge type — not ideal
- [ ] No automated E2E tests for team-differentiated UI
- [ ] `rejection_reason` 필드 이중 목적 사용 — 어드민 피드백 + 챌린지 metaTag 저장소로 혼용 중 (향후 전용 컬럼 분리 권장)
- [ ] `naver_pay` 리워드 챌린지 승인 시 정산 자동화 없음 (수동 지급 필요)
- [ ] `/dashboard/notice` — 하드코딩된 정적 데이터, Supabase `notices` 테이블 미연동
