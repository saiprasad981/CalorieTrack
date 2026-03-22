import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

const guestOnlyPaths = new Set(["/login", "/signup"]);

export async function middleware(request: NextRequest) {
  const localAuthCookie = request.cookies.get("calorietrack-auth")?.value;
  const googleToken = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  });

  const isAuthenticated = Boolean(localAuthCookie || googleToken);
  const { pathname } = request.nextUrl;

  if (guestOnlyPaths.has(pathname)) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  }

  if (!isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/meals/:path*",
    "/history/:path*",
    "/saved-meals/:path*",
    "/insights/:path*",
    "/progress/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/dev/:path*",
    "/onboarding/:path*",
    "/login",
    "/signup",
  ],
};
