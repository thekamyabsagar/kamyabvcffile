import { withAuth } from 'next-auth/middleware';
import { authConfig } from './app/auth.config';

export default withAuth(
  // `withAuth` augments your `Request` with the user's token.
  function middleware(req) {
    return null;
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (login page)
     * - public files (*.svg, *.png, *.jpg, etc.)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|login|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.webp|.*\\.ico).*)",
  ],
};