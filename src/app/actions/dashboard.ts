"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function getDashboardData() {
    const supabase = await createClient();

    // 1. Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { error: "로그인이 필요합니다." };
    }

    // 2. Get profile and crew info
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(`
            id,
            nickname,
            selected_activity,
            created_at,
            naver_id,
            crews (
                id,
                batch_id,
                batches (
                    term,
                    start_date
                )
            )
        `)
        .eq('tourlive_email', user.email)
        .single();

    if (profileError || !profile) {
        console.error("Dashboard Profile Error:", profileError);
        return { error: "프로필 정보를 불러올 수 없습니다." };
    }

    const crew = profile.crews as any;
    const batch = crew?.batches;
    const batchId = crew?.batch_id;

    if (!batchId) {
        return { error: "소속된 기수 정보를 찾을 수 없습니다." };
    }

    // 3. Get activity schedules
    const { data: schedules, error: scheduleError } = await supabase
        .from('activity_schedules')
        .select('*')
        .eq('batch_id', batchId)
        .order('scheduled_at', { ascending: true });

    if (scheduleError) {
        console.error("Dashboard Schedule Error:", scheduleError);
    }

    // 4. Get submissions to track mission completion
    const { data: submissions, error: submissionError } = await supabase
        .from('submissions')
        .select('activity_id')
        .eq('crew_id', crew.id);

    // Calculate D-Day
    const startDate = batch.start_date ? new Date(batch.start_date) : new Date(profile.created_at);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - startDate.getTime());
    const dDay = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Map essential missions tracking
    const essentialMissions = (schedules || [])
        .filter(s => s.is_essential && s.type === 'mission')
        .map(s => {
            const scheduledAt = new Date(s.scheduled_at);
            const isCompleted = (submissions || []).some(sub => sub.activity_id === s.id);

            let status: 'completed' | 'ongoing' | 'pending' = 'pending';
            if (isCompleted) {
                status = 'completed';
            } else if (scheduledAt.getMonth() === today.getMonth() && scheduledAt.getFullYear() === today.getFullYear()) {
                status = 'ongoing';
            }

            return {
                id: s.id,
                title: s.title,
                status
            };
        });

    // 5. Get current monthly mission
    const missionMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    const { data: currentMission } = await supabase
        .from('missions')
        .select('*')
        .eq('profile_id', profile.id)
        .eq('mission_month', missionMonth)
        .maybeSingle();

    return {
        nickname: profile.nickname,
        naver_id: profile.naver_id,
        team: profile.selected_activity,
        term: batch.term,
        dDay,
        essentialMissions,
        schedules: schedules || [],
        currentMission: currentMission || { status: 'none' }
    };
}
