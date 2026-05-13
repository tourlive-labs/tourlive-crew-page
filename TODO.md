# Supporters Hub — 잔여 개선 항목

> 마지막 업데이트: 2026-05-13 (커밋 490a09d)  
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

### ~~#10 `AuthProvider.tsx` — `any` 타입~~ — ✅ 완료
- `import type { User } from '@supabase/supabase-js'`, `useState<User | null>`, context 타입 적용

### ~~#11 `mypage/page.tsx` — `any` 타입 3곳~~ — ✅ 완료
- `ProfileData` 타입 정의, `useState<Record<string, string | null>>`, `result` 타입 내 `data?: any` 제거

### ~~#12 `calendar.ts` — `stamps: any[]`~~ — ✅ 삭제됨 (2026-04-20)
- `calendar.ts` 파일 자체가 제거되어 해당 사항 없음

---

## 🔵 낮음 (Low)

### ~~#15 어드민 페이지 `bg-[#F8F9FA]` 하드코딩~~ — ✅ 완료
- `admin/notices/page.tsx:36`, `admin/challenge/page.tsx:36` → `bg-slate-50` 교체

### ~~#16 네이티브 `<button>` 혼용~~ — ✅ 완료
- `CrewOnboardingForm.tsx:364` 배너 삭제 버튼 → `<Button variant="ghost" size="icon">`
- `mission/page.tsx:941` 새로고침 버튼 → `<Button variant="ghost" size="icon">`

### ~~#17 하드코딩된 파란색 계열 hex 값~~ — ✅ 완료
- `CrewOnboardingForm.tsx` 스텝 진행 바/인디케이터: `rose-50/100/600`, `indigo-50/100/700` 교체
- `guide/page.tsx:64`: `bg-indigo-50 text-indigo-700` 교체
- `mission/page.tsx`: `text-indigo-700`, `bg-indigo-50/50 border-indigo-100` 교체

### ~~#3 영어/한국어 텍스트 혼용~~ — ✅ 완료
- `admin/missions/page.tsx` 테이블 헤더 전량 한국어화 (User/Team, Cafe Reports, Survey Summary, Actions, Mission Type, Proof, Date, Tourlive Account, Name, Amount, Reason 등)
- `Sidebar.tsx`: "Tourlive Admin" → "투어라이브 어드민", "Support Center" → "서포트 센터"

---

---

## 🆕 앞으로의 TODO

### 인증

- [ ] **비밀번호 찾기 (로그인 페이지)** — 크루 대상 비밀번호 재설정 플로우. Supabase `resetPasswordForEmail()` 호출 → 이메일 발송 → `/reset-password` 페이지에서 새 비밀번호 설정 (현재 로그인 페이지에 링크 없음)


### 포인트 & 정산

- ✅ **정산 기수 동적 반영** — `[14기]` 하드코딩 → `profiles.batch` 동적 참조 (Essential + Side 두 곳 모두)
- ✅ **설문 xlsx 추출** — `getSurveyExportData()` 서버 액션 + 어드민 헤더 "설문 xlsx" 버튼 (SheetJS)

### 추가 미션 (Side Mission)

- ✅ **사진 첨부 증빙** — 사이드미션 제출 시 이미지 직접 업로드 지원 (`side-missions` 스토리지 버킷, `proof_images text[]` 컬럼)
- ✅ **어드민 증빙 이미지 뷰** — 추가미션 테이블 증빙 컬럼에 썸네일 표시 + 클릭 원본 오픈

### 챌린지 시스템 후속 작업

- [ ] **카페 챌린지 URL 검증** — 제출 시 실제 카페 포스팅 존재 여부 AI 검증 (블로그와 동일 패턴)
- [ ] **네이버페이 리워드 수동 지급 흐름** — `naver_pay` 리워드 타입은 현재 정산 자동화 없음. 별도 어드민 UI or 메모 추가 필요
- [ ] **챌린지 중복 제출 방지** — 같은 달 같은 챌린지 타입(blog_paris/cafe_streak)은 1회만 허용하도록 서버 액션 가드 추가
- [ ] **챌린지 현황 대시보드** — 크루 마이페이지에 본인 챌린지 제출 이력 표시 (현재 스탬프 상태만 노출)

### 공지사항 시스템

- ✅ **#4 `notice/page.tsx` — DB 연동** — Supabase `notices` 테이블 연동, `/dashboard/notice/[id]` 상세 페이지 완료
- ✅ **공지 카드 클릭 동작** — `<Link href="/dashboard/notice/${id}">` 래핑, 상세 페이지에서 ReactMarkdown 렌더링
- ✅ **공지 이미지 라이트박스** — `NoticeImageViewer` 컴포넌트: 썸네일 그리드 + 풀스크린 라이트박스(줌/드래그/핀치/앞뒤 탐색)

### 코드 품질

- ✅ **#5 `faq/page.tsx` — 마크다운 파싱** — `react-markdown@10.1.0` 설치, `faqMarkdownComponents` 적용 완료
- ✅ **#10 `AuthProvider.tsx` — `any` 타입** — `import type { User } from '@supabase/supabase-js'`, `useState<User | null>`, context 타입 적용 완료
- ✅ **#11 `mypage/page.tsx` — `any` 타입** — `ProfileData` 타입 정의, `useState<Record<string, string | null>>`, `result` 타입 내 `data?: any` 제거 완료
- ✅ **#13 `mission/page.tsx` — 에러 시 공백 화면** — `error` state + AlertCircle UI 추가 완료
- ✅ **#14 `notices.ts`/`challenge-config.ts` — throw 패턴 불일치** — `return { error }` 패턴 통일 완료
- ✅ **어드민 크루 명단 분야 필터 버그** — 필터 값 `personal_blog` → `naver_blog` 수정, 비교 로직을 표시 로직과 동일하게 변경, "개인 블로그" → "네이버 블로그" 텍스트 통일
- ✅ **#3 영어/한국어 텍스트 혼용** — `MarkPaidButton`, 어드민 링크 버튼, Sidebar 등 잔여 영문 텍스트 한국어화
- ✅ **#15 어드민 페이지 `bg-[#F8F9FA]`** — `admin/notices`, `admin/challenge` → `bg-slate-50` 교체
- ✅ **#16 네이티브 `<button>` 혼용** — `CrewOnboardingForm.tsx`, `mission/page.tsx` → shadcn/ui `<Button>` 교체
- ✅ **#17 하드코딩 파란색 hex** — `CrewOnboardingForm.tsx`, `guide/page.tsx`, `mission/page.tsx` → Tailwind 시맨틱 클래스로 교체

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
