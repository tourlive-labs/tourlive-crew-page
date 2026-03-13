"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export async function signIn(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const supabase = await createClient();

    // 1. Verify credentials with Supabase Auth
    const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (authError || !user) {
        return { error: "로그인 정보가 올바르지 않습니다." };
    }

    // 2. Admin Auto-Auth Logic (@tourlive.co.kr)
    if (email.endsWith("@tourlive.co.kr")) {
        const { createAdminClient } = await import("@/utils/supabase/admin");
        const adminSupabase = createAdminClient();

        // Ensure app_metadata role is 'admin'
        if (user.app_metadata?.role !== 'admin') {
            await adminSupabase.auth.admin.updateUserById(user.id, { 
                app_metadata: { role: 'admin' } 
            });
        }

        // Check if profile exists
        const { data: profile } = await adminSupabase
            .from('profiles')
            .select('id')
            .eq('tourlive_email', email)
            .maybeSingle();

        if (!profile) {
            console.log(`[Auth] Creating auto-profile for admin: ${email}`);
            
            // Get latest batch to assign
            const { data: latestBatch } = await adminSupabase
                .from('batches')
                .select('id')
                .order('term', { ascending: false })
                .limit(1)
                .single();

            if (latestBatch) {
                // Create Crew
                const { data: crewData } = await adminSupabase
                    .from('crews')
                    .insert({
                        user_id: user.id,
                        batch_id: latestBatch.id,
                        name: user.user_metadata?.full_name || email.split('@')[0],
                    })
                    .select('id')
                    .single();

                if (crewData) {
                    // Create Profile
                    await adminSupabase.from('profiles').insert({
                        crew_id: crewData.id,
                        full_name: user.user_metadata?.full_name || email.split('@')[0],
                        phone_number: "000-0000-0000",
                        tourlive_email: email,
                        contact_email: email,
                        selected_activity: "admin_auto",
                        nickname: email.split('@')[0],
                    });
                }
            }
        }
        
        return redirect("/manage");
    }

    // 3. Regular users redirect to dashboard
    redirect("/dashboard");
}

export async function signOut() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
}
