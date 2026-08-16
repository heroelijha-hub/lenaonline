import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  // Update Supabase session
  const response = await updateSession(request)

  // Custom route protection logic
  // For example, redirect unauthenticated users away from /account
  const url = request.nextUrl.clone()
  
  if (url.pathname.startsWith('/account')) {
    // We can parse the session cookies to see if there is an auth token
    const hasSession = request.cookies.getAll().some(c => c.name.startsWith('sb-') && c.name.endsWith('-auth-token'))
    
    if (!hasSession) {
      url.pathname = '/login'
      return Response.redirect(url)
    }
  }

  return response
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
