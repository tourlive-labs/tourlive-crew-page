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

    // 2. Fetch role from profiles table
    const normalizedEmail = email.trim();
    console.log("[AuthAction] Fetching profile for:", normalizedEmail);
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('tourlive_email', normalizedEmail)
        .maybeSingle();

    console.log("[AuthAction] Profile Data:", profile);
    if (profileError) console.error("[AuthAction] Profile check error:", profileError);

    // 3. Redirection Logic
    // Super Admin check (bypass role check if email is root)
    if (email === "root@tourlive.co.kr") {
        console.log("[AuthAction] Root user, redirecting to /manage");
        return redirect("/manage");
    }

    if (!profile) {
        // No profile found = onboarding not finished
        console.log("[AuthAction] No profile, redirecting to /onboarding");
        return redirect("/onboarding");
    }

    if (profile.role === 'admin') {
        console.log("[AuthAction] Admin role, redirecting to /manage");
        return redirect("/manage");
    }

    // Default to dashboard for crew or others with a profile
    console.log("[AuthAction] User redirecting to /dashboard");
    return redirect("/dashboard");
}

export async function signOut() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
}

