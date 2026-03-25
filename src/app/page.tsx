import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function RootPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    console.log("[RootPage] Auth User ID:", user?.id);

    if (!user) {
        console.log("[RootPage] No user session found, redirecting to /login");
        redirect("/login");
    }

    // Robust lookup: Join profiles with crews using user_id
    console.log("[RootPage] Fetching profile via crews join for:", user.id);
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

    console.log("[RootPage] Join Result Data:", JSON.stringify(profile, null, 2));
    if (profileError) {
        console.error("[RootPage] Profile join error:", profileError.message);
    }

    if (!profile) {
        console.log("[RootPage] No profile record found, redirecting to /onboarding");
        redirect("/onboarding");
    }

    if (profile.role === 'admin' || user.email === "root@tourlive.co.kr") {
        console.log("[RootPage] Admin/Root detected, redirecting to /manage");
        redirect("/manage");
    }

    console.log("[RootPage] Regular user detected, redirecting to /dashboard");
    redirect("/dashboard");
}
