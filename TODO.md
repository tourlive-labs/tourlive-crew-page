# Supporters Hub — 잔여 개선 항목

> 마지막 업데이트: 2026-04-16 (커밋 00c12fe)  
> 이미 완료된 항목(에러 핸들링 1차, 디자인 토큰 `/dashboard`, PageHeader 컴포넌트, MissionStatus Enum)은 제외됨

---

## 🔴 즉시 (Critical)

- ✅ **#6 `dashboard/page.tsx` — 에러 시 완전 공백 화면** — `error` state 추가, 에러 UI(AlertCircle + 다시 시도 버튼) 렌더링으로 수정
- ✅ **#7 `onboarding.ts` — 중복 체크 쿼리 에러 미처리** — `globalEmailError` / `globalNicknameError` 체크 후 조기 반환 추가

---

## 🟡 높음 (High)

- ✅ **#8 `admin/page.tsx` — `fetchError` 선언 후 미사용** — `fetchError` 체크 후 AlertCircle 에러 카드(메시지 + 다시 시도 링크) 렌더링으로 수정

- ✅ **#9 `CrewOnboardingForm.tsx` — 모집 마감 시 안내 없음** — `batchLoading` state 추가, `error`/`PGRST116` 처리, `activeBatch === null`일 때 CalendarOff 아이콘 + "현재 모집 중이 아닙니다" 카드 렌더링

- ✅ **#1 브랜드 토큰 미적용 — `/dashboard` 외 영역** — `login`, `page`, `admin`, `missions`, `CrewOnboardingForm`, `CrewManagementClient`, `AdminFilters` 전체 교체 완료
- ✅ **#2 네이티브 `<select>` vs shadcn/ui `<Select>` 혼용** — `admin/missions/page.tsx` 팀 필터 교체 완료

---

## 🟢 보통 (Medium)

### #5 `faq/page.tsx` — 마크다운 raw 렌더링
- **파일**: `src/app/dashboard/faq/page.tsx`
- **문제**: `**[오디오 가이드 사용 후기]**` 같은 마크다운이 파싱 없이 문자열 자르기로 임시 처리됨. 렌더링이 깨질 수 있음
- **수정 방향**: `react-markdown` 또는 간단한 bold 파서 적용 (또는 FAQ 데이터를 JSX로 전환)

### #4 `notice/page.tsx` — 정적 데이터 + 죽은 클릭
- **파일**: `src/app/dashboard/notice/page.tsx`
- **문제 1**: 공지사항이 `const notices = [...]` 하드코딩 — DB 연동 없음
- **문제 2**: 카드에 `cursor-pointer` 클래스 있지만 `onClick`/`href` 없음 — 클릭해도 반응 없음
- **수정 방향**: Supabase `notices` 테이블 연동 또는 href 제거, cursor-pointer 제거

### #10 `AuthProvider.tsx` — `any` 타입 (CLAUDE.md 규칙 위반)
- **파일**: `src/components/AuthProvider.tsx`
- **문제**: `user: any | null` — Supabase `User` 타입 사용 가능한데 `any` 사용
- **수정 방향**: `import type { User } from '@supabase/supabase-js'` 후 교체

### #11 `mypage/page.tsx` — `any` 타입 3곳
- **파일**: `src/app/dashboard/mypage/page.tsx`
- **문제**: `useState<any>({})`, `initialValues: any`, `(prev: any) =>` — 구체적 프로필 타입 정의 필요
- **수정 방향**: Supabase 자동생성 타입 또는 로컬 인터페이스 적용

### #12 `calendar.ts` — `stamps: any[]`
- **파일**: `src/app/actions/calendar.ts`
- **문제**: stamp 객체 구조가 코드에 명확히 정의되어 있는데 `any[]` 선언
- **수정 방향**: 인라인 타입 또는 `src/types/mission.ts`에 `StampItem` 인터페이스 추가

---

## 🔵 낮음 (Low)

### #3 영어/한국어 텍스트 혼용
- **문제**: 관리자/내부 UI에 영어 텍스트가 섞여 있음

| 위치 | 현재 텍스트 | 제안 |
|---|---|---|
| `MarkPaidButton.tsx:43` | `"Mark Points as Paid"` | `"포인트 지급 완료 처리"` |
| `admin/missions/page.tsx` 링크 버튼 | `"Link 1"`, `"Link 2"` | `"링크 1"`, `"링크 2"` |
| `admin/page.tsx:69` | `"Admin Portal"` 뱃지 | `"관리자"` |
| `Sidebar.tsx:76` | `"Portal v2.0"` | `"크루 포털"` 또는 제거 |

---

## 완료된 항목 (참고용)

- ✅ **에러 핸들링 1차** — `loadData()` 무한 스피너, AI JSON 파싱, `calendar.ts` / `dashboard.ts` / `admin.ts` / `side_missions.ts` 쿼리 에러 처리
- ✅ **디자인 토큰 정의** — `globals.css` `@theme` 블록에 `brand-bg`, `brand-primary`, `rounded-brand` 등 8개 토큰
- ✅ **디자인 토큰 적용 (`/dashboard`)** — 121곳 하드코딩 값 교체
- ✅ **`PageHeader` 컴포넌트** — `src/components/shared/PageHeader.tsx` 생성, notice/faq/guide 페이지 적용
- ✅ **`MissionStatus` Enum** — `src/types/mission.ts` 생성, 9개 파일 28곳 string literal 교체
- ✅ **#1 브랜드 토큰 전체 적용** — login/onboarding/admin/missions 등 7개 파일, 하드코딩 hex·rounded 값 전량 교체
- ✅ **#2 네이티브 `<select>` 교체** — `admin/missions/page.tsx` 팀 필터 → shadcn/ui `<Select>`
