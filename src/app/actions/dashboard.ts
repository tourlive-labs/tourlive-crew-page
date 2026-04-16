"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { MissionStatus, SideMissionStatus, StampStatus, ScheduleStatus, normalizeMissionStatus, missionStatusToStamp, sideMissionStatusToStamp } from "@/types/mission";

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
            role,
            travel_country,
            travel_city,
            hashtag_1,
            hashtag_2,
            hashtag_3,
            banner_image_url,
            full_name,
            phone_number,
            tourlive_email,
            contact_email
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

    if (submissionError) {
        console.error("[DashboardAction] Submission Fetch Error:", submissionError);
    }

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

            let status: ScheduleStatus = ScheduleStatus.PENDING;
            if (isCompleted) {
                status = ScheduleStatus.COMPLETED;
            } else if (scheduledAt.getMonth() === today.getMonth() && scheduledAt.getFullYear() === today.getFullYear()) {
                status = ScheduleStatus.ONGOING;
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
        travel_country: profile.travel_country,
        travel_city: profile.travel_city,
        hashtag_1: profile.hashtag_1,
        hashtag_2: profile.hashtag_2,
        hashtag_3: profile.hashtag_3,
        banner_image_url: profile.banner_image_url,
        full_name: profile.full_name,
        phone_number: profile.phone_number,
        tourlive_email: profile.tourlive_email,
        contact_email: profile.contact_email,
        dDay,
        essentialMissions,
        schedules: allSchedules,
        currentMission: currentMission
            ? { ...currentMission, status: normalizeMissionStatus(currentMission.status) }
            : { status: MissionStatus.NONE }
    };
}

/**
 * Fetches the three stamp slot stati for the current month:
 *   essential  — main missions table (not a challenge row)
 *   blog       — challenge row with blog_paris type
 *   cafe       — challenge row with cafe_streak type
 *
 * Stamp stati: 'none' | 'pending' | 'approved'
 */
export async function getStampStatus() {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) {
            console.error("[StampStatus] Auth Error:", authError);
        }
        if (!user) return { essential: StampStatus.NONE, blog: StampStatus.NONE, cafe: StampStatus.NONE };

        // Resolve profile_id via crews join
        const { data: crew, error: crewError } = await supabase
            .from('crews')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle();
        if (crewError) {
            console.error("[StampStatus] Crew Error:", crewError);
        }
        if (!crew) return { essential: StampStatus.NONE, blog: StampStatus.NONE, cafe: StampStatus.NONE };

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id')
            .eq('crew_id', crew.id)
            .maybeSingle();
        if (profileError) {
            console.error("[StampStatus] Profile Error:", profileError);
        }
        if (!profile) return { essential: StampStatus.NONE, blog: StampStatus.NONE, cafe: StampStatus.NONE };

        const now = new Date();
        const missionMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

        // Fetch all missions for this profile in the current month
        const { data: missions, error: missionsError } = await supabase
            .from('missions')
            .select('id, status, post_url, rejection_reason')
            .eq('profile_id', profile.id)
            .eq('mission_month', missionMonth);
        if (missionsError) {
            console.error("[StampStatus] Missions Error:", missionsError);
        }

        let essential: StampStatus = StampStatus.NONE;
        let blog: StampStatus = StampStatus.NONE;
        let cafe: StampStatus = StampStatus.NONE;

        for (const m of missions || []) {
            const isChallenge = m.post_url?.startsWith('[CHALLENGE]');
            if (isChallenge) {
                const tag = m.rejection_reason || '';
                const normalizedStatus = normalizeMissionStatus(m.status);
                const stamp = missionStatusToStamp(normalizedStatus);
                if (tag.includes('blog_paris')) blog = stamp;
                if (tag.includes('cafe_streak')) cafe = stamp;
            } else {
                // Regular essential mission row
                const normalizedStatus = normalizeMissionStatus(m.status);
                const stamp = missionStatusToStamp(normalizedStatus);
                if (stamp !== StampStatus.NONE) essential = stamp;
            }
        }

        return { essential, blog, cafe };
    } catch (error) {
        console.error("[StampStatus] Fatal Error:", error);
        return { essential: StampStatus.NONE, blog: StampStatus.NONE, cafe: StampStatus.NONE };
    }
}

export async function updateProfile(updates: any) {
    const supabase = await createClient();

    // 1. Get current user to ensure authorization
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { error: "로그인이 필요합니다." };
    }

    console.log(`[DashboardAction] Updating profile for user ${user.id}`);

    try {
        let finalUpdates = { ...updates };

        // ── IMMUTABLE FIELDS: strip these regardless of what the client sends ──
        // selected_activity is set permanently during onboarding and must never change.
        delete finalUpdates.selected_activity;
        let bannerImageUrl = null;

        // 2. Handle FormData for image uploads
        if (updates instanceof FormData) {
            const formData = updates;
            finalUpdates = {};
            
            // Convert FormData to object, excluding the file which we handle separately
            formData.forEach((value, key) => {
                if (key !== 'bannerImage') {
                    finalUpdates[key] = value;
                }
            });

            const bannerImage = formData.get('bannerImage') as File | null;
            
            if (bannerImage && bannerImage.size > 0) {
                console.log("[DashboardAction] Uploading new banner image to /avatars");
                const fileExt = bannerImage.name.split('.').pop();
                // Use the user's ID and timestamp for a unique filename in the avatars folder
                const fileName = `avatars/${user.id}-${Date.now()}.${fileExt}`;

                const { error: uploadError } = await supabase
                    .storage
                    .from('banners')
                    .upload(fileName, bannerImage);

                if (uploadError) {
                    console.error("[DashboardAction] Image Upload Error:", uploadError.message);
                    return { error: `이미지 업로드 실패: ${uploadError.message}` };
                }

                const { data: publicUrlData } = supabase
                    .storage
                    .from('banners')
                    .getPublicUrl(fileName);

                bannerImageUrl = publicUrlData.publicUrl;
                finalUpdates.banner_image_url = bannerImageUrl;
                console.log(`[DashboardAction] New banner URL: ${bannerImageUrl}`);
            }
        }

        // 3. Perform the update in profiles table
        const { data, error } = await supabase
            .from('profiles')
            .update(finalUpdates)
            .eq('id', user.id) // profiles.id is synced with auth.users.id
            .select()
            .single();

        if (error) {
            console.error("Profile Update Error:", error);
            return { error: `저장에 실패했습니다: ${error.message}` };
        }

        return { 
            success: true, 
            data: data,
            banner_image_url: bannerImageUrl // Return this explicitly for real-time update
        };
    } catch (err) {
        console.error("[DashboardAction] Unexpected Error:", err);
        return { error: "프로필 업데이트 중 예외가 발생했습니다." };
    }
}
