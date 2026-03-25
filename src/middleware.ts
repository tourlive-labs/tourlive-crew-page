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

    // 1. AUTHENTICATION CHECK (Highest Priority as requested)
    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user

    const url = request.nextUrl.clone()
    const isApiRoute = url.pathname.startsWith('/api')
    if (isApiRoute) return supabaseResponse

    if (!user) {
        // Step 1: Redirect to /login if there is no active session AND user is NOT on /login
        if (url.pathname !== '/login') {
            console.log(`[AUTH_CHECK] No session found, moving to /login (from ${url.pathname})`)
            url.pathname = '/login'
            return NextResponse.redirect(url)
        }
        return supabaseResponse
    }

    // 2. ONBOARDING COMPLETION CHECK (Only if session exists)
    // Fetch Profile without cache using robust two-step lookup
    const { data: crew } = await supabase
        .from('crews')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

    let profile = null
    if (crew) {
        const { data: profileData } = await supabase
            .from('profiles')
            .select('role, full_name, selected_activity')
            .eq('crew_id', crew.id)
            .maybeSingle()
        profile = profileData
    }

    const isAtOnboarding = url.pathname === '/onboarding'
    const isProfileComplete = !!(profile?.full_name && profile?.selected_activity)
    const isAdmin = profile?.role === 'admin' || user.email === "root@tourlive.co.kr"

    console.log(`[Middleware] AUDIT - ID: ${user.id}, Path: ${url.pathname}, Complete: ${isProfileComplete}`)

    // 3. DUPLICATE ACCESS PREVENTION (and Required Redirects)
    if (!isProfileComplete) {
        // If profile is missing AND user is NOT on /onboarding -> REDIRECT to /onboarding
        if (url.pathname !== '/onboarding') {
            console.log("[Middleware] FORCE: Incomplete profile -> /onboarding")
            url.pathname = '/onboarding'
            return NextResponse.redirect(url)
        }
    } else {
        // If session exists AND profile complete:
        // Prevent access to /login or /onboarding
        if (url.pathname === '/login' || url.pathname === '/onboarding') {
            console.log("[Middleware] FORCE: Already onboarded -> /dashboard/admin")
            url.pathname = isAdmin ? '/admin' : '/dashboard'
            return NextResponse.redirect(url)
        }

        // Handle role-based path consistency
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
