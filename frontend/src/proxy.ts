import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "glazedin_session";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoggedIn = request.cookies.has(SESSION_COOKIE);

  if (pathname === "/login") {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt).*)",
  ],
};
