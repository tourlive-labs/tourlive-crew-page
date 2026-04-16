# Supporters Hub — Claude Code 컨텍스트

## 프로젝트 개요
서포터즈 활동 관리 플랫폼. 기수당 60~70명의 서포터즈가 3개월간 활동하며
어드민(관리자)과 협업하는 구조. Admin 페이지와 Supporter 페이지가 완전히 분리됨.

## 기술 스택
- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui (Radix UI 기반)
- **Backend**: Supabase (Auth, Database, Storage)
- **Forms**: react-hook-form + zod v4
- **AI**: @anthropic-ai/sdk, @google/generative-ai
- **Deploy**: Vercel
- **Package Manager**: npm

## 디렉토리 구조
```
src/
├── app/
│   ├── actions/          # Server Actions (서버 전용 로직)
│   │   ├── admin.ts      # 어드민 전용 액션
│   │   ├── auth.ts       # 로그인/로그아웃/세션
│   │   ├── calendar.ts   # 캘린더
│   │   ├── challenge.ts  # 챌린지
│   │   ├── dashboard.ts  # 대시보드 데이터
│   │   ├── mission.ts    # 미션 CRUD
│   │   ├── onboarding.ts # 온보딩 처리
│   │   └── side_missions.ts
│   ├── admin/            # 어드민 전용 라우트 (관리자만 접근)
│   │   ├── page.tsx      # 어드민 대시보드
│   │   └── missions/     # 미션 관리
│   ├── api/              # API 라우트
│   ├── dashboard/        # 서포터즈 전용 라우트
│   │   ├── layout.tsx    # 사이드바 포함 레이아웃
│   │   ├── page.tsx      # 홈
│   │   ├── challenge/    # 챌린지
│   │   ├── faq/          # FAQ
│   │   ├── guide/        # 가이드
│   │   ├── mission/      # 미션 제출/확인
│   │   ├── mypage/       # 마이페이지
│   │   └── notice/       # 공지사항
│   ├── login/            # 로그인
│   ├── manage/           # (미사용 or WIP)
│   └── onboarding/       # 서포터즈 온보딩 (최초 1회)
├── components/
│   ├── ui/               # shadcn/ui 컴포넌트 (건드리지 말 것)
│   ├── dashboard/
│   │   ├── CrewBannerGenerator.tsx  # html-to-image 사용
│   │   └── Sidebar.tsx
│   ├── AdminFilters.tsx
│   ├── AuthProvider.tsx
│   ├── CrewManagementClient.tsx
│   ├── CrewOnboardingForm.tsx
│   └── MarkPaidButton.tsx
├── lib/
│   ├── utils.ts          # cn() 유틸
│   └── validations/
│       └── onboarding-schema.ts  # zod 스키마
├── utils/
│   ├── security.ts
│   └── supabase/
│       ├── admin.ts      # service role (서버 전용, 절대 클라이언트 노출 금지)
│       ├── client.ts     # 브라우저용 클라이언트
│       └── server.ts     # SSR용 서버 클라이언트
└── middleware.ts          # 라우트 보호 (인증 확인)
```

## 핵심 도메인 개념

### 사용자 역할
- **Admin**: 기수 생성, 서포터즈 관리, 미션 출제, 공지 작성
- **Supporter**: 온보딩 → 3개월 활동 → 미션 제출 → 챌린지 참여

### 서포터즈 라이프사이클
```
회원가입/로그인 → /onboarding (최초 1회) → /dashboard (3개월 활동) → 종료
```

### 미션 구조
- 메인 미션 (`mission.ts`)
- 사이드 미션 (`side_missions.ts`)
- 챌린지 (`challenge.ts`)

## Supabase 사용 규칙
- 클라이언트 컴포넌트: `utils/supabase/client.ts`
- 서버 컴포넌트 / Server Action: `utils/supabase/server.ts`
- 관리자 작업 (RLS 우회): `utils/supabase/admin.ts` — **서버 전용, 절대 클라이언트에서 import 금지**
- Row Level Security(RLS)는 항상 활성화 상태로 유지

## 환경변수 (필수)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # 서버 전용
ANTHROPIC_API_KEY=                # AI 기능용
GOOGLE_GENERATIVE_AI_API_KEY=     # AI 기능용
```
> `.env.local`에 보관. 절대 커밋하지 말 것.

## 개발 명령어
```bash
npm run dev      # 로컬 개발 (localhost:3000)
npm run build    # 프로덕션 빌드
npm run lint     # ESLint 검사
```

## 코드 컨벤션
- Server Actions에 `"use server"` 명시 필수
- Client Components에 `"use client"` 명시 필수
- 폼 유효성 검사: `zod` + `react-hook-form` 조합 사용
- UI 컴포넌트: shadcn/ui 우선 사용, 없으면 Tailwind로 직접 작성
- 에러 처리: `sonner` toast 사용 (성공/실패 알림)
- 타입: `any` 사용 금지, Supabase 자동 생성 타입 활용

## 현재 개선 우선순위
1. **UI 개선** — 전반적인 디자인 품질, 일관성
2. **앱 안정성** — 에러 핸들링, 로딩 상태, edge case 처리
3. **파일 업로드 안정화** — Supabase Storage 연동
4. **API Key 보안** — 서버 전용 처리 확인, 클라이언트 노출 방지
5. **장기 유지보수성** — 타입 안전성, 컴포넌트 구조 정리

## 알려진 이슈 / 주의사항
- `manage/` 라우트: 미사용 상태로 정리 필요
- `html-to-image` (CrewBannerGenerator): 클라이언트 전용, SSR 비활성화 필요
- AI SDK 두 개 병존 (Anthropic + Google): 용도 구분 필요
- Tailwind v4: 설정 방식이 v3와 다름 (`@tailwindcss/postcss` 사용)

## 배포
- **플랫폼**: Vercel (자동 배포, main 브랜치 push 시)
- **환경변수**: Vercel 대시보드에서 별도 설정 필요

## Strict Rules for Refactoring
- **Error Handling**: 모든 Supabase 쿼리는 `error` 변수를 체크하고 로깅해야 함. `Promise.all` 사용 시 반드시 `try/catch`와 `finally`로 로딩 상태 관리.
- **Data Consistency**: 미션 상태값은 Enum(또는 상수)으로 관리 (예: `PENDING`, `APPROVED`, `REJECTED`). 대소문자 혼용 금지.
- **Design Tokens**: 
  - Background: `bg-[#F9F8F3]` (Supporters), `bg-slate-50` (Admin)으로 이원화 통일.
  - Border Radius: `rounded-2xl` (16px) 또는 `rounded-3xl` (24px)로 고정.
- **UI Components**: 뒤로가기 및 헤더는 `src/components/shared`에 공통 컴포넌트화하여 재사용.
- **Language**: 사용자 대상 메시지는 한국어, 개발자 로그는 영어로 통일.
