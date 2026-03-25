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

    // 1. Get current session
    const { data: { user } } = await supabase.auth.getUser()

    // 2. Routing Logic
    const url = request.nextUrl.clone()
    const isAuthPage = url.pathname === '/login' || url.pathname === '/onboarding'
    const isPublicPage = isAuthPage
    const isApiRoute = url.pathname.startsWith('/api')

    if (isApiRoute) return supabaseResponse

    if (!user) {
        // Not logged in: Redirect to /login if trying to access protected routes
        if (!isPublicPage) {
            url.pathname = '/login'
            return NextResponse.redirect(url)
        }
        return supabaseResponse
    }

    // 3. User is logged in - Check profile completeness and role using robust user_id join
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(`
            id,
            role,
            full_name,
            selected_activity,
            crews!inner (
                user_id
            )
        `)
        .eq('crews.user_id', user.id)
        .maybeSingle()

    if (profileError) {
        console.error("[Middleware] Profile fetch error:", profileError.message)
    }

    const isAdmin = profile?.role === 'admin' || user.email === "root@tourlive.co.kr"
    const isProfileComplete = !!(profile?.full_name && profile?.selected_activity)

    // 4. Redirection Logic for logged-in users
    if (!isProfileComplete) {
        // Force /onboarding if profile is incomplete
        if (url.pathname !== '/onboarding') {
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
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
