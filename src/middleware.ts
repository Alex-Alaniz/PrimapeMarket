
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
  // We're removing the admin routes protection in middleware
  // The page will be accessible, but functionality will be restricted in the component
  
  return NextResponse.next();
}

// Configure which routes this middleware runs on
export const config = {
  matcher: ['/admin/:path*'],
};
