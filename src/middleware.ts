import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get("host") || "";

  const isAdminRoute = pathname.startsWith("/admin");
  const isAdminApiRoute = pathname.startsWith("/api/admin");

  // Check if subdomain isolation mode is explicitly enabled via environment variable
  const enforceSubdomainOnly = process.env.ADMIN_SUBDOMAIN_ONLY === "true";

  // If subdomain isolation is enforced in production and request is NOT on the admin subdomain
  if (enforceSubdomainOnly && (isAdminRoute || isAdminApiRoute)) {
    const isAdminSubdomain = hostname.startsWith("admin.") || hostname.startsWith("admin-");

    if (!isAdminSubdomain) {
      console.warn(
        `[Middleware Security] Blocked attempt to access admin path '${pathname}' from public domain '${hostname}'`
      );
      // Rewrite to 404 Not Found to obscure admin routes on the public domain
      return NextResponse.rewrite(new URL("/404", request.url));
    }
  }

  // Security headers for admin routes
  const response = NextResponse.next();

  if (isAdminRoute || isAdminApiRoute) {
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=()"
    );
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
