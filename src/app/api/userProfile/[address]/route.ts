// This file is intentionally left minimal to avoid type errors
// Use /api/user?address=... instead

export async function GET() {
  return new Response(JSON.stringify({ message: "This endpoint is deprecated. Please use /api/user?address= instead" }), {
    status: 301,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}