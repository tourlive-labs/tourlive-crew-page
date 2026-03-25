"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Submits a new side mission
 */
export async function submitSideMission(missionType: string, proofUrl: string) {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "로그인이 필요합니다." };

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('tourlive_email', user.email)
        .single();
        
    if (profileError || !profile) return { error: "프로필 정보를 불러올 수 없습니다." };

    // App Review Logic: Check if there's already an APPROVED one
    if (missionType === "앱 리뷰 (구글/앱스토어)") {
        const { data: existingAppReview } = await supabase
            .from('side_missions')
            .select('id')
            .eq('profile_id', profile.id)
            .eq('mission_type', missionType)
            .eq('status', 'APPROVED')
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
            status: 'PENDING'
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
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { data: [] };

        const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('tourlive_email', user.email)
            .single();
            
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
        return { data: [] };
    }
}
