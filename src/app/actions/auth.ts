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

    // 2. Fetch role from profiles table using robust user_id join
    console.log("[AuthAction] Fetching profile via join for:", user.id);
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(`
            role,
            crews!inner (
                user_id
            )
        `)
        .eq('crews.user_id', user.id)
        .maybeSingle();

    console.log("[AuthAction] Profile Join Result:", profile);
    if (profileError) console.error("[AuthAction] Profile join error:", profileError.message);

    // 3. Redirection Logic
    if (email === "root@tourlive.co.kr") {
        console.log("[AuthAction] Root user detected, redirecting to /manage");
        return redirect("/manage");
    }

    if (!profile) {
        console.log("[AuthAction] No profile record found, redirecting to /onboarding");
        return redirect("/onboarding");
    }

    if (profile.role === 'admin') {
        console.log("[AuthAction] Admin role detected, redirecting to /manage");
        return redirect("/manage");
    }

    console.log("[AuthAction] Redirecting to /dashboard");
    return redirect("/dashboard");
}

export async function signOut() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
}

