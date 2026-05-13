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
- **Reasons** (기수 동적 반영 — `profiles.batch` 참조):
  - Essential: `[{batch}] {n}월 필수활동 완료`
  - Side: `[{batch}] 추가미션: {Mission Type}`
  - Challenge: `[챌린지] 블로그 챌린지 완료 (5,000P)`
- **Payout UI**: Dedicated tab in Admin Missions with Individual Copy buttons for fast entry.

## Notice System

- `notices` 테이블: `id, title, content, category, image_urls text[], is_published, created_at`
- **어드민 등록**: `/admin/notices` — `NoticesClient` (CRUD + 이미지 최대 5장 Supabase Storage `notices` 버킷 업로드)
- **크루 목록**: `/dashboard/notice` — Supabase에서 fetch, 카드 클릭 시 `/dashboard/notice/[id]`
- **상세 페이지**: ReactMarkdown 렌더링 + `NoticeImageViewer` 컴포넌트
  - 라이트박스: 줌 1×~5×(버튼/휠), 드래그 패닝, 모바일 핀치줌, 앞뒤 탐색, 도트 인디케이터

## Side Mission Photo Upload

- `side_missions` 테이블에 `proof_images text[]` 컬럼 추가 (2026-05-13)
- **스토리지**: `side-missions` Supabase Storage 버킷 (Public)
- **제출 UI** (`/dashboard/mission` SideMissionBoard):
  - 파일 선택 → 브라우저에서 직접 업로드 → 미리보기 썸네일 + 개별 삭제
  - URL 입력란은 선택사항으로 변경 (사진 또는 URL 중 하나 이상 필수)
- **어드민 뷰** (`/admin/missions` 추가미션 탭):
  - 증빙 컬럼에 URL 링크 + 이미지 썸네일 동시 표시, 클릭 시 원본 새 탭

## Survey Export

- `getSurveyExportData()` 서버 액션: `missions` 테이블에서 `survey_completed = true` 전체 조회
- `/admin/missions` 헤더 우측 "설문 xlsx" 버튼 → SheetJS (`xlsx` 패키지) 로 `.xlsx` 다운로드
- 컬럼: 기수/이름/닉네임/이메일/활동분야/미션월/투어명/별점/아쉬운점/개선사항/자유의견/제출일

## Challenge System (추가됨 2026-04-20)

### challenge_configs Table
월별 챌린지 설정을 저장하는 Supabase 테이블. 활성 설정은 `is_active = true` 단일 행으로 관리.

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `month` | text | YYYY-MM 형식 |
| `badge_label` | text | 챌린지 배지 이름 (예: "파리 미술관 챌린지") |
| `blog_museums` | JSONB | `[{ name, date_range, keywords[] }]` 최대 3개 |
| `cafe_tiers` | JSONB | `[{ label, target, points }]` 최대 3개 |
| `is_active` | bool | 단일 활성 설정 (setActiveConfig로 교체) |

### Challenge Submission Flow
1. 크루가 `/dashboard/challenge`에서 챌린지 타입·미술관·리워드 선택 후 URL 제출
2. `submitChallenge()` 서버 액션 → `missions` 테이블에 INSERT:
   - `post_url`: `[CHALLENGE] https://...` (prefix로 일반 미션과 구분)
   - `rejection_reason` (metaTag): `[CHALLENGE:blog_paris:미술관명:rewardType] kw:키워드1|키워드2|키워드3`
3. 어드민이 `/admin/missions` 추가미션 탭에서 확인:
   - `getChallengeMissions()` → metaTag 파싱 → `ParsedChallengeMission` 타입으로 반환
   - `updateChallengeStatus(id, 'COMPLETED')` 승인 시 `points` 타입은 5,000P 정산 행 자동 생성

### MetaTag 포맷 (rejection_reason 필드 이중 활용)
```
[CHALLENGE:{type}:{museum?}:{rewardType?}] kw:{kw1}|{kw2}|{kw3}
```
- `type`: `blog_paris` | `cafe_streak`
- `museum`: 미술관명 (blog_paris만 해당)
- `rewardType`: `points` | `naver_pay`
- `kw:` 접두사로 선택 키워드 저장 (naver_pay만 해당, 파이프 구분)

> **주의**: `rejection_reason` 필드는 원래 관리자 피드백용이지만 챌린지 제출에서는 metaTag 저장소로 재활용됨. 향후 전용 컬럼 분리 권장.

### Admin Routes
- `/admin/challenge`: `ChallengeConfigClient` — 월별 설정 CRUD + 활성화
- `/admin/missions` 추가미션 탭: 챌린지 섹션 + 기존 추가미션 테이블 (두 섹션 분리)
