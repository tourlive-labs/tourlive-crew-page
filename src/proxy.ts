import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
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

    const { data: { session } } = await supabase.auth.getSession();
    
    // SKIP static assets manually to ensure layout doesn't break
    if (request.nextUrl.pathname.startsWith('/_next') || 
        request.nextUrl.pathname.includes('.')) {
        return supabaseResponse
    }

    // THE GATEKEEPER (Forensic Restore inherited from middleware)
    if (!session && !request.nextUrl.pathname.startsWith('/login')) {
        console.log(">>>> [SIMPLE_AUTH_CHECK] (via proxy.ts) No session, moving to /login")
        return NextResponse.redirect(new URL('/login', request.url), { status: 307 });
    }

    return supabaseResponse
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
