import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://paigqsvvsiddwslnxblh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhaWdxc3Z2c2lkZHdzbG54YmxoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDI0NDkyNSwiZXhwIjoyMDg5ODIwOTI1fQ.lyGucSkIKKnt__hgmUOStqcFjqmGxDGh9FhQ_dKm3iY';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
    const email = 'javi@gmail.com';
    const { data: profile } = await supabase.from('profiles').select('id').eq('tourlive_email', email).single();

    if (!profile) {
        console.log("Profile not found for " + email);
        return;
    }
    const pid = profile.id;

    const today = new Date();
    const d1 = new Date(today); d1.setDate(today.getDate() - 2);
    const d2 = new Date(today); d2.setDate(today.getDate() - 1);
    const d3 = new Date(today);

    // Insert Essential Missions
    await supabase.from('missions').insert({
        profile_id: pid,
        mission_round: 991,
        team: 'naver_cafe',
        post_url: 'https://example.com/essential1',
        cafe_post_count: 5,
        cafe_comment_count: 30,
        status: 'completed',
        created_at: d1.toISOString(),
        updated_at: d1.toISOString()
    });

    await supabase.from('missions').insert({
        profile_id: pid,
        mission_round: 992,
        team: 'naver_cafe',
        post_url: 'https://example.com/essential2',
        status: 'PENDING_APPROVAL',
        created_at: d3.toISOString(),
        updated_at: d3.toISOString()
    });

    // Insert Side Missions
    const sideMissions = [
        { mission_type: '앱 리뷰 (구글/앱스토어)', proof_url: 'http://test1', status: 'APPROVED', created_at: d1.toISOString() },
        { mission_type: '포토 리뷰 (투어라이브)', proof_url: 'http://test2', status: 'PENDING', created_at: d1.toISOString() },
        { mission_type: '트랙 댓글 (투어라이브)', proof_url: 'http://test3', status: 'APPROVED', created_at: d2.toISOString() },
        { mission_type: '지도/정보 오류 제보', proof_url: 'http://test4', status: 'PENDING', created_at: d2.toISOString() },
        { mission_type: '이달의 챌린지 - Cafe', proof_url: 'http://test5', status: 'APPROVED', created_at: d3.toISOString() }
    ];

    for (const sm of sideMissions) {
        await supabase.from('side_missions').insert({
            profile_id: pid,
            mission_type: sm.mission_type,
            proof_url: sm.proof_url,
            status: sm.status,
            created_at: sm.created_at
        });
    }

    console.log("Mock data inserted successfully!");
}

run();
