import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    );
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();
    const url = request.nextUrl.clone();
    const isLoginPath = url.pathname === "/login";
    const isOnboardingPath = url.pathname === "/onboarding";
    const isAdminPath = url.pathname.startsWith("/admin") || url.pathname === "/manage";

    // 1. Root and All Routes Default to /login
    // EXCEPTION: Allow /onboarding for new sign-ups
    if (!user && !isLoginPath && !isOnboardingPath) {
        return NextResponse.redirect(new URL("/login", request.url), 307);
    }

    if (user) {
        // Fetch Profile for Role & Completion Check
        const { data: profile } = await supabase
            .from("profiles")
            .select("role, full_name, selected_activity")
            .eq("id", user.id)
            .maybeSingle();

        const isRootAdmin = user.email === "root@tourlive.co.kr";
        const hasAdminRole = profile?.role === "admin";
        const isAnyAdmin = isRootAdmin || hasAdminRole;

        // 2. Admin Pillar: Only admins for /admin/manage
        if (isAdminPath && !isAnyAdmin) {
            return NextResponse.redirect(new URL("/dashboard", request.url), 307);
        }

        // 3. Root / Redirect
        if (url.pathname === "/") {
            const dest = isAnyAdmin ? "/admin" : "/dashboard";
            return NextResponse.redirect(new URL(dest, request.url), 307);
        }

        // 4. Redirect from Login if already logged in with valid profile or is Admin
        const isProfileComplete = profile?.full_name && profile?.selected_activity;
        if (isLoginPath && (isProfileComplete || isAnyAdmin)) {
            const dest = isAnyAdmin ? "/admin" : "/dashboard";
            return NextResponse.redirect(new URL(dest, request.url), 307);
        }

        // 5. Missing Account Pillar: Regular users without profile stay on /login (if they try to access other pages)
        if (!isAnyAdmin && !profile && !isLoginPath && !isOnboardingPath) {
            return NextResponse.redirect(new URL("/login", request.url), 307);
        }
    }

    return response;
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
