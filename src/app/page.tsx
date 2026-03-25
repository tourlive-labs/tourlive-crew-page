import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function RootPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    console.log("[RootPage] Current User:", user?.email);

    if (!user) {
        console.log("[RootPage] No user, redirecting to /login");
        redirect("/login");
    }

    // If logged in, check for profile
    const userEmail = user.email?.trim() || "";
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, tourlive_email')
        .eq('tourlive_email', userEmail)
        .maybeSingle();

    console.log("[RootPage] Profile Data for", userEmail, ":", profile);
    if (profileError) console.error("[RootPage] Profile check error:", profileError);

    if (!profile) {
        console.log("[RootPage] No profile found for", user.email, "- redirecting to /onboarding");
        redirect("/onboarding");
    }

    if (profile.role === 'admin' || user.email === "root@tourlive.co.kr") {
        console.log("[RootPage] Admin user, redirecting to /manage");
        redirect("/manage");
    }

    console.log("[RootPage] Regular user, redirecting to /dashboard");
    redirect("/dashboard");
}
