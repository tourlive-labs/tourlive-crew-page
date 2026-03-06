"use server";

import { createClient } from "@/utils/supabase/server";
import { FormValues } from "@/lib/validations/onboarding-schema";
import { redirect } from "next/navigation";

export async function submitOnboardingForm(formData: FormData) {
    const supabase = await createClient();

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

        // 1. Sign up the user (Auth)
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: tourliveEmail,
            password: password,
            options: {
                data: {
                    full_name: fullName,
                },
                // Note: app_metadata role cannot be set via signUp in client/server client without Service Role Key.
                // For this prototype, we'll assume the user might manually set it or we'd use an RPC.
            },
        });

        if (authError) {
            console.error("Auth Exception:", authError.message);
            return { error: `계정 생성 실패: ${authError.message}` };
        }

        const userId = authData.user?.id;
        if (!userId) {
            return { error: "사용자 계정을 생성할 수 없습니다." };
        }

        // Find Default Batch 14
        const { data: batchData, error: batchError } = await supabase
            .from('batches')
            .select('id')
            .eq('term', 14)
            .limit(1)
            .single();

        if (batchError || !batchData) {
            console.error("Could not find Default Batch 14.");
            return { error: "시스템 오류: 14기 정보를 찾을 수 없습니다." };
        }

        // 2. Insert Crew
        // Note: This might fail due to RLS if the user is not yet an admin.
        // In a real app, use an RPC with SECURITY DEFINER.
        const { data: crewData, error: crewError } = await supabase
            .from('crews')
            .insert({
                user_id: userId,
                batch_id: batchData.id,
                name: fullName,
            })
            .select('id')
            .single();

        if (crewError) {
            console.error("Crew Insert Error: ", crewError.message);
            return { error: "크루 정보 저장 실패 (권한 문제일 수 있습니다)." };
        }

        let bannerImageUrl = null;

        // 3. Upload Banner Image
        if (bannerImage && bannerImage.size > 0) {
            const fileExt = bannerImage.name.split('.').pop();
            const fileName = `${userId}-${Date.now()}.${fileExt}`;

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

        // 4. Insert Profile
        const { error: profileError } = await supabase
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
            if (profileError.code === '23505') {
                return { error: "이미 사용 중인 닉네임입니다." };
            }
            return { error: "프로필 정보 저장 실패" };
        }

        return { success: true, nickname };

    } catch (error) {
        console.error("Server Action Exception:", error);
        return { error: "회원가입 처리 중 알 수 없는 오류가 발생했습니다." };
    }
}
