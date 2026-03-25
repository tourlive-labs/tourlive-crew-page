import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function RootPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // If logged in, check for profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('tourlive_email', user.email)
        .maybeSingle();

    if (!profile) {
        // Logged in but no profile = go to onboarding to complete registration
        redirect("/onboarding");
    }

    if (profile.role === 'admin' || user.email === "root@tourlive.co.kr") {
        redirect("/manage");
    }

    redirect("/dashboard");
}
