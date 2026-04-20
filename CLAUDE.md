# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요
서포터즈 활동 관리 플랫폼. 기수당 60~70명의 서포터즈가 3개월간 활동하며
어드민(관리자)과 협업하는 구조. Admin 페이지와 Supporter 페이지가 완전히 분리됨.

## 기술 스택
- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript 5
- **Styling**: Tailwind CSS v4 (`@tailwindcss/postcss`) + shadcn/ui (Radix UI 기반)
- **Backend**: Supabase (Auth, PostgreSQL, Storage, RLS)
- **Forms**: react-hook-form + zod v4
- **AI**: @anthropic-ai/sdk (미션 검증 — `claude-3-haiku-20240307`)
- **Deploy**: Vercel (standalone mode, main 브랜치 자동 배포)
- **Package Manager**: npm

## 개발 명령어
```bash
npm run dev      # 로컬 개발 서버 (localhost:3000)
npm run build    # 프로덕션 빌드
npm run lint     # ESLint 검사
```
테스트 프레임워크 없음 — 수동 테스트로 검증.

## 환경변수 (필수)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # 서버 전용
ANTHROPIC_API_KEY=                # AI 미션 검증용
GOOGLE_GENERATIVE_AI_API_KEY=     # AI 기능용 (역할 미확정)
```

## 아키텍처 개요

### 라우팅 흐름 (middleware.ts)
```
미인증 사용자          → /login (307)
인증 + admin 역할     → /admin
인증 + 프로필 없음     → /login (307)
인증 + 서포터즈        → /dashboard
/admin 접근 + 비관리자 → /dashboard (307)
```
루트 경로 `/`는 역할에 따라 /admin 또는 /dashboard로 자동 리다이렉트.

### 어드민 인증 패턴
어드민 판별은 두 경로를 모두 확인함:
```ts
const isRootAdmin = user.email === "root@tourlive.co.kr";
const hasAdminRole = profile?.role === "admin";
const isAnyAdmin = isRootAdmin || hasAdminRole;
```
Server Action에서도 동일 패턴으로 직접 검증 (미들웨어만 믿지 않음).

### DB 테이블 구조 및 관계
핵심 테이블과 관계:
```
auth.users (Supabase Auth)
  └── crews          (user_id FK)  ← 중간 조인 테이블
       └── profiles  (crew_id FK)  ← 역할, 닉네임, 활동 유형 등 저장
            ├── missions            (profile_id FK)  ← 필수 미션
            ├── side_missions       (profile_id FK)  ← 사이드 미션
            └── point_settlements   (profile_id FK)  ← 포인트 정산
