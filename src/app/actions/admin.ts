"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Fetch all missions pending approval (Excluding Admin accounts)
 */
export async function getPendingEssentialMissions() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: [] };

    const { data, error } = await supabase
        .from('missions')
        .select(`
            *,
            profiles (
                role,
                nickname,
                tourlive_email,
                selected_activity
            )
        `)
        .eq('status', 'PENDING_APPROVAL')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("[Admin] Fetch Missions Error:", error);
        return { data: [] };
    }

    // Filter out users with admin role
    const filteredData = data?.filter((m: any) => m.profiles?.role !== 'admin') || [];

    return { data: filteredData };
}

/**
 * Fetch all side missions pending approval (Excluding Admin accounts)
 */
export async function getPendingSideMissions() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('side_missions')
        .select(`
            *,
            profiles (
                role,
                nickname,
                tourlive_email,
                selected_activity
            )
        `)
        .eq('status', 'PENDING')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("[Admin] Fetch Side Missions Error:", error);
        return { data: [] };
    }

    // Filter out users with admin role
    const filteredData = data?.filter((m: any) => m.profiles?.role !== 'admin') || [];
    return { data: filteredData };
}

/**
 * Update essential mission status
 */
export async function updateEssentialStatus(missionId: string, status: 'completed' | 'REJECTED', feedback?: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('missions')
        .update({ 
            status, 
            admin_feedback: feedback,
            updated_at: new Date().toISOString()
        })
        .eq('id', missionId);

    if (!error) revalidatePath("/admin/missions");
    return { success: !error, error: error?.message };
}

/**
 * Update side mission status
 */
export async function updateSideStatus(missionId: string, status: 'APPROVED' | 'REJECTED', feedback?: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('side_missions')
        .update({ 
            status, 
            admin_feedback: feedback,
            updated_at: new Date().toISOString()
        })
        .eq('id', missionId);

    if (!error) revalidatePath("/admin/missions");
    return { success: !error, error: error?.message };
}

/**
 * Get leaderboard data (Total points per user - Excluding Admin accounts)
 */
export async function getAdminLeaderboard() {
    const supabase = await createClient();
    
    // Fetch all profiles excluding admin role
    const { data: profiles } = await supabase
        .from('profiles')
        .select('id, nickname, tourlive_email, selected_activity, bank_name, bank_account, bank_holder, role')
        .neq('role', 'admin');
    
    // Fetch all approved missions
    const { data: missions } = await supabase.from('missions').select('profile_id, status').eq('status', 'completed');
    
    // Fetch all approved side missions
    const { data: sideMissions } = await supabase.from('side_missions').select('profile_id, mission_type, status').eq('status', 'APPROVED');

    const pointMap: Record<string, number> = {
        "앱 리뷰 (구글/앱스토어)": 10000,
        "포토 리뷰 (투어라이브)": 2000,
        "트랙 댓글 (투어라이브)": 1000,
        "지도/정보 오류 제보": 3000,
        "이달의 챌린지 - Cafe": 0,
        "이달의 챌린지 - Blog": 0
    };

    const leaderboard = profiles?.map(p => {
        let totalPoints = 0;
        
        // Essential mission points (Let's assume 30,000 per completed month for now)
        const completedMissions = missions?.filter(m => m.profile_id === p.id).length || 0;
        totalPoints += completedMissions * 30000;

        // Side mission points
        const userSideMissions = sideMissions?.filter(sm => sm.profile_id === p.id) || [];
        userSideMissions.forEach(sm => {
            totalPoints += pointMap[sm.mission_type] || 0;
        });

        return {
            ...p,
            totalPoints
        };
    }).sort((a, b) => b.totalPoints - a.totalPoints);

    return { data: leaderboard || [] };
}
