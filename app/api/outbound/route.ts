import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get('url');
  const id = searchParams.get('id');

  if (!url) {
    return new NextResponse('Missing URL', { status: 400 });
  }

  // Mock Analytics: Log the outbound click
  console.log(`[Analytics] Outbound click for product ID: ${id} -> ${url}`);

  // Perform the redirect
  return NextResponse.redirect(url, 302);
}