```

**중요**: user_id → profile 조회는 반드시 2단계:
```ts
const { data: crew } = await supabase.from('crews').select('id').eq('user_id', user.id).maybeSingle();
const { data: profile } = await supabase.from('profiles').select(...).eq('crew_id', crew.id).maybeSingle();
```
`auth.users.id`로 `profiles`를 직접 조회하면 안 됨.

### Server Action 패턴
모든 데이터 뮤테이션은 `src/app/actions/`의 Server Action으로 처리.  
반환 형태: `{ success?: boolean, error?: string, data?: T, redirectTo?: string }`  
뮤테이션 후 반드시 `revalidatePath()` 호출.

```ts
// 모든 Supabase 쿼리는 error 변수를 반드시 체크
const { data, error } = await supabase.from('table').select()
if (error) { console.error('[actionName]', error); return { error: '...' } }
```

### Supabase 클라이언트 3종
| 파일 | 용도 | 주의 |
|---|---|---|
| `utils/supabase/client.ts` | Client Component에서만 사용 | anon key, RLS 적용 |
| `utils/supabase/server.ts` | Server Component / Server Action | cookie 관리 포함 |
| `utils/supabase/admin.ts` | RLS 우회 필요한 서버 작업만 | **클라이언트에서 절대 import 금지** |

### 핵심 도메인 개념
- **미션 상태**: `src/types/mission.ts`의 `MissionStatus` enum 사용. string literal 직접 사용 금지.
  - DB에 소문자 `'rejected'`와 대문자 `'REJECTED'` 혼용 레거시 존재 → 반드시 `normalizeMissionStatus()` 통과 후 사용.
- **서포터즈 라이프사이클**: 온보딩 → 3개월 활동(미션/챌린지/사이드미션) → 종료
- **포인트 정산**: 필수미션 승인 시 50,000₩ `point_settlements` 자동 생성. 사이드미션은 유형별 가변(앱리뷰 10,000₩, 포토리뷰 2,000₩, 트랙댓글 1,000₩, 오류제보 3,000₩). `getAdminLeaderboard()`의 필수미션 포인트는 30,000₩으로 별도 계산 — 정산 금액과 다름(주의).

### 미션 검증 흐름 (AI)
`verifyMissionContent()` (server action, `actions/mission.ts`):
1. `selected_activity === 'naver_cafe'`이면 AI 스킵 — URL만 확인 후 `isManualCafe: true` 반환
2. 블로그: Naver 모바일 URL로 변환 → cheerio로 HTML 스크래핑 → Claude Haiku로 검증
3. AI 결과 파싱 실패 시 `[AI Parse Error - Manual Review Required]`로 자동 통과
4. `verifyMissionContent` 통과 → `CHECKING` 상태. 사용자가 최종 제출 버튼 클릭 시 → `PENDING_APPROVAL`.

## 디자인 시스템

### 브랜드 토큰 (`globals.css` `@theme` 블록 정의)
```
색상:
  bg-brand-bg          → #F9F8F3  (서포터즈 배경, Supporters 구역)
  bg-brand-primary     → #FF5C00  (주 강조색)
  bg-brand-primary-hover → #E65300
  bg-slate-50          → Admin 구역 배경

border-radius:
  rounded-brand-sm     → 16px
  rounded-brand        → 24px
  rounded-brand-lg     → 32px
  rounded-brand-xl     → 40px
```
하드코딩 값(`bg-[#FF5C00]`, `rounded-[32px]` 등) 사용 금지. 반드시 토큰 클래스 사용.

### UI 컴포넌트
- `src/components/ui/`: shadcn/ui 컴포넌트 — **직접 수정 금지**
- 뒤로가기·페이지 헤더: `src/components/shared/PageHeader.tsx` 재사용
- 폼 유효성: zod + react-hook-form 조합, 에러 알림은 `sonner` toast 사용

## 코드 컨벤션
- `"use server"` / `"use client"` 지시어 명시 필수
- `any` 타입 사용 금지 — Supabase 자동생성 타입 또는 로컬 인터페이스 사용
- 사용자 대상 메시지: 한국어 / 개발자 로그: 영어
- `Promise.all` 사용 시 반드시 `try/catch` + `finally`로 로딩 상태 관리

## 알려진 이슈 및 주의사항
- **`manage/` 라우트**: 미사용 상태, 정리 필요 (middleware.ts에서 isAdminPath에 포함됨)
- **`CrewBannerGenerator.tsx`**: `html-to-image`는 클라이언트 전용 — SSR에서 `dynamic(() => import(...), { ssr: false })` 필요
- **AI SDK 중복**: Anthropic(미션 검증)과 Google AI 두 개 병존, 역할 정리 필요
- **Tailwind v4**: 설정 방식이 v3와 다름 (`@tailwindcss/postcss` 플러그인 사용, `tailwind.config.ts` 없음)
- **`any` 타입 잔존**: `AuthProvider.tsx`(`user: any`), `mypage/page.tsx`(3곳), `calendar.ts`(`stamps: any[]`) — TODO.md #10-12 참조
- **`notice/page.tsx`**: 공지사항이 `const notices = [...]` 하드코딩, DB 미연동. 카드에 `cursor-pointer`만 있고 `onClick`/`href` 없음 — TODO.md #4
- **`faq/page.tsx`**: 마크다운 파싱 없이 문자열 처리 — TODO.md #5
- **영어 텍스트 혼용**: `MarkPaidButton.tsx`, `admin/missions/page.tsx`, `Sidebar.tsx` 등 — TODO.md #3
