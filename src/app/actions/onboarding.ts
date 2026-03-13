"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { FormValues } from "@/lib/validations/onboarding-schema";
import { redirect } from "next/navigation";

export async function submitOnboardingForm(formData: FormData) {
    const supabase = await createClient();
    const adminSupabase = createAdminClient();

    const fullName = formData.get("fullName") as string;
    const phone = formData.get("phone") as string;
    const tourliveEmail = formData.get("tourliveEmail") as string;
    const contactEmail = formData.get("contactEmail") as string;
    const activityType = formData.get("activityType") as string;
    const nickname = formData.get("nickname") as string;
    const password = formData.get("password") as string;
    const travelCountry = formData.get("travelCountry") as string;
    const travelCity = formData.get("travelCity") as string;
    const hashtag1 = formData.get("hashtag1") as string;
    const hashtag2 = formData.get("hashtag2") as string;
    const hashtag3 = formData.get("hashtag3") as string;
    const bannerImage = formData.get("bannerImage") as File | null;

    try {
        console.log(`[Onboarding] Starting registration for ${tourliveEmail}`);

        // Check for admin role specifically for the root account
        const isAdmin = tourliveEmail === "root@tourlive.co.kr";

        // 0. Find current latest batch (Unlimited Registration Mode)
        const { data: activeBatch, error: activeBatchError } = await supabase
            .from('batches')
            .select('id, term')
            .order('term', { ascending: false })
            .limit(1)
            .single();

        if (activeBatchError || !activeBatch) {
            console.error("[Onboarding] No batch found:", activeBatchError);
            return { error: "등록된 활동 기수 정보가 없습니다. 관리자에게 문의하세요." };
        }

        // 1. Global email duplicate check
        const { data: globalEmailExisting, error: globalEmailError } = await adminSupabase
            .from('profiles')
            .select('id')
            .eq('tourlive_email', tourliveEmail)
            .maybeSingle();

        if (globalEmailExisting) {
            return { error: "이미 가입된 투어라이브 계정입니다. 해당 계정으로 로그인을 해주세요." };
        }

        // 1.2. Global nickname duplicate check
        const { data: globalNicknameExisting, error: globalNicknameError } = await adminSupabase
            .from('profiles')
            .select('id')
            .eq('nickname', nickname)
            .maybeSingle();

        if (globalNicknameExisting) {
            return { error: "사용 중인 닉네임입니다. 다른 닉네임을 입력해주세요." };
        }

        // All registration checks pass. Proceeding to auth and data insertion.

        // 2. Auth user handling
        let userId: string;
        const { data: listData, error: listError } = await adminSupabase.auth.admin.listUsers();

        if (listError) {
            console.error("[Onboarding] List users error:", listError);
            return { error: "계정 확인 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요." };
        }

        const existingAuthUser = listData?.users?.find(u => u.email === tourliveEmail);

        if (existingAuthUser) {
            userId = existingAuthUser.id;
            console.log(`[Onboarding] Found existing auth user: ${userId}`);
        } else {
            console.log("[Onboarding] Creating new auth user");
            // New user account creation
            const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
                email: tourliveEmail,
                password: password,
                email_confirm: true,
                user_metadata: {
                    full_name: fullName,
                },
            });

            if (authError) {
                console.error("[Onboarding] Auth Create Exception:", authError.message);
                return { error: `계정 생성 실패: ${authError.message}` };
            }

            userId = authData.user?.id!;
            console.log(`[Onboarding] Created new auth user: ${userId}`);
        }

        // Establish session by signing in
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: tourliveEmail,
            password: password,
        });

        if (signInError) {
            console.warn("[Onboarding] Sign In Warning after Admin Create/Link:", signInError.message);
        }

        // Update app_metadata with role
        const role = isAdmin ? 'admin' : 'crew';
        await adminSupabase.auth.admin.updateUserById(userId, {
            app_metadata: { role }
        });
        console.log(`[Onboarding] Assigned role [${role}] for ${userId}`);

        // 3. Insert Crew for the ACTIVE batch
        console.log("[Onboarding] Inserting crew record");
        const { data: crewData, error: crewError } = await adminSupabase
            .from('crews')
            .insert({
                user_id: userId,
                batch_id: activeBatch.id,
                name: fullName,
            })
            .select('id')
            .single();

        if (crewError) {
            console.error("[Onboarding] Crew Insert Error: ", crewError.message);
            return { error: "크루 정보 저장 실패 (이미 가입된 상태일 수 있습니다)." };
        }

        let bannerImageUrl = null;

        // 4. Upload Banner Image
        if (bannerImage && bannerImage.size > 0) {
            console.log("[Onboarding] Uploading banner image");
            const fileExt = bannerImage.name.split('.').pop();
            const fileName = `${userId}-${activeBatch.id}-${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase
                .storage
                .from('banners')
                .upload(fileName, bannerImage);

            if (uploadError) {
                console.error("[Onboarding] Image Upload Error:", uploadError.message);
                // Don't fail the whole process for banner upload if possible, or return error
                return { error: "배너 이미지 업로드 실패" };
            }

            const { data: publicUrlData } = supabase
                .storage
                .from('banners')
                .getPublicUrl(fileName);

            bannerImageUrl = publicUrlData.publicUrl;
            console.log(`[Onboarding] Banner uploaded: ${bannerImageUrl}`);
        }

        // 5. Insert Profile
        console.log("[Onboarding] Inserting profile record");
        const { error: profileError } = await adminSupabase
            .from('profiles')
            .insert({
                crew_id: crewData.id,
                full_name: fullName,
                phone_number: phone,
                tourlive_email: tourliveEmail,
                contact_email: contactEmail,
                selected_activity: activityType,
                nickname: nickname,
                travel_country: travelCountry,
                travel_city: travelCity,
                hashtag_1: hashtag1,
                hashtag_2: hashtag2,
                hashtag_3: hashtag3,
                banner_image_url: bannerImageUrl,
                role: role
            });

        if (profileError) {
            console.error("[Onboarding] Profile Insert Error: ", profileError.message);
            // If profile fails, we might have a ghost crew record, but handle it
            return { error: "프로필 정보 저장 실패" };
        }

        console.log(`[Onboarding] Registration successful for ${tourliveEmail}`);
        return { success: true, nickname };

    } catch (error) {
        console.error("[Onboarding] Server Action Exception:", error);
        const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류";
        return { error: `회원가입 처리 중 오류가 발생했습니다: ${errorMessage}` };
    }
}
