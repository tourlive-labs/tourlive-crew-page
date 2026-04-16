# Supporters Hub — 잔여 개선 항목

> 마지막 업데이트: 2026-04-16  
> 이미 완료된 항목(에러 핸들링 1차, 디자인 토큰 `/dashboard`, PageHeader 컴포넌트, MissionStatus Enum)은 제외됨

---

## 🔴 즉시 (Critical)

- ✅ **#6 `dashboard/page.tsx` — 에러 시 완전 공백 화면** — `error` state 추가, 에러 UI(AlertCircle + 다시 시도 버튼) 렌더링으로 수정
- ✅ **#7 `onboarding.ts` — 중복 체크 쿼리 에러 미처리** — `globalEmailError` / `globalNicknameError` 체크 후 조기 반환 추가

---

## 🟡 높음 (High)

### #8 `admin/page.tsx` — `fetchError` 선언 후 미사용
- **파일**: `src/app/admin/page.tsx`
- **문제**: 크루 멤버 조회 실패 시 `fetchError` 체크 없음 → `crewMembers = null` → 빈 테이블 렌더링, 에러 안내 없음
- **수정 방향**: `fetchError` 체크 후 에러 UI 또는 redirect 처리

### #9 `CrewOnboardingForm.tsx` — 모집 마감 시 안내 없음
- **파일**: `src/components/CrewOnboardingForm.tsx`
- **문제**: `fetchActiveBatch`에서 error 무시, `is_active` 배치가 없으면 `activeBatch = null`인 채로 폼 표시. "현재 모집 중이 아닙니다" 같은 안내 없음
- **수정 방향**: `error` 변수 체크 + `activeBatch === null`일 때 모집 마감 안내 UI 추가

### #1 브랜드 토큰 미적용 — `/dashboard` 외 영역
- **파일**: `src/app/login/page.tsx`, `src/app/page.tsx`, `src/app/admin/page.tsx`, `src/app/admin/missions/page.tsx`, `src/components/CrewOnboardingForm.tsx`, `src/components/CrewManagementClient.tsx`, `src/components/AdminFilters.tsx`
- **문제**: `bg-[#F8F9FA]`, `bg-[#FF5C00]`, `rounded-[32px]` 등 하드코딩 값이 대량 잔존
- **수정 방향**: `/dashboard` 폴더에 적용한 것과 동일하게 브랜드 토큰으로 일괄 교체

주요 파일별 잔여 항목:
| 파일 | 남은 값 |
|---|---|
| `login/page.tsx` | `bg-[#F8F9FA]`, `bg-[#FF5C00]`, `hover:bg-[#E65300]`, `rounded-[32px]`, `text-[#FF5C00]` |
| `app/page.tsx` | `bg-[#F8F9FA]`, `border-[#FF5C00]` |
| `admin/page.tsx` | `bg-[#FDFCF9]` |
| `admin/missions/page.tsx` | `text-[#FF5C00]` 12곳, `rounded-[32px]` 3곳 |
| `CrewOnboardingForm.tsx` | `bg-[#F8F9FA]`, `rounded-[32px]`, `rounded-[24px]`, `bg-[#FF5C00]` |
| `CrewManagementClient.tsx` | `rounded-[40px]` |
| `AdminFilters.tsx` | `rounded-3xl` |

### #2 네이티브 `<select>` vs shadcn/ui `<Select>` 혼용
- **파일**: `src/app/admin/missions/page.tsx:193`
- **문제**: 팀 필터에 네이티브 `<select>` 사용. 같은 폼 안에서 shadcn/ui `<Input>`과 혼재 → 포커스/스타일 불일치
- **수정 방향**: shadcn/ui `<Select>` 컴포넌트로 교체

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
