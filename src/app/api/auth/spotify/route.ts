import { NextResponse } from 'next/server';

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback`;
const SCOPES = ['user-library-read'];

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const state = searchParams.get('state') || '/';

    const queryParams = new URLSearchParams({
        response_type: 'code',
        client_id: CLIENT_ID!,
        scope: SCOPES.join(' '),
        redirect_uri: REDIRECT_URI,
        state: state
    });

    return NextResponse.redirect(`https://accounts.spotify.com/authorize?${queryParams.toString()}`);
}