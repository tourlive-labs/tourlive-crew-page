# Supporters Hub — 잔여 개선 항목

> 마지막 업데이트: 2026-04-20 (커밋 3b17309)  
> 이미 완료된 항목(에러 핸들링 1차, 디자인 토큰 `/dashboard`, PageHeader 컴포넌트, MissionStatus Enum)은 제외됨

---

## 🔴 즉시 (Critical)

- ✅ **#6 `dashboard/page.tsx` — 에러 시 완전 공백 화면** — `error` state 추가, 에러 UI(AlertCircle + 다시 시도 버튼) 렌더링으로 수정
- ✅ **#7 `onboarding.ts` — 중복 체크 쿼리 에러 미처리** — `globalEmailError` / `globalNicknameError` 체크 후 조기 반환 추가

- ✅ **#13 `mission/page.tsx` — `loadData()` 에러 시 완전 공백 화면** — `error` state 추가, AlertCircle + "다시 시도" 버튼 에러 UI 렌더링으로 수정

---

## 🟡 높음 (High)

- ✅ **#8 `admin/page.tsx` — `fetchError` 선언 후 미사용** — `fetchError` 체크 후 AlertCircle 에러 카드(메시지 + 다시 시도 링크) 렌더링으로 수정

- ✅ **#9 `CrewOnboardingForm.tsx` — 모집 마감 시 안내 없음** — `batchLoading` state 추가, `error`/`PGRST116` 처리, `activeBatch === null`일 때 CalendarOff 아이콘 + "현재 모집 중이 아닙니다" 카드 렌더링

- ✅ **#14 `notices.ts` / `challenge-config.ts` — `throw` 패턴 불일치** — 모든 exported 서버 액션을 `return { error }` 패턴으로 통일, 호출부(NoticesClient, ChallengeConfigClient, admin/notices/page, admin/challenge/page) try/catch → `res.error` 체크로 전환

- ✅ **#1 브랜드 토큰 미적용 — `/dashboard` 외 영역** — `login`, `page`, `admin`, `missions`, `CrewOnboardingForm`, `CrewManagementClient`, `AdminFilters` 전체 교체 완료
- ✅ **#2 네이티브 `<select>` vs shadcn/ui `<Select>` 혼용** — `admin/missions/page.tsx` 팀 필터 교체 완료

---

## 🟢 보통 (Medium)

### ~~#5 `faq/page.tsx` — 마크다운 raw 렌더링~~ — ✅ 완료
- `react-markdown@10.1.0` 설치, faq/page.tsx에 `<ReactMarkdown components={faqMarkdownComponents}>` 적용

### ~~#4 `notice/page.tsx` — 정적 데이터 + 죽은 클릭~~ — ✅ 완료
- Supabase `notices` 테이블 연동 (select id, title, category, created_at)
- 각 카드 `<Link href="/dashboard/notice/${id}">` 래핑
- `notice/[id]/page.tsx` 상세 페이지 생성 — content 컬럼 ReactMarkdown 렌더링

### #10 `AuthProvider.tsx` — `any` 타입 (CLAUDE.md 규칙 위반)
- **파일**: `src/components/AuthProvider.tsx`
- **문제**: `user: any | null` — Supabase `User` 타입 사용 가능한데 `any` 사용
- **수정 방향**: `import type { User } from '@supabase/supabase-js'` 후 교체

### #11 `mypage/page.tsx` — `any` 타입 3곳
- **파일**: `src/app/dashboard/mypage/page.tsx`
- **문제**: `useState<any>({})`, `initialValues: any`, `(prev: any) =>` — 구체적 프로필 타입 정의 필요
- **수정 방향**: Supabase 자동생성 타입 또는 로컬 인터페이스 적용

### ~~#12 `calendar.ts` — `stamps: any[]`~~ — ✅ 삭제됨 (2026-04-20)
- `calendar.ts` 파일 자체가 제거되어 해당 사항 없음

---

## 🔵 낮음 (Low)

### #15 어드민 페이지 `bg-[#F8F9FA]` 하드코딩
- **파일**: `src/app/admin/notices/page.tsx:35`, `src/app/admin/challenge/page.tsx:35`
- **문제**: `bg-[#F8F9FA]` 하드코딩 — 다른 어드민 페이지는 `bg-brand-bg` 사용
- **수정 방향**: `bg-brand-bg`로 교체

### #16 네이티브 `<button>` 혼용
- **파일**:
  - `src/components/CrewOnboardingForm.tsx:364` — 다음 단계 이동 버튼
  - `src/app/dashboard/mission/page.tsx:925` — 새로고침 아이콘 버튼
- **문제**: shadcn/ui `<Button>` 컴포넌트 대신 네이티브 `<button>` 사용
- **수정 방향**: `<Button variant="...">` 또는 `<Button size="icon">` 교체

### #17 하드코딩된 파란색 계열 hex 값
- **파일**:
  - `src/components/CrewOnboardingForm.tsx:148–165` — 스텝 진행 바: `bg-[#FFD6E0]`, `bg-[#D6E4FF]`, `bg-[#FFF0F3]`, `bg-[#F0F5FF]` 등
  - `src/app/dashboard/guide/page.tsx:64` — `bg-[#F0F5FF]`, `text-[#0052CC]`
  - `src/app/dashboard/mission/page.tsx:974` — `bg-[#F0F5FF]/50`, `text-[#0052CC]`
- **문제**: 브랜드 토큰 미적용 — 색상 변경 시 각 위치 개별 수정 필요
- **수정 방향**: `bg-indigo-50`, `text-indigo-700` 등 Tailwind 시맨틱 클래스 또는 신규 brand 토큰으로 교체

