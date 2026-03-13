"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

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
