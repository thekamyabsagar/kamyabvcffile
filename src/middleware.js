export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    // Protected routes that require authentication
    "/",
    "/((?!api|_next/static|_next/image|login|favicon.ico).*)",
  ],
};