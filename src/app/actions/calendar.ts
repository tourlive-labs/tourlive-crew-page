"use server";

import { createClient } from "@/utils/supabase/server";

export async function getCalendarStamps() {
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

        // 1. Fetch essential missions (Submitted or Approved)
        const { data: missions } = await supabase
            .from('missions')
            .select('id, status, created_at, updated_at')
            .eq('profile_id', profile.id)
            .in('status', ['PENDING_APPROVAL', 'completed']);

        // 2. Fetch side missions (Submitted or Approved)
        const { data: sideMissions } = await supabase
            .from('side_missions')
            .select('id, mission_type, status, created_at')
            .eq('profile_id', profile.id)
            .in('status', ['PENDING', 'APPROVED']);

        const stamps: any[] = [];

        missions?.forEach(m => {
            stamps.push({
                id: `essential_${m.id}`,
                type: 'essential',
                title: '필수 활동',
                status: m.status, // 'PENDING_APPROVAL' or 'completed'
                date: new Date(m.updated_at || m.created_at).toISOString().split('T')[0]
            });
        });

        sideMissions?.forEach(sm => {
            let icon = '🎯';
            if (sm.mission_type.includes('앱 리뷰')) icon = '⭐';
            if (sm.mission_type.includes('포토 리뷰')) icon = '📸';
            if (sm.mission_type.includes('트랙 댓글')) icon = '💬';
            if (sm.mission_type.includes('지도/정보')) icon = '🗺️';

            stamps.push({
                id: `optional_${sm.id}`,
                type: 'optional',
                title: sm.mission_type,
                status: sm.status, // 'PENDING' or 'APPROVED'
                icon: icon,
                date: new Date(sm.created_at).toISOString().split('T')[0]
            });
        });

        return { data: stamps };
    } catch(err) {
        return { data: [] };
    }
}
