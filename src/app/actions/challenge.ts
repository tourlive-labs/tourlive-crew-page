"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export type ChallengeType = "blog_paris" | "cafe_streak";
export type MuseumType = "louvre" | "orsay" | "orangerie";
export type RewardType = "points" | "naver_pay";

interface ChallengeSubmitParams {
    challengeType: ChallengeType;
    postUrl: string;
    museum?: MuseumType;       // Blog challenge only
    rewardType?: RewardType;   // Blog challenge only — "points" | "naver_pay"
    note?: string;
}

/**
 * Submits a challenge entry to the missions table.
 * Challenge submissions are identified by the [CHALLENGE] prefix on post_url
 * and mission_type stored in the rejection_reason field as a metadata tag
 * (re-used since challenges skip the AI verifier — no real rejection).
 */
export async function submitChallenge({
    challengeType,
    postUrl,
    museum,
    rewardType,
    note,
}: ChallengeSubmitParams) {
    const supabase = await createClient();

    // 1. Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { error: "로그인이 필요합니다." };

    // 2. Profile lookup (two-step via crews)
    const { data: crew } = await supabase
        .from("crews")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

    if (!crew) return { error: "소속 기수 정보를 찾을 수 없습니다." };

    const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("crew_id", crew.id)
        .maybeSingle();

    if (!profile) return { error: "프로필 정보를 찾을 수 없습니다." };

    // 3. Basic URL validation
    const trimmedUrl = postUrl.trim();
    if (!trimmedUrl || (!trimmedUrl.startsWith("http://") && !trimmedUrl.startsWith("https://"))) {
        return { error: "올바른 URL을 입력해 주세요. (https://로 시작해야 합니다)" };
    }

    if (challengeType === "blog_paris") {
        const isNaverBlog = trimmedUrl.includes("blog.naver.com") || trimmedUrl.includes("naver.me");
        if (!isNaverBlog) {
            return { error: "네이버 블로그 주소(blog.naver.com)를 입력해 주세요." };
        }
    }

    if (challengeType === "cafe_streak") {
        const isNaverCafe = trimmedUrl.includes("cafe.naver.com") || trimmedUrl.includes("naver.me");
        if (!isNaverCafe) {
            return { error: "네이버 카페 주소(cafe.naver.com)를 입력해 주세요." };
        }
    }

    // 4. Build metadata tag
    //    Format: [CHALLENGE:{type}:{museum?}:{rewardType?}]
    const museumTag   = museum     ? `:${museum}`     : "";
    const rewardTag   = rewardType ? `:${rewardType}` : "";
    const metaTag = `[CHALLENGE:${challengeType}${museumTag}${rewardTag}]${note ? " " + note : ""}`;

    // 5. Current month key for grouping
    const now = new Date();
    const missionMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    // 6. Prefix URL so admin can distinguish from regular missions
    const taggedUrl = `[CHALLENGE] ${trimmedUrl}`;

    // 7. Upsert into missions table
    //    We allow multiple challenges per month by appending (comma-separated) if already exists
    const { data: existing } = await supabase
        .from("missions")
        .select("id, post_url")
        .eq("profile_id", profile.id)
        .eq("mission_month", missionMonth)
        .ilike("post_url", "[CHALLENGE]%")
        .maybeSingle();

    let finalUrl = taggedUrl;
    if (existing?.post_url && !existing.post_url.includes(trimmedUrl)) {
        finalUrl = `${existing.post_url},${taggedUrl}`;
    }

    const upsertPayload = {
        profile_id: profile.id,
        mission_month: missionMonth,
        post_url: finalUrl,
        status: "PENDING_APPROVAL" as const,
        rejection_reason: metaTag,
        admin_feedback: null,
        updated_at: new Date().toISOString(),
    };

    const { error: upsertError } = existing
        ? await supabase.from("missions").update(upsertPayload).eq("id", existing.id)
        : await supabase.from("missions").insert(upsertPayload);

    if (upsertError) {
        console.error("[Challenge] Submit Error:", upsertError);
        return { error: "챌린지 제출 중 오류가 발생했습니다." };
    }

    revalidatePath("/dashboard/challenge");
    revalidatePath("/admin");

    return { success: true };
}
