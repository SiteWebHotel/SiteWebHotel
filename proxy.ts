import { auth } from "@/lib/auth";

export default auth((req) => {
  const isAdmin = req.nextUrl.pathname.startsWith("/admin");
  const isLoginPage = req.nextUrl.pathname === "/admin/login";

  if (isAdmin && !isLoginPage && !req.auth) {
    return Response.redirect(new URL("/admin/login", req.nextUrl.origin));
  }

  if (isLoginPage && req.auth) {
    return Response.redirect(new URL("/admin", req.nextUrl.origin));
  }
});

export const config = {
  matcher: ["/admin/:path*"],
};
