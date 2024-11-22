import { NextResponse } from 'next/server';

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback`;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state') || '/';

    if (!code) {
        return NextResponse.redirect(`${BASE_URL}/error?message=Missing+authorization+code`);
    }

    if (!CLIENT_ID || !CLIENT_SECRET) {
        console.error('SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET is not set');
        return NextResponse.redirect(`${BASE_URL}/error?message=Server+configuration+error`);
    }

    try {
        const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                redirect_uri: REDIRECT_URI,
            }),
        });

        const tokenData = await tokenResponse.json();

        if (!tokenResponse.ok) {
            console.error('Token response error:', tokenData);
            return NextResponse.redirect(`${BASE_URL}/error?message=${encodeURIComponent(tokenData.error)}`);
        }

        const redirectUrl = `${BASE_URL}${state}`;
        const response = NextResponse.redirect(redirectUrl);
        response.cookies.set('spotifyAccessToken', tokenData.access_token, {
            httpOnly: true,
            maxAge: tokenData.expires_in,
            path: '/',
        });
        response.cookies.set('spotifyRefreshToken', tokenData.refresh_token, {
            httpOnly: true,
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Error in callback:', error);
        return NextResponse.redirect(
            `${BASE_URL}/error?message=${encodeURIComponent('An unexpected error occurred')}`
        );
    }
}