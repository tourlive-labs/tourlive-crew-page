-- challenge_configs table — monthly challenge content management
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.challenge_configs (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month         TEXT NOT NULL,           -- '2026-05' — used for ordering/lookup
    badge_label   TEXT NOT NULL,           -- 'May 2026' — shown in the badge
    is_active     BOOLEAN NOT NULL DEFAULT false,

    -- Blog challenge
    blog_title      TEXT NOT NULL DEFAULT '파리 미술관 여행 포스팅 챌린지',
    blog_subtitle   TEXT NOT NULL DEFAULT '4월 미션 콘텐츠에 파리 3대 미술관 중 1개 포스팅',
    blog_condition  TEXT NOT NULL DEFAULT '4월 미션 콘텐츠 (여행 준비·기대평, 여행지 정보 전달)에 키워드 3개 이상 자연스럽게 포함하여 포스팅 후 제출',
    blog_museums    JSONB NOT NULL DEFAULT '[]',  -- [{name, emoji, keywords: string[]}]

    -- Cafe challenge
    cafe_date_range TEXT NOT NULL DEFAULT '4.1 — 4.30',
    cafe_subtitle   TEXT NOT NULL DEFAULT '매일 게시글 1 + 댓글 5',
    cafe_tiers      JSONB NOT NULL DEFAULT '[]',  -- [{days: number, reward: string}]

    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS challenge_configs_month_idx ON public.challenge_configs (month);

-- Only one active config at a time (enforced via server action)
-- updated_at trigger
CREATE TRIGGER challenge_configs_updated_at
    BEFORE UPDATE ON public.challenge_configs
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS
ALTER TABLE public.challenge_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read active config"
    ON public.challenge_configs FOR SELECT
    TO authenticated
    USING (is_active = true);

CREATE POLICY "Admin full access"
    ON public.challenge_configs FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'email' = 'root@tourlive.co.kr')
    WITH CHECK (auth.jwt() ->> 'email' = 'root@tourlive.co.kr');

-- Seed: April 2026 config (active)
INSERT INTO public.challenge_configs (
    month, badge_label, is_active,
    blog_title, blog_subtitle, blog_condition, blog_museums,
    cafe_date_range, cafe_subtitle, cafe_tiers
) VALUES (
    '2026-04',
    'April 2026',
    true,
    '파리 미술관 여행 포스팅 챌린지',
    '4월 미션 콘텐츠에 파리 3대 미술관 중 1개 포스팅',
    '4월 미션 콘텐츠 (여행 준비·기대평, 여행지 정보 전달)에 키워드 3개 이상 자연스럽게 포함하여 포스팅 후 제출',
    '[
        {
            "name": "루브르 박물관",
            "emoji": "🏛️",
            "keywords": [
                "루브르 박물관 투어", "루브르 박물관 입장권", "루브르 박물관 예약",
                "루브르 박물관 관람 팁", "루브르 박물관 필수 관람 코스", "루브르 박물관 지도",
                "루브르 박물관 모나리자", "루브르 박물관 밀로의 비너스",
                "루브르 박물관 사모트라케의 니케", "루브르 박물관 관람 시간",
                "루브르 박물관 야간 개장", "루브르 박물관 오디오 가이드",
                "루브르 박물관 입장 대기 줄", "루브르 박물관 추천 동선", "루브르 박물관 사진 촬영",
                "파리 박물관 투어", "파리 미술관 투어", "파리 워킹 투어", "파리 가이드 추천",
                "파리 여행 일정", "파리 당일 코스", "파리 추천 명소",
                "파리 소규모 투어", "파리 가족 여행 코스", "파리 가이드북"
            ]
        },
        {
            "name": "오르세 미술관",
            "emoji": "🌻",
            "keywords": [
                "오르세 미술관 투어", "오르세 미술관 입장권", "오르세 미술관 예약",
                "오르세 미술관 관람 팁", "오르세 미술관 필수 관람 코스", "오르세 미술관 지도",
                "오르세 미술관 인상파", "오르세 미술관 고흐", "오르세 미술관 모네",
                "오르세 미술관 르누아르", "오르세 미술관 야경", "오르세 미술관 관람 시간",
                "오르세 미술관 오디오 가이드", "오르세 미술관 입장 대기 줄",
                "오르세 미술관 추천 동선", "오르세 미술관 사진 촬영",
                "파리 박물관 투어", "파리 미술관 투어", "파리 워킹 투어", "파리 가이드 추천",
                "파리 여행 일정", "파리 당일 코스", "파리 추천 명소",
                "파리 소규모 투어", "파리 가족 여행 코스", "파리 가이드북"
            ]
        },
        {
            "name": "오랑주리 미술관",
            "emoji": "🪷",
            "keywords": [
                "오랑주리 미술관 투어", "오랑주리 미술관 입장권", "오랑주리 미술관 예약",
                "오랑주리 미술관 관람 팁", "오랑주리 미술관 필수 관람 코스", "오랑주리 미술관 지도",
                "오랑주리 미술관 모네 수련", "오랑주리 미술관 인상파",
                "오랑주리 미술관 관람 시간", "오랑주리 미술관 오디오 가이드",
                "오랑주리 미술관 입장 대기 줄", "오랑주리 미술관 추천 동선",
                "오랑주리 미술관 사진 촬영",
                "파리 박물관 투어", "파리 미술관 투어", "파리 워킹 투어", "파리 가이드 추천",
                "파리 여행 일정", "파리 당일 코스", "파리 추천 명소",
                "파리 소규모 투어", "파리 가족 여행 코스", "파리 가이드북"
            ]
        }
    ]',
    '4.1 — 4.30',
    '매일 게시글 1 + 댓글 5',
    '[
        {"days": 10, "reward": "1만원권"},
        {"days": 20, "reward": "3만원권"},
        {"days": 30, "reward": "5만원권"}
    ]'
) ON CONFLICT (month) DO NOTHING;
