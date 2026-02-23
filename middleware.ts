import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// In-memory storage za rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// vremenski window za rate limiting (1 minut u milisekundama)
const RATE_LIMIT_WINDOW = 60 * 1000;

// maksimalan broj zahteva za autentifikacione rute
const MAX_REQUESTS_AUTH = 10;

// maksimalan broj zahteva za ostale API rute
const MAX_REQUESTS_API = 100;

// proverava rate limit za datu IP adresu
function checkRateLimit(
  ip: string,
  maxRequests: number,
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: maxRequests - record.count };
}

// vraca IP adresu iz zahteva
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";
  return ip;
}

// dodaje security headere na response
function addSecurityHeaders(response: NextResponse): NextResponse {
  // XSS protection
  response.headers.set("X-XSS-Protection", "1; mode=block");

  // prevent MIME type sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");

  // clickjacking protection
  response.headers.set("X-Frame-Options", "DENY");

  // referrer policy
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // content security policy
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://api.open-meteo.com https://date.nager.at",
      "frame-ancestors 'none'",
    ].join("; "),
  );

  // strict transport security (HSTS)
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains",
  );

  // permissions policy
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );

  return response;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = getClientIP(request);

  // rate limiting za auth rute
  if (pathname.startsWith("/api/auth")) {
    const { allowed, remaining } = checkRateLimit(
      `auth:${ip}`,
      MAX_REQUESTS_AUTH,
    );

    if (!allowed) {
      return NextResponse.json(
        { error: "Previše zahteva. Pokušajte ponovo za minut." },
        {
          status: 429,
          headers: {
            "Retry-After": "60",
            "X-RateLimit-Limit": MAX_REQUESTS_AUTH.toString(),
            "X-RateLimit-Remaining": "0",
          },
        },
      );
    }

    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Limit", MAX_REQUESTS_AUTH.toString());
    response.headers.set("X-RateLimit-Remaining", remaining.toString());
    return addSecurityHeaders(response);
  }

  // rate limiting za ostale API rute
  if (pathname.startsWith("/api")) {
    const { allowed, remaining } = checkRateLimit(
      `api:${ip}`,
      MAX_REQUESTS_API,
    );

    if (!allowed) {
      return NextResponse.json(
        { error: "Previše zahteva. Pokušajte ponovo za minut." },
        {
          status: 429,
          headers: {
            "Retry-After": "60",
            "X-RateLimit-Limit": MAX_REQUESTS_API.toString(),
            "X-RateLimit-Remaining": "0",
          },
        },
      );
    }

    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Limit", MAX_REQUESTS_API.toString());
    response.headers.set("X-RateLimit-Remaining", remaining.toString());
    return addSecurityHeaders(response);
  }

  // za sve ostale rute samo dodajemo security headere
  const response = NextResponse.next();
  return addSecurityHeaders(response);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
