import createIntlMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";

import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import { locales, routing } from "./i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

const localePattern = new RegExp(`^/(${locales.join("|")})(/|$)`);

function stripLocale(pathname: string) {
  const match = pathname.match(localePattern);
  if (!match) return { locale: routing.defaultLocale, path: pathname };
  const locale = match[1]!;
  const path = pathname.slice(locale.length + 1) || "/";
  return { locale, path: path.startsWith("/") ? path : `/${path}` };
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { locale, path } = stripLocale(pathname);

  const isPublic =
    path === "/" ||
    path.startsWith("/auth/") ||
    path.startsWith("/p/") ||
    pathname === "/";

  const hasSession = Boolean(
    request.cookies.get(SESSION_COOKIE_NAME)?.value
  );

  if (!isPublic && !hasSession) {
    const login = new URL(`/${locale}/auth/login`, request.url);
    login.searchParams.set("from", pathname);
    return NextResponse.redirect(login);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
