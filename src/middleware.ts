import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Initialize Redis and Ratelimit if env vars are present
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

let ratelimit: Ratelimit | null = null;
if (redisUrl && redisToken) {
  ratelimit = new Ratelimit({
    redis: new Redis({ url: redisUrl, token: redisToken }),
    limiter: Ratelimit.slidingWindow(30, '10 s'), // 30 requêtes max par 10 secondes par IP
    analytics: true,
  });
}

export async function middleware(request: NextRequest) {
  // 1. Rate Limiting Check (Protection anti-DDoS / Brute force)
  if (ratelimit) {
    // Get IP address from headers (Vercel sets x-forwarded-for)
    const ip = request.headers.get('x-forwarded-for') ?? request.ip ?? '127.0.0.1';
    
    // Check limit for this IP
    const { success, limit, reset, remaining } = await ratelimit.limit(`ratelimit_${ip}`);
    
    if (!success) {
      return new NextResponse(
        `<!DOCTYPE html><html><head><title>429 Too Many Requests</title><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="font-family: system-ui; text-align: center; padding: 2rem; background: #f9fafb;"><h1 style="color: #ef4444;">Accès temporairement bloqué</h1><p>Vous avez envoyé trop de requêtes en peu de temps.</p><p>Par mesure de sécurité, merci de patienter quelques secondes avant de réessayer.</p></body></html>`,
        { 
          status: 429, 
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
            'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
          } 
        }
      );
    }
  }

  // 2. Update Supabase session
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
