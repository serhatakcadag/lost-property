import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/items/new',
    '/items/edit/:path*',
    '/uploads/:path*',
  ],
}; 