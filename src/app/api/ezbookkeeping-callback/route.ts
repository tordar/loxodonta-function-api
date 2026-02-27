import { NextResponse } from 'next/server';

/**
 * Public callback relay for bank/Ezbookkeeping OAuth.
 * Bank redirects here (stable URL on this site); this route redirects the browser
 * to your local dev backend with the same query params (code, state).
 *
 * Configure in bank/Ezbookkeeping:
 * - Redirect URI: https://your-site.com/api/ezbookkeeping-callback
 *
 * Optional env: EZBOOKKEEPING_CALLBACK_TARGET (default: http://localhost:8080/api/bank_integration/callback)
 */
const DEFAULT_TARGET = 'http://localhost:8080/api/bank_integration/callback';

export async function GET(request: Request) {
  const targetBase =
    process.env.EZBOOKKEEPING_CALLBACK_TARGET ?? DEFAULT_TARGET;
  const url = new URL(request.url);
  const qs = url.search ? `?${url.searchParams.toString()}` : '';
  const location = `${targetBase.replace(/\?.*$/, '')}${qs}`;

  return NextResponse.redirect(location, 302);
}
