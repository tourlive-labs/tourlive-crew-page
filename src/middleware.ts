import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    console.log(">>>> MIDDLEWARE EXECUTING FOR PATH:", request.nextUrl.pathname)

    let supabaseResponse = NextResponse.next({
        request,
    })

    // Force 307 and Bust Cache
    supabaseResponse.headers.set('x-middleware-cache', 'no-cache')

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
                    supabaseResponse.headers.set('x-middleware-cache', 'no-cache')
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const url = request.nextUrl.clone()
    
    // SKIP static assets and API routes manually for performance
    if (url.pathname.startsWith('/_next') || 
        url.pathname.startsWith('/api') || 
        url.pathname.includes('.')) {
        return supabaseResponse
    }

    // 1. AUTHENTICATION CHECK (Highest Priority as requested)
    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user

    if (!user) {
        // Step 1: Redirect to /login if there is no active session AND user is NOT on /login
        if (url.pathname !== '/login') {
            console.log(`[AUTH_CHECK] No session found, forcing redirect to /login (from ${url.pathname})`)
            url.pathname = '/login'
            return NextResponse.redirect(url, { status: 307 })
        }
        return supabaseResponse
    }

    // 2. ONBOARDING COMPLETION CHECK (Only if session exists)
    const { data: profile } = await supabase
                    .from('profiles')
                    .select('id, role, full_name, selected_activity')
                    .eq('id', user.id)
                    .maybeSingle();

    const isProfileComplete = !!(profile?.full_name && profile?.selected_activity)
    const isAdmin = profile?.role === 'admin' || user.email === "root@tourlive.co.kr"

    console.log(`[Middleware] AUDIT - ID: ${user.id}, Path: ${url.pathname}, Complete: ${isProfileComplete}`)

    // 3. REDIRECTION LOGIC (Strict 307)
    if (!isProfileComplete) {
        if (url.pathname !== '/onboarding') {
            console.log("[Middleware] FORCE: Incomplete profile -> /onboarding (307)")
            url.pathname = '/onboarding'
            return NextResponse.redirect(url, { status: 307 })
        }
    } else {
        if (url.pathname === '/login' || url.pathname === '/onboarding' || url.pathname === '/') {
            const target = isAdmin ? '/admin' : '/dashboard'
            console.log(`[Middleware] FORCE: Already onboarded -> ${target} (307)`)
            url.pathname = target
            return NextResponse.redirect(url, { status: 307 })
        }

        // Role isolation
        if (isAdmin && url.pathname.startsWith('/dashboard')) {
            url.pathname = '/admin'
            return NextResponse.redirect(url, { status: 307 })
        }
        if (!isAdmin && url.pathname.startsWith('/admin')) {
            url.pathname = '/dashboard'
            return NextResponse.redirect(url, { status: 307 })
        }
    }

    return supabaseResponse
}

// EXPORT NO MATCHER TO ENSURE 100% INTERCEPTION
export const config = {}
