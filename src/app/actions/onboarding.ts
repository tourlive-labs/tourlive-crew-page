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
        // Check for admin role based on email domain
        const isAdmin = tourliveEmail.endsWith("@tourlive.co.kr");

        // 0. Find current active batch
        const { data: activeBatch, error: activeBatchError } = await supabase
            .from('batches')
            .select('id, term')
            .eq('is_active', true)
            .single();

        if (activeBatchError || !activeBatch) {
            return { error: "현재 진행 중인 크루 모집 기간이 아닙니다." };
        }

        // 1. Global email duplicate check
        const { data: globalExisting, error: globalCheckError } = await adminSupabase
            .from('profiles')
            .select('id')
            .eq('tourlive_email', tourliveEmail)
            .maybeSingle();

        if (globalExisting) {
            return { error: "이미 가입된 투어라이브 계정입니다. 로그인을 시도해 주세요." };
        }

        // 1.5. Check if user already has a profile for this ACTIVE batch (redundant but safe)
        const { data: existingInActiveBatch, error: checkError } = await adminSupabase
            .from('profiles')
            .select('id, crews!inner(batch_id)')
            .eq('tourlive_email', tourliveEmail)
            .eq('crews.batch_id', activeBatch.id)
            .maybeSingle();

        if (existingInActiveBatch) {
            return { error: `이미 ${activeBatch.term}기 크루로 가입된 계정입니다.` };
        }

        // 2. Auth user handling
        let userId: string;
        const { data: listData } = await adminSupabase.auth.admin.listUsers();
        const existingAuthUser = listData.users.find(u => u.email === tourliveEmail);

        if (existingAuthUser) {
            userId = existingAuthUser.id;
        } else {
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
                console.error("Auth Exception:", authError.message);
                return { error: `계정 생성 실패: ${authError.message}` };
            }

            userId = authData.user?.id!;
        }

        // Establish session by signing in
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: tourliveEmail,
            password: password,
        });

        if (signInError) {
            console.error("Sign In Error after Admin Create/Link:", signInError.message);
        }

        // Update admin role if needed
        if (isAdmin) {
            await adminSupabase.auth.admin.updateUserById(userId, { app_metadata: { role: 'admin' } });
        }

        // 3. Insert Crew for the ACTIVE batch
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
            console.error("Crew Insert Error: ", crewError.message);
            return { error: "크루 정보 저장 실패 (이미 가입된 상태일 수 있습니다)." };
        }

        let bannerImageUrl = null;

        // 4. Upload Banner Image
        if (bannerImage && bannerImage.size > 0) {
            const fileExt = bannerImage.name.split('.').pop();
            const fileName = `${userId}-${activeBatch.id}-${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase
                .storage
                .from('banners')
                .upload(fileName, bannerImage);

            if (uploadError) {
                console.error("Image Upload Error:", uploadError.message);
                return { error: "배너 이미지 업로드 실패" };
            }

            const { data: publicUrlData } = supabase
                .storage
                .from('banners')
                .getPublicUrl(fileName);

            bannerImageUrl = publicUrlData.publicUrl;
        }

        // 5. Insert Profile
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
                banner_image_url: bannerImageUrl
            });

        if (profileError) {
            console.error("Profile Insert Error: ", profileError.message);
            return { error: "프로필 정보 저장 실패" };
        }

        return { success: true, nickname };

    } catch (error) {
        console.error("Server Action Exception:", error);
        return { error: "회원가입 처리 중 알 수 없는 오류가 발생했습니다." };
    }
}
