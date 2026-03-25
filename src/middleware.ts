import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // 1. Get Session for most accurate server-side session
    const { data: { user } } = await supabase.auth.getUser()

    const url = request.nextUrl.clone()
    const isAuthPage = url.pathname === '/login' || url.pathname === '/onboarding'
    const isApiRoute = url.pathname.startsWith('/api')

    if (isApiRoute) return supabaseResponse

    if (!user) {
        // Not logged in: Redirect to /login if trying to access protected routes OR root
        if (!isAuthPage) {
            console.log(`[Middleware] GUEST: ${url.pathname} -> /login`)
            url.pathname = '/login'
            return NextResponse.redirect(url)
        }
        return supabaseResponse
    }

    // 2. Fetch Profile without cache using robust two-step lookup (Schema: Auth -> Crews -> Profiles)
    // Step A: Find Crew ID associated with the user UID
    const { data: crew } = await supabase
        .from('crews')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

    let profile = null
    if (crew) {
        // Step B: Find Profile associated with the Crew record
        const { data: profileData } = await supabase
            .from('profiles')
            .select('role, full_name, selected_activity')
            .eq('crew_id', crew.id)
            .maybeSingle()
        profile = profileData
    }

    // 3. THE INTERCEPTOR (as requested)
    const isAtOnboarding = url.pathname === '/onboarding'
    const hasName = !!profile?.full_name
    const hasActivity = !!profile?.selected_activity
    const isProfileComplete = hasName && hasActivity
    const isAdmin = profile?.role === 'admin' || user.email === "root@tourlive.co.kr"

    console.log(`[Middleware] AUDIT - ID: ${user.id}, Path: ${url.pathname}, Complete: ${isProfileComplete}`)

    if (isProfileComplete && isAtOnboarding) {
        console.log("FORCE REDIRECT: User has profile, moving to /dashboard/admin")
        const dest = isAdmin ? '/admin' : '/dashboard'
        url.pathname = dest
        return NextResponse.redirect(url)
    }

    // 4. Redirection Logic for logged-in users
    if (!isProfileComplete) {
        // Force /onboarding if profile is incomplete
        if (url.pathname !== '/onboarding') {
            console.log("[Middleware] FORCE: Incomplete profile -> /onboarding")
            url.pathname = '/onboarding'
            return NextResponse.redirect(url)
        }
    } else {
        // Profile is complete: Prevent access to /login or /onboarding
        if (isAuthPage) {
            url.pathname = isAdmin ? '/admin' : '/dashboard'
            return NextResponse.redirect(url)
        }

        // Handle path consistency (/admin for admins, /dashboard for users)
        if (isAdmin) {
            if (url.pathname === '/' || url.pathname === '/dashboard') {
                url.pathname = '/admin'
                return NextResponse.redirect(url)
            }
        } else {
            if (url.pathname === '/' || url.pathname.startsWith('/admin')) {
                url.pathname = '/dashboard'
                return NextResponse.redirect(url)
            }
        }
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        /*
         * Match all request paths including root and onboarding
         */
        '/',
        '/onboarding',
        '/dashboard/:path*',
        '/admin/:path*',
        '/login',
    ],
}
