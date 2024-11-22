import { NextResponse } from 'next/server';

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback`;
const SCOPE = 'user-library-read';

export async function GET() {
    if (!CLIENT_ID) {
        console.error('SPOTIFY_CLIENT_ID is not set');
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const queryParams = new URLSearchParams({
        response_type: 'code',
        client_id: CLIENT_ID,
        scope: SCOPE,
        redirect_uri: REDIRECT_URI,
    });

    return NextResponse.redirect(`https://accounts.spotify.com/authorize?${queryParams.toString()}`);
}