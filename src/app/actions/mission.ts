"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import Anthropic from "@anthropic-ai/sdk";
import * as cheerio from "cheerio";

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

    // 2. Get profile ID using robust two-step lookup
    const { data: crew } = await supabase
        .from('crews')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

    let profile = null;
    if (crew) {
        const { data: profileData } = await supabase
            .from('profiles')
            .select('id, selected_activity')
            .eq('crew_id', crew.id)
            .maybeSingle();
        profile = profileData;
    }

    if (!profile) {
        return { error: "프로필 정보를 찾을 수 없습니다." };
    }

    // 3. Current month (YYYY-MM)
    const now = new Date();
    const missionMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // 4. Get existing mission to handle multiple URLs
    const { data: existingMission } = await supabase
        .from('missions')
        .select('*')
        .eq('profile_id', profile.id)
        .eq('mission_month', missionMonth)
        .maybeSingle();

    let newPostUrl = postUrl;
    if (existingMission?.post_url && !existingMission.post_url.includes(postUrl)) {
        newPostUrl = `${existingMission.post_url},${postUrl}`;
    }

    // 5. Upsert mission
    const { error: upsertError } = await supabase
        .from('missions')
        .upsert({
            profile_id: profile.id,
            mission_month: missionMonth,
            post_url: newPostUrl,
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

    const { data: crew } = await supabase
        .from('crews')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

    let profile = null;
    if (crew) {
        const { data: profileData } = await supabase
            .from('profiles')
            .select('role')
            .eq('crew_id', crew.id)
            .maybeSingle();
        profile = profileData;
    }

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

    revalidatePath("/admin");
    return { success: true };
}

/**
 * Updates self-reported counts for Cafe Team
 */
export async function updateCafeCounts(missionId: string, postCount: number, commentCount: number) {
    const supabase = await createClient();
    const { error } = await supabase.from('missions').update({ 
        cafe_post_count: postCount, 
        cafe_comment_count: commentCount 
    }).eq('id', missionId);
    
    if (!error) revalidatePath("/dashboard/mission");
    return { success: !error, error: error?.message };
}

/**
 * Submits the mandatory survey and saves the JSON data
 */
export async function submitSurvey(missionId: string, surveyData: any) {
    const supabase = await createClient();
    const { error } = await supabase.from('missions').update({ 
        survey_completed: true,
        survey_data: surveyData
    }).eq('id', missionId);

    if (!error) revalidatePath("/dashboard/mission");
    return { success: !error, error: error?.message };
}

/**
 * Requests the mission reward (final submission)
 */
export async function requestReward(missionId: string) {
    const supabase = await createClient();
    const { error } = await supabase.from('missions').update({ 
        status: 'PENDING_APPROVAL',
        updated_at: new Date().toISOString()
    }).eq('id', missionId);

    if (!error) revalidatePath("/dashboard/mission");
    return { success: !error, error: error?.message };
}

/**
 * Verifies the mission content via scraping and Gemini.
 */
export async function verifyMissionContent(postUrl: string) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { error: "로그인이 필요합니다." };

        const { data: crew } = await supabase
            .from('crews')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle();

        let profile = null;
        if (crew) {
            const { data: profileData } = await supabase
                .from('profiles')
                .select('naver_id')
                .eq('crew_id', crew.id)
                .maybeSingle();
            profile = profileData;
        }

        const naverId = profile?.naver_id || "";

        if (!postUrl.startsWith('http://') && !postUrl.startsWith('https://')) {
            postUrl = 'https://' + postUrl;
        }
        let finalUrl = postUrl;
        let response = await fetch(finalUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        let html = await response.text();
        let $ = cheerio.load(html);

        // Handle Naver Blog iframe
        const iframeSrc = $('iframe#mainFrame').attr('src');
        if (iframeSrc) {
            finalUrl = iframeSrc.startsWith('http') ? iframeSrc : `https://blog.naver.com${iframeSrc}`;
            response = await fetch(finalUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0'
                }
            });
            html = await response.text();
            $ = cheerio.load(html);
        }

        // 2. Extract Data
        const imageCount = $('img').length;
        const textContent = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 15000);
        const links: string[] = [];
        $('a').each((_, el) => {
            const href = $(el).attr('href');
            if (href) links.push(href);
        });

        // 3. AI Verification (MOCKED)
        /* 
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) return { error: "Anthropic API Key가 설정되지 않았습니다." };

        const anthropic = new Anthropic({
            apiKey: apiKey,
        });

        const prompt = \`...\`; // Prompt commented out

        const msg = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 1024,
            messages: [{ role: "user", content: prompt }]
        });
        
        // ... (JSON Parsing logic)
        */

        // MOCK LOGIC for frontend development
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate 1.5s delay
        
        const aiResult = {
            isValid: true,
            results: { utm_tour: true, utm_guide: true, mention: true },
            missing: []
        };

        const imagePass = imageCount >= 10;
        const finalIsValid = imagePass && aiResult.results.utm_tour && aiResult.results.utm_guide && aiResult.results.mention;

        return {
            success: true,
            data: {
                isValid: finalIsValid,
                imageCount,
                imagePass,
                ...aiResult.results
            }
        };

    } catch (error: any) {
        console.error("[Mission Verification Error]", error);
        const errorMsg = error?.message || '';
        
        if (error?.status === 429 || error?.type === 'rate_limit_error' || errorMsg.includes('429') || errorMsg.includes('quota') || errorMsg.includes('overloaded')) {
            return { error: "현재 요청이 많아 AI 검토가 잠시 지연되고 있습니다. 30초 후 다시 시도해주세요." };
        }
        
        if (error?.status === 401 || error?.type === 'authentication_error') {
            return { error: "AI 검토 API 인증 오류가 발생했습니다. (API 키 혹은 환경 설정 확인)" };
        }

        return { error: `링크를 확인하는 중 오류가 발생했습니다: ${error?.message || '알 수 없는 오류'}` };
    }
}

