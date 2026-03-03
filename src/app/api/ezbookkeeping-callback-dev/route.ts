import { NextResponse } from 'next/server';

const TARGET = process.env.EZBOOKKEEPING_DEV_TARGET ?? 'http://localhost:8080/api/bank_integration/callback';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const qs = url.search ? `?${url.searchParams.toString()}` : '';
  const location = `${TARGET.replace(/\?.*$/, '')}${qs}`;
  return NextResponse.redirect(location, 302);
}
