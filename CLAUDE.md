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
- **AI**: @anthropic-ai/sdk (미션 검증), @google/generative-ai (용도 미확정)
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
GOOGLE_GENERATIVE_AI_API_KEY=     # AI 기능용
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
- **서포터즈 라이프사이클**: 온보딩 → 3개월 활동(미션/챌린지/사이드미션) → 종료
- **포인트 정산**: 필수미션 50,000₩ 고정, 사이드미션 가변. `point_settlements` 테이블에 기록.

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
- **`manage/` 라우트**: 미사용 상태, 정리 필요
- **`CrewBannerGenerator.tsx`**: `html-to-image`는 클라이언트 전용 — SSR에서 `dynamic(() => import(...), { ssr: false })` 필요
- **AI SDK 중복**: Anthropic(미션 검증)과 Google AI 두 개 병존, 역할 정리 필요
- **Tailwind v4**: 설정 방식이 v3와 다름 (`@tailwindcss/postcss` 플러그인 사용, `tailwind.config.ts` 없음)
- **브랜드 토큰 미적용 구역**: `login/`, `admin/`, `onboarding/`, `CrewOnboardingForm.tsx` 등에 하드코딩 값 잔존 (TODO.md #1 참조)
- **에러 핸들링 미완성**: `dashboard/page.tsx` 공백 화면(#6), `onboarding.ts` 중복체크 에러 미처리(#7), `admin/page.tsx` fetchError 미사용(#8) — TODO.md 참조
