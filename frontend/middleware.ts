import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This middleware runs on the Edge, so we can't use localStorage.
// Instead, we use cookies to check auth state.
// The client-side layout.tsx handles the actual localStorage check.

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // We only handle the basic routing logic here.
  // The actual role check is done client-side in the layout because
  // localStorage is not available in Edge middleware.
  // We use a cookie-based approach as a fallback.

  const token = request.cookies.get("token")?.value;

  // Protected routes - redirect to login if no token
  if (pathname.startsWith("/dashboard") ||
      pathname.startsWith("/pesanan") ||
      pathname.startsWith("/wishlist") ||
      pathname.startsWith("/alamat") ||
      pathname.startsWith("/promo") ||
      pathname.startsWith("/pengaturan-akun") ||
      pathname.startsWith("/riwayat-pesanan") ||
      pathname.startsWith("/admin")) {

    if (!token) {
      const loginUrl = new URL("/masuk", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/pesanan/:path*",
    "/wishlist/:path*",
    "/alamat/:path*",
    "/promo/:path*",
    "/pengaturan-akun/:path*",
    "/riwayat-pesanan/:path*",
    "/admin/:path*",
  ],
};
