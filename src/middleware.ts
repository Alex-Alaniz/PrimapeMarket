
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Admin wallet addresses - keep this list in sync with the API route
const ADMIN_WALLETS = [
  "0x1a5b5a2ff1f70989e186ac6109705cf2ca327158",
  // Add more wallet addresses to ensure access
  "*", // Temporary wildcard to allow all wallet addresses for testing
  // Add more as needed
];

export async function middleware(request: NextRequest) {
  // Only apply this middleware to admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // For API routes, the validation happens in the route handler
    if (request.nextUrl.pathname.startsWith('/api/admin')) {
      return NextResponse.next();
    }
    
    // For admin pages, check if the user has a wallet cookie or session
    // This is a basic check - the actual auth happens in the page component
    // This middleware just provides an early redirect for obvious non-admin access
    
    // In a real implementation, you would check for authentication tokens
    // and validate them here. Since we can't access the Thirdweb session easily
    // in middleware, we'll do a basic check and let the page component 
    // handle the full auth logic.
    
    const referer = request.headers.get('referer');
    const hasSession = request.cookies.has('thirdweb_auth_token') || 
                       request.cookies.has('thirdweb_auth') ||
                       referer?.includes('/profile');
    
    if (!hasSession) {
      // If no session detected, redirect to home page
      return NextResponse.redirect(new URL('/', request.url));
    }
  }
  
  return NextResponse.next();
}

// Configure which routes this middleware runs on
export const config = {
  matcher: ['/admin/:path*'],
};
