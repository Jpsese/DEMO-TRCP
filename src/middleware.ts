// middleware.ts
import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const path = req.nextUrl.pathname
    const token = req.nextauth.token

    console.log('req', token)
    if (path === "/") {
      if (token?.role === "admin") {
        return NextResponse.redirect(new URL("/admin/manage-users", req.url))
      } else if (token) {
        return NextResponse.redirect(new URL("/users/manage-posts", req.url))
      }
    }
  },
  {
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = { matcher: ["/", '/admin/:path*', "/users/:path*"] }