### #3 영어/한국어 텍스트 혼용
- **문제**: 관리자/내부 UI에 영어 텍스트가 섞여 있음

| 위치 | 현재 텍스트 | 제안 |
|---|---|---|
| `MarkPaidButton.tsx:43` | `"Mark Points as Paid"` | `"포인트 지급 완료 처리"` |
| `admin/missions/page.tsx` 링크 버튼 | `"Link 1"`, `"Link 2"` | `"링크 1"`, `"링크 2"` |
| `admin/page.tsx:69` | `"Admin Portal"` 뱃지 | `"관리자"` |
| `Sidebar.tsx:76` | `"Portal v2.0"` | `"크루 포털"` 또는 제거 |

---

---

## 🆕 앞으로의 TODO

### 챌린지 시스템 후속 작업

- [ ] **카페 챌린지 URL 검증** — 제출 시 실제 카페 포스팅 존재 여부 AI 검증 (블로그와 동일 패턴)
- [ ] **네이버페이 리워드 수동 지급 흐름** — `naver_pay` 리워드 타입은 현재 정산 자동화 없음. 별도 어드민 UI or 메모 추가 필요
- [ ] **챌린지 중복 제출 방지** — 같은 달 같은 챌린지 타입(blog_paris/cafe_streak)은 1회만 허용하도록 서버 액션 가드 추가
- [ ] **챌린지 현황 대시보드** — 크루 마이페이지에 본인 챌린지 제출 이력 표시 (현재 스탬프 상태만 노출)

### 공지사항 시스템

- ✅ **#4 `notice/page.tsx` — DB 연동** — Supabase `notices` 테이블 연동, `/dashboard/notice/[id]` 상세 페이지 완료
- ✅ **공지 카드 클릭 동작** — `<Link href="/dashboard/notice/${id}">` 래핑, 상세 페이지에서 ReactMarkdown 렌더링

### 코드 품질

- [ ] **#5 `faq/page.tsx` — 마크다운 파싱** — `react-markdown` 도입 또는 FAQ 데이터 JSX 전환
- ✅ **#10 `AuthProvider.tsx` — `any` 타입** — `import type { User } from '@supabase/supabase-js'`, `useState<User | null>`, context 타입 적용 완료
- ✅ **#11 `mypage/page.tsx` — `any` 타입** — `ProfileData` 타입 정의, `useState<Record<string, string | null>>`, `result` 타입 내 `data?: any` 제거 완료
- [ ] **#3 영어/한국어 텍스트 혼용** — `MarkPaidButton`, 어드민 링크 버튼, Sidebar 등 잔여 영문 텍스트 한국어화
- ✅ **#13 `mission/page.tsx` — 에러 시 공백 화면** — `error` state + AlertCircle UI 추가 완료
- ✅ **#14 `notices.ts`/`challenge-config.ts` — throw 패턴 불일치** — `return { error }` 패턴 통일 완료
- [ ] **#15 어드민 페이지 `bg-[#F8F9FA]`** — `admin/notices`, `admin/challenge` → `bg-brand-bg` 교체
- [ ] **#16 네이티브 `<button>` 혼용** — `CrewOnboardingForm.tsx`, `mission/page.tsx` → shadcn/ui `<Button>` 교체
- [ ] **#17 하드코딩 파란색 hex** — `CrewOnboardingForm.tsx`, `guide/page.tsx`, `mission/page.tsx` → Tailwind 시맨틱 클래스로 교체

### E2E / QA

- [ ] **팀 분기 UI E2E 테스트** — blog/cafe 팀별 EssentialTaskList, 스탬프 상태, 챌린지 폼 분기 검증
- [ ] **챌린지 제출 플로우 E2E** — 키워드 선택 → 제출 → 어드민 승인 → 정산 행 생성 전 과정

---

## 완료된 항목 (참고용)

- ✅ **에러 핸들링 1차** — `loadData()` 무한 스피너, AI JSON 파싱, `calendar.ts` / `dashboard.ts` / `admin.ts` / `side_missions.ts` 쿼리 에러 처리
- ✅ **디자인 토큰 정의** — `globals.css` `@theme` 블록에 `brand-bg`, `brand-primary`, `rounded-brand` 등 8개 토큰
- ✅ **디자인 토큰 적용 (`/dashboard`)** — 121곳 하드코딩 값 교체
- ✅ **`PageHeader` 컴포넌트** — `src/components/shared/PageHeader.tsx` 생성, notice/faq/guide 페이지 적용
- ✅ **`MissionStatus` Enum** — `src/types/mission.ts` 생성, 9개 파일 28곳 string literal 교체
- ✅ **#1 브랜드 토큰 전체 적용** — login/onboarding/admin/missions 등 7개 파일, 하드코딩 hex·rounded 값 전량 교체
- ✅ **#2 네이티브 `<select>` 교체** — `admin/missions/page.tsx` 팀 필터 → shadcn/ui `<Select>`
- ✅ **챌린지 설정 시스템** — `challenge_configs` 테이블, `getActiveChallengeConfig()` / `upsertChallengeConfig()` 서버 액션, `/admin/challenge` 관리 UI (ChallengeConfigClient)
- ✅ **블로그 챌린지 미술관 선택 + 키워드** — 탭 UI로 3개 미술관 선택, naver_pay 리워드 시 키워드 3개 필수 선택, 체크마크 유지
- ✅ **챌린지 제출 어드민 뷰** — `getChallengeMissions()` / `updateChallengeStatus()` 추가, 어드민 추가미션 탭에 챌린지 섹션 삽입
- ✅ **`ParsedChallengeMission` 타입** — metaTag 파싱(challengeType, museum, rewardType, keywords) 서버 사이드 처리
- ✅ **`calendar.ts` 삭제** — 미사용 파일 제거
