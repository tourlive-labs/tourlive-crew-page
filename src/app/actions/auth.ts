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

    // 2. Fetch profile directly by synced ID (profile.id === user.id)
    console.log("[AuthAction] Fetching profile for user:", user.id);
    
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

    if (profileError) console.error("[AuthAction] Profile lookup error:", profileError.message);

    console.log("[AuthAction] Profile Result:", !!profile, "Complete:", !!(profile?.full_name && profile?.selected_activity));

    // 3. Redirection Logic
    if (email === "root@tourlive.co.kr") {
        console.log("[AuthAction] Root user detected, redirecting to /admin");
        return redirect("/admin");
    }

    const isProfileComplete = profile?.full_name && profile?.selected_activity;
    if (!isProfileComplete) {
        console.log("[AuthAction] Profile incomplete, redirecting to /onboarding");
        return redirect("/onboarding");
    }

    if (profile.role === 'admin') {
        console.log("[AuthAction] Admin role detected, redirecting to /admin");
        return redirect("/admin");
    }

    console.log("[AuthAction] Redirecting to /dashboard");
    return redirect("/dashboard");
}

export async function signOut() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
}

