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

    if (profileError) {
        console.error("[AuthAction] Profile lookup error:", profileError.message);
        return { error: "시스템 오류가 발생했습니다." };
    }

    // Missing Account Pillar: If account missing, stay on /login and show Toast.
    if (!profile) {
        console.log("[AuthAction] Account exists but profile is missing.");
        // Sign out to prevent middleware from thinking they are logged in and have access
        await supabase.auth.signOut();
        return { error: "계정 정보를 찾을 수 없습니다." };
    }

    // 3. Redirection logic (Middleware will also handle this, but server action can too)
    const isAdmin = profile.role === 'admin' || email === "root@tourlive.co.kr";
    
    if (isAdmin) {
        return { success: true, redirectTo: "/admin" };
    }

    return { success: true, redirectTo: "/dashboard" };
}

export async function signOut() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
}

