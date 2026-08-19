import { NextRequest, NextResponse } from "next/server";

// Must match SESSION_COOKIE_NAME in src/lib/auth.ts. Duplicated (not imported)
// because that module uses `next/headers`'s `cookies()`, which is scoped to
// Server Components/Actions and isn't available here — Proxy reads cookies
// straight off the NextRequest instead. This function only checks whether a
// session cookie is present (fast redirect for the common case); real
// signature verification happens in src/lib/auth.ts::getSession() on every
// page, which is Proxy's own recommended defense-in-depth pattern.
const SESSION_COOKIE_NAME = "safar_session";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/login") || pathname.startsWith("/api/") || pathname.startsWith("/_next")) {
    return NextResponse.next();
  }
  if (!req.cookies.get(SESSION_COOKIE_NAME)) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
