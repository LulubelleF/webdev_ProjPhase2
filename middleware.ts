import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Define public paths that don't require authentication
  const isPublicPath = path === "/";

  // Get the token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Check if token exists and is not expired
  const isValidToken =
    token && token.exp && (token.exp as number) * 1000 > Date.now();

  // Redirect logic
  if (isPublicPath && isValidToken) {
    // If user is already logged in and tries to access login page,
    // redirect to dashboard
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!isPublicPath && !isValidToken) {
    // If user is not logged in and tries to access a protected route,
    // redirect to login page
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Allow the request to proceed
  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth.js API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images/ (public images folder)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|images/).*)",
  ],
};
