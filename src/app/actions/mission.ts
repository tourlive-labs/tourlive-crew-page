"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { GoogleGenerativeAI } from "@google/generative-ai";

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

    // 2. Get profile ID
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('tourlive_email', user.email)
        .single();

    if (profileError || !profile) {
        return { error: "프로필 정보를 찾을 수 없습니다." };
    }

    // 3. Current month (YYYY-MM)
    const now = new Date();
    const missionMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // 4. Upsert mission
    const { error: upsertError } = await supabase
        .from('missions')
        .upsert({
            profile_id: profile.id,
            mission_month: missionMonth,
            post_url: postUrl,
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

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('tourlive_email', user.email)
        .maybeSingle();

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

    revalidatePath("/manage");
    return { success: true };
}

/**
 * Registers one's Naver ID in the profile.
 */
export async function registerNaverId(naverId: string) {
    const supabase = await createClient();

    // 1. Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { error: "로그인이 필요합니다." };
    }

    // 2. Update profiles table
    const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
            naver_id: naverId,
            updated_at: new Date().toISOString()
        })
        .eq('tourlive_email', user.email);

    if (updateError) {
        console.error("[Profile] Register Naver ID Error:", updateError);
        return { error: "네이버 ID 등록 중 오류가 발생했습니다." };
    }

    revalidatePath("/dashboard/mission");
    return { success: true };
}

/**
 * Processes a Naver Cafe profile screenshot using Gemini Free API.
 */
export async function processCafeScreenshot(base64Image: string) {
    try {
        const apiKey = process.env.GOOGLE_AI_API_KEY;
        if (!apiKey) return { error: "Google AI API Key가 설정되지 않았습니다." };

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { error: "로그인이 필요합니다." };

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Extract base64 part
        const base64Data = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;
        const mimeType = base64Image.includes(',') ? base64Image.split(',')[0].split(':')[1].split(';')[0] : "image/jpeg";

        const prompt = `Analyze this Naver Cafe profile screenshot. 
Look for keywords like '작성글', '전체글', '작성댓글', '댓글'. 
Even if the layout varies, extract the number associated with these terms. 
If you see multiple numbers, pick the ones clearly labeled as user activity counts.
Return only a valid JSON object without markdown formatting: { "posts": number, "comments": number }.
If you cannot find them, return { "posts": 0, "comments": 0 }.`;

        const imagePart = {
            inlineData: {
                data: base64Data,
                mimeType
            }
        };

        const result = await model.generateContent([prompt, imagePart]);
        const responseText = result.response.text();

        // Safely parse JSON with Regex to handle surrounding conversational text
        let jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            jsonStr = jsonMatch[0];
        }
        const parsed = JSON.parse(jsonStr);

        // Extract numbers robustly even if AI returns strings like "1개"
        let posts = 0;
        let comments = 0;
        if (parsed.posts !== undefined) posts = Number(String(parsed.posts).replace(/[^0-9]/g, ''));
        if (parsed.comments !== undefined) comments = Number(String(parsed.comments).replace(/[^0-9]/g, ''));
        
        if (isNaN(posts)) posts = 0;
        if (isNaN(comments)) comments = 0;

        if (posts === 0 && comments === 0) {
            return { error: "이미지에서 숫자를 찾지 못했습니다. ('작성글', '작성댓글' 숫자가 명확히 보이는지 확인해주세요.)" };
        }

        return { success: true, posts, comments };
    } catch (e) {
        console.error("[AI Vision Error]", e);
        return { error: "이미지 분석에 실패했습니다. 형식 또는 화질을 다시 확인해 주세요." };
    }
}

/**
 * Sets the baseline activity (posts and comments) for the current season/month.
 */
export async function setCafeBaseline(posts: number, comments: number) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { error: "로그인이 필요합니다." };

        const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('tourlive_email', user.email)
            .single();

        if (!profile) return { error: "프로필을 찾을 수 없습니다." };

        const now = new Date();
        const missionMonthLabel = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

        const { error: updateError } = await supabase
            .from('missions')
            .upsert({
                profile_id: profile.id,
                mission_month: missionMonthLabel,
                baseline_post_count: posts,
                baseline_comment_count: comments,
                cafe_post_count: 0,
                cafe_comment_count: 0,
                is_cafe_mission_completed: false,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'profile_id,mission_month'
            });

        if (updateError) throw updateError;

        revalidatePath("/dashboard/mission");
        return { success: true };
    } catch (e) {
        console.error("[Set Baseline Error]", e);
        return { error: "시작점 설정에 실패했습니다." };
    }
}

/**
 * Confirms the AI-parsed counts and updates the database, subtracting the baseline.
 */
export async function confirmCafeActivity(posts: number, comments: number) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { error: "로그인이 필요합니다." };

        const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('tourlive_email', user.email)
            .single();

        if (!profile) return { error: "프로필을 찾을 수 없습니다." };

        const now = new Date();
        const missionMonthLabel = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        
        // Get current baseline
        const { data: currentMission } = await supabase
            .from('missions')
            .select('baseline_post_count, baseline_comment_count')
            .eq('profile_id', profile.id)
            .eq('mission_month', missionMonthLabel)
            .single();
            
        const baselinePosts = currentMission?.baseline_post_count ?? null;
        const baselineComments = currentMission?.baseline_comment_count ?? null;

        if (baselinePosts === null || baselineComments === null) {
            return { error: "기수 시작점이 설정되지 않았습니다. 먼저 시작점을 설정해 주세요." };
        }

        if (posts < baselinePosts || comments < baselineComments) {
            return { error: `시작 시점(글 ${baselinePosts}건, 댓글 ${baselineComments}건)보다 현재 숫자가 적습니다. 캡처 화면 또는 아이디를 다시 확인해주세요.` };
        }

        const activityPosts = posts - baselinePosts;
        const activityComments = comments - baselineComments;

        // Define completion rules
        const isCompleted = activityPosts >= 5 && activityComments >= 30;

        const { error: updateError } = await supabase
            .from('missions')
            .upsert({
                profile_id: profile.id,
                mission_month: missionMonthLabel,
                cafe_post_count: activityPosts,
                cafe_comment_count: activityComments,
                is_cafe_mission_completed: isCompleted,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'profile_id,mission_month'
            });

        if (updateError) throw updateError;

        revalidatePath("/dashboard/mission");
        return { success: true };
    } catch (e) {
        console.error("[Confirm Activity Error]", e);
        return { error: "데이터 업데이트에 실패했습니다." };
    }
}
