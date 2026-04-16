"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { sanitizeHeader } from "@/utils/security";
import Anthropic from "@anthropic-ai/sdk";
import * as cheerio from "cheerio";
import { MissionStatus } from "@/types/mission";

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

    // 5. AI Verification before submission
    const verification = await verifyMissionContent(postUrl);

    let status: MissionStatus = MissionStatus.CHECKING;
    let rejectionReason = null;

    if (verification.error) {
        // If technical error, keep as 'checking'
        console.error("[Mission] Verification Technical Error:", verification.error);
    } else if (verification.data?.isValid) {
        // IMPORTANT: Successfully verified links stay in 'checking' status.
        // They only turn into 'PENDING_APPROVAL' when the user clicks the final "Complete Mission" button.
        status = MissionStatus.CHECKING;
    } else {
        status = MissionStatus.REJECTED;
        rejectionReason = verification.data?.rejection_reason || "미션 기준을 충족하지 못했습니다.";
    }

    // 6. Upsert mission
    const { error: upsertError } = await supabase
        .from('missions')
        .upsert({
            profile_id: profile.id,
            mission_month: missionMonth,
            post_url: newPostUrl,
            status: status, 
            admin_feedback: null,
            rejection_reason: rejectionReason,
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'profile_id,mission_month'
        });

    if (upsertError) {
        console.error("[Mission] Submit Error:", upsertError);
        return { error: "미션 제출 중 오류가 발생했습니다." };
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/mission");

    return {
        success: true,
        verified: status !== MissionStatus.REJECTED,
        reason: rejectionReason
    };
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
        status: MissionStatus.PENDING_APPROVAL,
        admin_feedback: null,
        rejection_reason: null,
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
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            console.error("[MissionVerify] Auth Error:", authError);
            return { error: "로그인이 필요합니다." };
        }

        const { data: crew, error: crewError } = await supabase
            .from('crews')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle();

        if (crewError) {
            console.error("[MissionVerify] Crew lookup error:", crewError);
        }

        let profile = null;
        if (crew) {
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('id, naver_id, selected_activity')
                .eq('crew_id', crew.id)
                .maybeSingle();
            if (profileError) {
                console.error("[MissionVerify] Profile lookup error:", profileError);
            }
            profile = profileData;
        }

        // --- Naver ID Extraction Logic ---
        let naverId = profile?.naver_id || "";
        
        // Try to extract naver_id from URL if it's a blog link
        const blogMatch = postUrl.match(/(?:blog|m\.blog)\.naver\.com\/([^/]+)/);
        const extractedId = blogMatch ? blogMatch[1] : null;
        
        if (extractedId && (!naverId || naverId === "")) {
            naverId = extractedId;
            // Update profile with extracted naver_id for future use (e.g. Cafe missions)
            if (profile?.id) {
                await supabase
                    .from('profiles')
                    .update({ naver_id: naverId })
                    .eq('id', profile.id);
            }
        }
        // ---------------------------------

        const isCafeTeam = profile?.selected_activity === 'naver_cafe';

        // --- CAFE SELF-VERIFICATION BYPASS (Cost: $0) ---
        if (isCafeTeam) {
            console.log(`[MissionVerify] Cafe Team detected. Bypassing ALL AI analysis and scraping.`);
            
            // Basic URL validation
            if (!postUrl.includes('cafe.naver.com') && !postUrl.includes('naver.me')) {
                return { error: "네이버 카페 주소(cafe.naver.com) 또는 단축 주소(naver.me)를 입력해 주세요." };
            }

            return {
                success: true,
                data: {
                    isValid: true,
                    rejection_reason: "[Cafe - Manual Check Required]", // Admin tag
                    imagePass: true,
                    utm_tour: true, 
                    utm_guide: true,
                    mention: true,
                    isManualCafe: true
                }
            };
        }
        // ------------------------------------------------

        if (!postUrl.startsWith('http://') && !postUrl.startsWith('https://')) {
            postUrl = 'https://' + postUrl;
        }

        // 1. URL Resolution (Handle naver.me & redirects)
        let finalUrl = postUrl;
        console.log(`[MissionVerify] Original URL: ${postUrl}`);

        try {
            // First pass to resolve any redirects (like naver.me)
            const probeResponse = await fetch(postUrl, {
                method: 'GET',
                redirect: 'follow',
                headers: {
                    'User-Agent': sanitizeHeader('Mozilla/5.0 (iPhone; CPU iPhone OS 14_8 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1')
                }
            });
            finalUrl = probeResponse.url;
            console.log(`[MissionVerify] Resolved URL: ${finalUrl}`);
        } catch (err) {
            console.error(`[MissionVerify] Redirect resolution failed:`, err);
        }

        // 1.2. URL Pre-processing (Blog Mobile Conversion)
        if (finalUrl.includes('blog.naver.com') || finalUrl.includes('m.blog.naver.com')) {
            const blogUrlMatch = finalUrl.match(/(?:blog|m\.blog)\.naver\.com\/([^/]+)\/(\d+)/);
            if (blogUrlMatch) {
                const blogId = blogUrlMatch[1];
                const logNo = blogUrlMatch[2];
                finalUrl = `https://m.blog.naver.com/${blogId}/${logNo}`;
            }
        }

        // 2. Scraping Content (Blog Only)
        console.log(`[MissionVerify] Starting Content Fetch for URL: ${finalUrl}`);
        
        let bodyText = "";
        let imageCount = 0;
        let links: string[] = [];

        // BLOG HTML Scraping
        let response = await fetch(finalUrl, {
            headers: {
                'User-Agent': sanitizeHeader('Mozilla/5.0 (iPhone; CPU iPhone OS 14_8 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1'),
                'Referer': sanitizeHeader('https://m.blog.naver.com/'),
                'Accept-Language': sanitizeHeader('ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7'),
                'Accept': sanitizeHeader('text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'),
                'Cache-Control': sanitizeHeader('no-cache'),
                'Pragma': sanitizeHeader('no-cache')
            }
        });
        
        if (!response.ok) {
            console.error(`[MissionVerify] Fetch Failed: ${response.status}`);
            return { error: `링크 접속 실패 (${response.status}): 접근이 제한되었습니다.` };
        }

        let html = await response.text();
        let $ = cheerio.load(html);
        const $content = $('.se-main-container, .se-component-content, body');
        
        // Tag-based image counting
        let tagImageCount = 0;
        $content.find('img').each((_, el) => {
            const $img = $(el);
            const src = $img.attr('src') || $img.attr('data-src') || '';
            if (!src.includes('static.naver.net') && !src.includes('profile')) tagImageCount++;
        });

        // Pattern-based image counting (Regex fallback)
        const cdnRegex = /https:\/\/(postfiles\.pstatic\.net|phinf\.pstatic\.net)\/[^"'\s<>]+|storyphoto\/viewer\.html[^"'\s<>]+/g;
        const matches = html.match(cdnRegex) || [];
        const uniqueMatches = Array.from(new Set(matches.filter(url => !url.includes('static.naver.net'))));
        
        bodyText = $content.text().replace(/\s+/g, ' ').trim();
        imageCount = Math.max(tagImageCount, uniqueMatches.length);
        
        $content.find('a').each((_, el) => {
            const href = $(el).attr('href');
            if (href) links.push(href);
        });

        const textContent = bodyText.slice(0, 15000); 
        console.log(`[MissionVerify] Final Blog Data -> Images: ${imageCount}, Text Length: ${bodyText.length}`);
        console.log(`[MissionVerify] Snippet: ${bodyText.slice(0, 200)}...`);

        if (bodyText.includes("JavaScript") && bodyText.length < 500) {
            console.warn(`[MissionVerify] JS Blockage Detected for Blog.`);
        }

        // 3. AI Verification (Claude)
        console.log(`[MissionVerify] Starting AI Call (Model: claude-3-haiku-20240307) - Type: ${isCafeTeam ? 'Cafe (Lean)' : 'Blog (Strict)'}`);
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
            console.error(`[MissionVerify] API Key Missing`);
            return { error: "Anthropic API Key가 설정되지 않았습니다." };
        }

        const anthropic = new Anthropic({ apiKey });

        // Criteria based on Mission Type
        const minImages = isCafeTeam ? 3 : 10;
        const utmRule = isCafeTeam 
            ? "투어라이브 도메인(tourlive.co.kr) 링크가 포함되어 있는지 확인하세요. (UTM 파라미터가 없어도 도메인만 있다면 통과)"
            : "'투어(Tour) UTM 링크'와 '가이드북(Guidebook) UTM 링크'가 각각 최소 하나씩 포함되어야 하며, utm_campaign이 사용자의 네이버 ID와 일치해야 합니다.";
        const disclosureRule = isCafeTeam
            ? "필수 하단 멘트가 포함되어야 하지만, 문구가 완벽히 일치하지 않아도 의미가 통하면 허용합니다."
            : "필수 하단 멘트가 토씨 하나 틀리지 않고 정확히 포함되어야 합니다. (매우 엄격히 검사)";

        const prompt = `
당신은 투어라이브(Tourlive) 크루의 미션 활동 검토 전문가입니다. 
제공된 포스트 본문 텍스트와 추출된 데이터(이미지 수, 링크 목록)를 바탕으로 아래 체크리스트를 검토하고 결과를 JSON 형식으로 반환하세요.

[제출 정보]
- 팀 유형: ${isCafeTeam ? "네이버 카페 (완화된 기준 적용)" : "네이버 블로그 (엄격한 기준 적용)"}
- 사용자 네이버 ID: ${naverId || "알 수 없음"}
- 이미지 개수: ${imageCount}
- 추출된 링크 목록: ${JSON.stringify(links)}
- 본문 텍스트: ${textContent}

[필수 체크리스트]
1. 이미지 개수: 총 ${minImages}장 이상이어야 함 (현재: ${imageCount}장).
2. 필수 링크 확인:
   ${utmRule}
3. 필수 하단 멘트: 
   "이 글은 투어라이브 크루 활동의 일환으로 투어라이브로부터 해당 오디오가이드를 제공받아 작성한 솔직한 후기입니다."
   ${disclosureRule}

[반환 형식 (JSON)]
{
  "isValid": true/false (위 1, 2, 3번 항목 중 하나라도 실패하면 반드시 false여야 함),
  "rejection_reason": "실패 시 구체적인 사유 (한국어)",
  "details": {
    "imagePass": true/false,
    "utm_tour": true/false,
    "utm_guide": true/false,
    "mention": true/false,
    "utmCampaignMatch": true/false
  }
}

* 중요: 블로그는 매우 엄격하게, 카페는 실질적인 홍보 여부에 초점을 맞춰 유연하게 판정하세요.
`;

        const msg = await anthropic.messages.create({
            model: "claude-3-haiku-20240307", 
            max_tokens: 1000,
            messages: [{ role: "user", content: prompt }]
        });
        
        console.log(`[MissionVerify] AI Call Success`);
        const responseText = (msg.content[0] as any).text;

        let aiResult: any = {};
        try {
            const jsonMatch = responseText.match(/\{[\s\S]*\}/)?.[0];
            if (!jsonMatch) {
                console.warn("[MissionVerify] No JSON found in AI response. Treating as manual review required.");
                return {
                    success: true,
                    data: {
                        isValid: true,
                        imageCount,
                        rejection_reason: "[AI Parse Error - Manual Review Required]",
                        details: {}
                    }
                };
            }
            aiResult = JSON.parse(jsonMatch);
        } catch (parseError) {
            console.error("[MissionVerify] JSON Parse Error:", parseError);
            console.warn("[MissionVerify] AI response text:", responseText);
            return {
                success: true,
                data: {
                    isValid: true,
                    imageCount,
                    rejection_reason: "[AI Parse Error - Manual Review Required]",
                    details: {}
                }
            };
        }

        // Ensure isValid is strictly handled with explicit undefined guard
        const isValid = aiResult.isValid === true;
        let rejection_reason = aiResult.rejection_reason || "";

        return {
            success: true,
            data: {
                isValid,
                imageCount,
                rejection_reason,
                ...aiResult.details
            }
        };

    } catch (error: any) {
        console.error("[MissionVerify] Fatal Error:", error);
        return { error: `검증 중 오류 발생: ${error.message}` };
    }
}
