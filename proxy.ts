import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export const proxy = withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    const role = (token as any)?.role;

    if (path.startsWith("/dashboard")) {
      // Admin Routes
      if (path.startsWith("/dashboard/reports")) {
        if (role === "MANAGER" && !path.startsWith("/dashboard/reports/overview")) {
          return NextResponse.redirect(new URL("/unauthorized", req.url));
        }
        if (role !== "ADMIN" && role !== "MANAGER") {
          return NextResponse.redirect(new URL("/unauthorized", req.url));
        }
      }

      // Vendor Management
      if (path.startsWith("/dashboard/vendors")) {
        if (role !== "ADMIN" && role !== "PROCUREMENT_OFFICER") {
          return NextResponse.redirect(new URL("/unauthorized", req.url));
        }
      }

      // RFQs & Quotations
      if (
        path.startsWith("/dashboard/rfqs") ||
        path.startsWith("/dashboard/quotations") ||
        path.startsWith("/dashboard/po-invoices")
      ) {
        // Vendors, Procurement, Managers
        if (role !== "PROCUREMENT_OFFICER" && role !== "VENDOR" && role !== "MANAGER") {
          return NextResponse.redirect(new URL("/unauthorized", req.url));
        }
        
        // Only Procurement Officers can CREATE/EDIT rfqs
        if (path.includes("/rfqs/create") || path.includes("/edit")) {
          if (role !== "PROCUREMENT_OFFICER") {
            return NextResponse.redirect(new URL("/unauthorized", req.url));
          }
        }
      }

      // Comparison
      if (path.startsWith("/dashboard/comparison")) {
        if (role !== "PROCUREMENT_OFFICER") {
          return NextResponse.redirect(new URL("/unauthorized", req.url));
        }
      }

      // Approvals
      if (path.startsWith("/dashboard/approvals")) {
        if (role !== "MANAGER") {
          return NextResponse.redirect(new URL("/unauthorized", req.url));
        }
      }
    }
    
    return NextResponse.next();
  },
  {
    pages: {
      signIn: "/login",
    },
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
};
