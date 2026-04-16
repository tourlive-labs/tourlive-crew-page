"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { MissionStatus, SideMissionStatus } from "@/types/mission";

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
        .in('status', [MissionStatus.PENDING_APPROVAL, MissionStatus.REJECTED, 'rejected'])
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
        .in('status', [SideMissionStatus.PENDING, SideMissionStatus.REJECTED])
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
export async function updateEssentialStatus(missionId: string, status: typeof MissionStatus.COMPLETED | typeof MissionStatus.REJECTED, feedback?: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('missions')
        .update({
            status,
            admin_feedback: feedback,
            updated_at: new Date().toISOString()
        })
        .eq('id', missionId);

    if (!error && status === MissionStatus.COMPLETED) {
        console.log('[Settlement] Essential mission approved. Fetching mission data for settlement...', missionId);
        const { data: mission, error: fetchError } = await supabase
            .from('missions')
            .select('*, profiles(tourlive_email, nickname)')
            .eq('id', missionId)
            .single();
            
        if (fetchError) {
            console.error('[Settlement] Fetch mission error:', fetchError.message);
        } else if (mission) {
            console.log('[Settlement] Creating settlement row for profile:', mission.profile_id);
            const { error: insertError } = await supabase.from('point_settlements').insert({
                profile_id: mission.profile_id,
                mission_id: missionId,
                amount: 50000,
                reason: `[14기] ${mission.mission_month}월 필수활동 완료`,
                status: 'PENDING'
            });
            
            if (insertError) {
                console.error('[Settlement] Insert error:', insertError.message);
            } else {
                console.log('[Settlement] Success! Row created for:', mission.profiles?.nickname || mission.profile_id);
            }
        }
    }

    if (!error) revalidatePath("/admin/missions");
    return { success: !error, error: error?.message };
}

/**
 * Update side mission status
 */
export async function updateSideStatus(missionId: string, status: typeof SideMissionStatus.APPROVED | typeof SideMissionStatus.REJECTED, feedback?: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('side_missions')
        .update({
            status,
            admin_feedback: feedback,
            updated_at: new Date().toISOString()
        })
        .eq('id', missionId);

    if (!error && status === SideMissionStatus.APPROVED) {
        console.log('[Settlement] Side mission approved. Fetching mission data for settlement...', missionId);
        const { data: mission, error: fetchError } = await supabase
            .from('side_missions')
            .select('*, profiles(tourlive_email, nickname)')
            .eq('id', missionId)
            .single();

        if (fetchError) {
            console.error('[Settlement] Fetch side mission error:', fetchError.message);
        } else if (mission) {
            const pointMap: Record<string, number> = {
                "앱 리뷰 (구글/앱스토어)": 10000,
                "포토 리뷰 (투어라이브)": 2000,
                "트랙 댓글 (투어라이브)": 1000,
                "지도/정보 오류 제보": 3000,
                "이달의 챌린지 - Cafe": 0,
                "이달의 챌린지 - Blog": 0
            };
            const amount = pointMap[mission.mission_type] || 0;
            if (amount > 0) {
                console.log('[Settlement] Creating settlement row for side mission:', mission.mission_type);
                const { error: insertError } = await supabase.from('point_settlements').insert({
                    profile_id: mission.profile_id,
                    mission_id: missionId,
                    amount: amount,
                    reason: `[14기] 추가미션: ${mission.mission_type}`,
                    status: 'PENDING'
                });

                if (insertError) {
                    console.error('[Settlement] Insert error:', insertError.message);
                } else {
                    console.log('[Settlement] Success! Row created for:', mission.profiles?.nickname || mission.profile_id);
                }
            }
        }
    }

    if (!error) revalidatePath("/admin/missions");
    return { success: !error, error: error?.message };
}

/**
 * Get leaderboard data (Total points per user - Excluding Admin accounts)
 */
export async function getAdminLeaderboard() {
    const supabase = await createClient();

    // Fetch all profiles excluding admin role
    const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, nickname, tourlive_email, selected_activity, role')
        .neq('role', 'admin');

    if (profilesError) {
        console.error("[Admin] Leaderboard Profiles Error:", profilesError);
        return { data: [] };
    }

    // Fetch all approved missions
    const { data: missions, error: missionsError } = await supabase.from('missions').select('profile_id, status').eq('status', MissionStatus.COMPLETED);

    if (missionsError) {
        console.error("[Admin] Leaderboard Missions Error:", missionsError);
        return { data: [] };
    }

    // Fetch all approved side missions
    const { data: sideMissions, error: sideMissionsError } = await supabase.from('side_missions').select('profile_id, mission_type, status').eq('status', SideMissionStatus.APPROVED);

    if (sideMissionsError) {
        console.error("[Admin] Leaderboard Side Missions Error:", sideMissionsError);
        return { data: [] };
    }

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
/**
 * Fetch all pending point settlements
 */
export async function getPendingSettlements() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('point_settlements')
        .select(`
            *,
            profiles (
                nickname,
                tourlive_email
            )
        `)
        .eq('status', 'PENDING')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("[Admin] Fetch Settlements Error:", error);
        return { data: [] };
    }

    return { data: data || [] };
}

/**
 * Mark a settlement as paid
 */
export async function markAsPaid(settlementId: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('point_settlements')
        .update({ status: 'PAID', updated_at: new Date().toISOString() })
        .eq('id', settlementId);

    if (!error) revalidatePath("/admin/missions");
    return { success: !error, error: error?.message };
}
