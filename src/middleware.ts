
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// The list of admin wallets is now handled in the API routes directly
// We're keeping middleware simple for now

export async function middleware(_request: NextRequest) {
  // We're removing the admin routes protection in middleware
  // The page will be accessible, but functionality will be restricted in the component
  
  return NextResponse.next();
}

// Configure which routes this middleware runs on
export const config = {
  matcher: ['/admin/:path*'],
};
