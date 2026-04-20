-- notices table for /dashboard/notice
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.notices (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title       TEXT NOT NULL,
    content     TEXT,               -- Markdown supported
    category    TEXT,               -- e.g. '공지', '이벤트', '안내' (optional)
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER notices_updated_at
    BEFORE UPDATE ON public.notices
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS: authenticated users can read published notices
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read published notices"
    ON public.notices FOR SELECT
    TO authenticated
    USING (is_published = true);

CREATE POLICY "Admin full access"
    ON public.notices FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'email' = 'root@tourlive.co.kr')
    WITH CHECK (auth.jwt() ->> 'email' = 'root@tourlive.co.kr');

-- Sample data
INSERT INTO public.notices (title, content, category) VALUES
(
    '14기 크루 여러분 환영합니다!',
    E'## 안녕하세요, 투어라이브 크루 14기 여러분!\n\n크루 포털이 오픈되었습니다. 아래 안내를 꼭 읽어주세요.\n\n### 필수 확인 사항\n\n- **마이페이지** 에서 닉네임과 배너를 설정해 주세요.\n- **활동 제출** 탭에서 매월 미션을 제출합니다.\n- **이달의 챌린지** 를 확인하고 추가 포인트를 획득하세요!\n\n궁금한 점은 [root@tourlive.co.kr](mailto:root@tourlive.co.kr)로 문의해 주세요.',
    '공지'
),
(
    '4월 활동 안내 및 마감일 공지',
    E'## 4월 필수 활동 마감 안내\n\n4월 필수 활동 제출 마감일은 **4월 30일 (수)** 입니다.\n\n### 제출 방법\n\n1. 좌측 메뉴 **활동 제출** 클릭\n2. 포스팅 URL 입력 후 5대 체크리스트 확인\n3. **최종 미션 제출하기** 버튼 클릭\n\n마감일을 꼭 지켜주세요!',
    '안내'
);
