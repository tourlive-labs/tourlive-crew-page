"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { SideMissionStatus } from "@/types/mission";

/**
 * Submits a new side mission
 */
export async function submitSideMission(missionType: string, proofUrl: string) {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        console.error("[SideMission] Auth Error:", authError);
        return { error: "로그인이 필요합니다." };
    }

    // 2. Get profile ID using robust two-step lookup
    const { data: crew, error: crewError } = await supabase
        .from('crews')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

    if (crewError) {
        console.error("[SideMission] Crew lookup error:", crewError);
    }

    let profile = null;
    if (crew) {
        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('id')
            .eq('crew_id', crew.id)
            .maybeSingle();
        if (profileError) {
            console.error("[SideMission] Profile lookup error:", profileError);
        }
        profile = profileData;
    }

    if (!profile) return { error: "프로필 정보를 불러올 수 없습니다." };

    // App Review Logic: Check if there's already an APPROVED one
    if (missionType === "앱 리뷰 (구글/앱스토어)") {
        const { data: existingAppReview } = await supabase
            .from('side_missions')
            .select('id')
            .eq('profile_id', profile.id)
            .eq('mission_type', missionType)
            .eq('status', SideMissionStatus.APPROVED)
            .maybeSingle();

        if (existingAppReview) {
            return { error: "이미 승인된 앱 리뷰가 존재합니다." };
        }
    }

    const { error } = await supabase
        .from('side_missions')
        .insert({
            profile_id: profile.id,
            mission_type: missionType,
            proof_url: proofUrl,
            status: SideMissionStatus.PENDING
        });

    if (error) {
        console.error("[SideMission Submit Error]", error);
        return { error: "제출 중 오류가 발생했습니다. (side_missions 테이블/RLS 정책을 확인해주세요)" };
    }

    revalidatePath("/dashboard");
    return { success: true };
}

/**
 * Retrieves the current user's side missions
 */
export async function getSideMissions() {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) {
            console.error("[SideMission] Auth Error:", authError);
        }
        if (!user) return { data: [] };

        const { data: crew, error: crewError } = await supabase
            .from('crews')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle();

        if (crewError) {
            console.error("[SideMission] Crew lookup error:", crewError);
        }

        let profile = null;
        if (crew) {
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('id')
                .eq('crew_id', crew.id)
                .maybeSingle();
            if (profileError) {
                console.error("[SideMission] Profile lookup error:", profileError);
            }
            profile = profileData;
        }

        if (!profile) return { data: [] };

        const { data, error } = await supabase
            .from('side_missions')
            .select('*')
            .eq('profile_id', profile.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error("[SideMission Fetch Error]", error);
            return { data: [] };
        }

        return { data: data || [] };
    } catch(err) {
        console.error("[SideMission] Fatal Error:", err);
        return { data: [] };
    }
}
