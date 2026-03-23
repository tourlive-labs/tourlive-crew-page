"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import * as cheerio from "cheerio";

/**
 * Submits a mission link for the current month.
 */
export async function submitMission(postUrl: string) {
    const supabase = await createClient();

    // 1. Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { error: "로그인이 필요합니다." };
    }

    // 2. Get profile ID
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('tourlive_email', user.email)
        .single();

    if (profileError || !profile) {
        return { error: "프로필 정보를 찾을 수 없습니다." };
    }

    // 3. Current month (YYYY-MM)
    const now = new Date();
    const missionMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // 4. Upsert mission
    const { error: upsertError } = await supabase
        .from('missions')
        .upsert({
            profile_id: profile.id,
            mission_month: missionMonth,
            post_url: postUrl,
            status: 'checking', // Placeholder status for this phase
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'profile_id,mission_month'
        });

    if (upsertError) {
        console.error("[Mission] Submit Error:", upsertError);
        return { error: "미션 제출 중 오류가 발생했습니다." };
    }

    revalidatePath("/dashboard");
    return { success: true };
}

/**
 * Admin action to mark points as paid.
 */
export async function markPointsPaid(missionId: string) {
    const supabase = await createClient();

    // 1. Check admin authorization
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { error: "로그인이 필요합니다." };
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('tourlive_email', user.email)
        .maybeSingle();

    const isAdmin = profile?.role === 'admin' || user.email === "root@tourlive.co.kr";

    if (!isAdmin) {
        return { error: "관리자 권한이 없습니다." };
    }

    // 2. Update points_granted
    const { error: updateError } = await supabase
        .from('missions')
        .update({ points_granted: true, updated_at: new Date().toISOString() })
        .eq('id', missionId);

    if (updateError) {
        console.error("[Mission] Update Points Error:", updateError);
        return { error: "포인트 지급 처리 중 오류가 발생했습니다." };
    }

    revalidatePath("/manage");
    return { success: true };
}

/**
 * Registers one's Naver ID in the profile.
 */
export async function registerNaverId(naverId: string) {
    const supabase = await createClient();

    // 1. Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { error: "로그인이 필요합니다." };
    }

    // 2. Update profiles table
    const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
            naver_id: naverId,
            updated_at: new Date().toISOString()
        })
        .eq('tourlive_email', user.email);

    if (updateError) {
        console.error("[Profile] Register Naver ID Error:", updateError);
        return { error: "네이버 ID 등록 중 오류가 발생했습니다." };
    }

    revalidatePath("/dashboard/mission");
    return { success: true };
}

/**
 * Scrapes Naver Cafe to sync activity counts.
 */
export async function syncCafeActivity(naverId: string) {
    if (!naverId) return { error: "네이버 ID가 등록되어 있지 않습니다." };

    const supabase = await createClient();
    const CLUB_ID = "31034331";
    const USER_AGENT = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1";

    // 1. Get current month range (March 2026 for now, but dynamic is better)
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed
    const missionMonthLabel = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;

    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0);

    const headers: Record<string, string> = { "User-Agent": USER_AGENT };
    const adminCookie = process.env.NAVER_ADMIN_COOKIE;
    if (adminCookie) {
        headers["Cookie"] = adminCookie;
    } else {
        console.warn("[Cafe Sync] NAVER_ADMIN_COOKIE is not set. Scraping might fail or be blocked.");
    }

    try {
        // 2. Fetch Posts
        const postSearchUrl = `https://m.cafe.naver.com/ArticleSearchList.nhn?search.clubid=${CLUB_ID}&search.writer=${naverId}`;
        const postRes = await fetch(postSearchUrl, { headers });
        if (!postRes.ok) throw new Error("Naver Cafe post fetch failed");
        
        const postHtml = await postRes.text();
        
        // Check for session expiry / login redirects
        if (postRes.url.includes("nid.naver.com") || postHtml.includes("<title>네이버 : 로그인</title>")) {
            throw new Error("SESSION_EXPIRED");
        }
        const $posts = cheerio.load(postHtml);
        
        let postCount = 0;
        $posts("ul.list_area li").each((_, el) => {
            const dateStr = $posts(el).find(".time").text().trim();
            // Naver mobile dates are like "24.03.11." or "12:30" (for today)
            // If it's time, it's today (this month).
            // If it's date, we check if it falls in the current month.
            if (dateStr.includes(':')) {
                postCount++;
            } else {
                // Parse date string (e.g., "24.03.11.")
                const parts = dateStr.split('.').map(p => p.trim()).filter(p => p);
                if (parts.length === 3) {
                    const year = 2000 + parseInt(parts[0]);
                    const month = parseInt(parts[1]) - 1;
                    const day = parseInt(parts[2]);
                    const postDate = new Date(year, month, day);
                    if (postDate >= startOfMonth && postDate <= endOfMonth) {
                        postCount++;
                    }
                }
            }
        });

        // 3. Fetch Comments (Member activity log)
        const commentSearchUrl = `https://m.cafe.naver.com/CafeMemberNetworkView.nhn?search.clubid=${CLUB_ID}&search.memberid=${naverId}&search.networkType=COMMENT`;
        const commentRes = await fetch(commentSearchUrl, { headers });
        if (!commentRes.ok) throw new Error("Naver Cafe comment fetch failed");

        const commentHtml = await commentRes.text();

        // Check for session expiry / login redirects
        if (commentRes.url.includes("nid.naver.com") || commentHtml.includes("<title>네이버 : 로그인</title>")) {
            throw new Error("SESSION_EXPIRED");
        }
        const $comments = cheerio.load(commentHtml);
        
        let commentCount = 0;
        $comments("ul.list_area li").each((_, el) => {
            const dateStr = $comments(el).find(".time").text().trim();
            if (dateStr.includes(':')) {
                commentCount++;
            } else {
                const parts = dateStr.split('.').map(p => p.trim()).filter(p => p);
                if (parts.length === 3) {
                    const year = 2000 + parseInt(parts[0]);
                    const month = parseInt(parts[1]) - 1;
                    const day = parseInt(parts[2]);
                    const commentDate = new Date(year, month, day);
                    if (commentDate >= startOfMonth && commentDate <= endOfMonth) {
                        commentCount++;
                    }
                }
            }
        });

        // 4. Update Database
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { error: "로그인이 필요합니다." };

        const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('tourlive_email', user.email)
            .single();

        if (!profile) return { error: "프로필을 찾을 수 없습니다." };

        const isCompleted = postCount >= 5 && commentCount >= 30;

        const { error: updateError } = await supabase
            .from('missions')
            .upsert({
                profile_id: profile.id,
                mission_month: missionMonthLabel,
                cafe_post_count: postCount,
                cafe_comment_count: commentCount,
                is_cafe_mission_completed: isCompleted,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'profile_id,mission_month'
            });

        if (updateError) throw updateError;

        revalidatePath("/dashboard/mission");
        return { 
            success: true, 
            postCount, 
            commentCount, 
            isCompleted,
            lastSyncedAt: new Date().toISOString()
        };

    } catch (error) {
        console.error("[Cafe Sync Error]", error);
        if (error instanceof Error && error.message === "SESSION_EXPIRED") {
            return { error: "관리자 네이버 봇 세션이 만료되었습니다. Vercel 환경변수에서 쿠키를 갱신해 주세요." };
        }
        return { error: "네이버 통신이 원활하지 않습니다. 잠시 후 다시 시도하거나 ID를 확인해주세요." };
    }
}
