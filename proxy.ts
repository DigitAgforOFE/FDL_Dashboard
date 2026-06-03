import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isAuthPage = nextUrl.pathname.startsWith("/login");
  const isApiAuth = nextUrl.pathname.startsWith("/api/auth");

  const isMobileApi = nextUrl.pathname.startsWith("/api/upload") ||
                      nextUrl.pathname.startsWith("/api/files") ||
                      nextUrl.pathname.startsWith("/api/data") ||
                      (nextUrl.pathname.startsWith("/api/farms/") && nextUrl.pathname.endsWith("/summary"));

  if (isApiAuth || isMobileApi) return NextResponse.next();
  if (isAuthPage) {
    if (isLoggedIn) return NextResponse.redirect(new URL("/", nextUrl));
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
