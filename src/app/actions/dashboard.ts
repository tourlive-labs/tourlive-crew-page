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

    // 2. Get profile and crew info using robust two-step lookup
    console.log("[DashboardAction] Fetching profile for user:", user.id);

    // Step A: Find Crew record
    const { data: crew, error: crewError } = await supabase
        .from('crews')
        .select(`
            id,
            batch_id,
            batches (
                id,
                term,
                start_date
            )
        `)
        .eq('user_id', user.id)
        .maybeSingle();

    if (crewError || !crew) {
        console.error("Dashboard Crew Error:", crewError);
        return { error: "소속된 기수 정보를 찾을 수 없습니다." };
    }

    // Step B: Find Profile
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(`
            id,
            nickname,
            selected_activity,
            created_at,
            naver_id,
            role
        `)
        .eq('crew_id', crew.id)
        .maybeSingle();

    if (profileError || !profile) {
        console.error("Dashboard Profile Error:", profileError);
        return { error: "프로필 정보를 불러올 수 없습니다." };
    }

    const batch = crew.batches as any;
    const batchId = crew.batch_id;

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

    // 6. Add special/fixed events
    const specialEvents = [
        {
            id: 'kickoff',
            title: '발대식',
            scheduled_at: '2026-03-03T16:00:00+09:00',
            description: '서포터즈 공식 발대식 진행 (16:00)',
            type: 'event',
            is_essential: false
        }
    ];

    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const deadlineEvent = {
        id: `deadline-${currentMonth + 1}`,
        title: `${currentMonth + 1}월 활동 마감`,
        scheduled_at: new Date(currentYear, currentMonth, lastDay.getDate(), 23, 59, 0).toISOString(),
        description: '당월 모든 미션 수행 및 제출 마감 (23:59)',
        type: 'mission',
        is_essential: true
    };

    const allSchedules = [...(schedules || []), ...specialEvents, deadlineEvent];

    return {
        nickname: profile.nickname,
        naver_id: profile.naver_id,
        team: profile.selected_activity,
        term: batch.term,
        role: profile.role,
        dDay,
        essentialMissions,
        schedules: allSchedules,
        currentMission: currentMission || { status: 'none' }
    };
}
