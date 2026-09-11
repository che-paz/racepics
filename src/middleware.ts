import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import {
  dashboardPathForRole,
  getProfile,
  wrongRoleRedirectPath,
} from "@/lib/auth/profile";

const AUTH_ROUTES = ["/login", "/register"];
const RATE_LIMIT_COOKIE = "rp_rl";
const RATE_LIMIT_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function redirectWithSession(url: URL, sessionResponse: NextResponse): NextResponse {
  const response = NextResponse.redirect(url);
  sessionResponse.cookies.getAll().forEach((cookie) => {
    response.cookies.set(cookie);
  });
  return response;
}

function ensureRateLimitCookie(
  request: NextRequest,
  response: NextResponse
): NextResponse {
  if (!request.nextUrl.pathname.startsWith("/e/")) {
    return response;
  }
  if (request.cookies.get(RATE_LIMIT_COOKIE)?.value) {
    return response;
  }
  const sid = crypto.randomUUID();
  request.cookies.set(RATE_LIMIT_COOKIE, sid);
  response.cookies.set(RATE_LIMIT_COOKIE, sid, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: RATE_LIMIT_COOKIE_MAX_AGE,
  });
  return response;
}

export async function middleware(request: NextRequest) {
  const { supabase, supabaseResponse, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  const isOrganizerRoute = pathname.startsWith("/organizer");
  const isPhotographerRoute = pathname.startsWith("/photographer");
  const isProtectedRoute = isOrganizerRoute || isPhotographerRoute;

  if (!user && isProtectedRoute) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirectTo", pathname);
    return redirectWithSession(loginUrl, supabaseResponse);
  }

  if (user && isAuthRoute) {
    const profile = await getProfile(supabase, user.id);
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = dashboardPathForRole(profile?.role);
    dashboardUrl.search = "";
    return redirectWithSession(dashboardUrl, supabaseResponse);
  }

  if (user && isProtectedRoute) {
    const profile = await getProfile(supabase, user.id);
    const redirectPath = wrongRoleRedirectPath(pathname, profile?.role);

    if (redirectPath && redirectPath !== pathname) {
      const url = request.nextUrl.clone();
      url.pathname = redirectPath;
      url.search = "";
      return redirectWithSession(url, supabaseResponse);
    }
  }

  return ensureRateLimitCookie(request, supabaseResponse);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
