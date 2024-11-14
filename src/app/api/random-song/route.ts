import { NextResponse } from 'next/server';

export const runtime = 'edge';

interface SpotifyArtist {
    name: string;
}

interface SpotifyAlbum {
    name: string;
    release_date: string;
}

interface SpotifyTrack {
    name: string;
    artists: SpotifyArtist[];
    album: SpotifyAlbum;
    preview_url: string | null;
    external_urls: {
        spotify: string;
    };
}

interface PlaylistTrack {
    track: SpotifyTrack;
}

async function getAccessToken() {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        throw new Error('SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET is not set');
    }

    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
    });

    const data = await response.json();
    if ('error' in data) {
        throw new Error(`Failed to get access token: ${data.error}`);
    }

    return data.access_token;
}

async function getRandomPlaylistPage(accessToken: string, playlistId: string, totalTracks: number): Promise<PlaylistTrack[]> {
    const pageSize = 100;
    const totalPages = Math.ceil(totalTracks / pageSize);
    const randomPage = Math.floor(Math.random() * totalPages) + 1;
    const offset = (randomPage - 1) * pageSize;

    const url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=${pageSize}&offset=${offset}`;

    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    });

    const data = await response.json();
    if ('error' in data) {
        throw new Error(`Failed to get playlist tracks: ${data.error.message}`);
    }
    console.log(`Page fetched: ${randomPage}`);
    return data.items;
}

export async function GET() {
    try {
        const accessToken = await getAccessToken();
        const playlistId = process.env.SPOTIFY_PLAYLIST_ID;
        const totalTracks = 3235; // Hardcoded for now, but you could fetch this dynamically

        if (!playlistId) {
            console.error('SPOTIFY_PLAYLIST_ID is not set');
            throw new Error('Spotify playlist ID is not set');
        }

        console.log(`Fetching a random page of tracks for playlist: ${playlistId}`);
        const tracks = await getRandomPlaylistPage(accessToken, playlistId, totalTracks);
        
        console.log(`Tracks fetched: ${tracks.length}`);

        if (tracks.length === 0) {
            console.log('No tracks found on this page');
            return new NextResponse(JSON.stringify({ error: 'No tracks found' }), {
                status: 404,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            });
        }

        const randomTrack = tracks[Math.floor(Math.random() * tracks.length)].track;

        if (!randomTrack) {
            console.error('Failed to get track information');
            return new NextResponse(JSON.stringify({ error: 'Failed to get track information' }), {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            });
        }

        const songInfo = {
            name: randomTrack.name,
            artist: randomTrack.artists.map(artist => artist.name).join(', '),
            album: randomTrack.album.name,
            releaseDate: randomTrack.album.release_date,
            previewUrl: randomTrack.preview_url,
            spotifyUrl: randomTrack.external_urls.spotify,
        };

        console.log('Successfully fetched random song:', songInfo.name);
        return new NextResponse(JSON.stringify(songInfo), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });
    } catch (error) {
        console.error('Error in GET /api/random-song:', error);
        return new NextResponse(
            JSON.stringify({ error: error instanceof Error ? error.message : 'An unknown error occurred' }),
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            }
        );
    }
}

export async function OPTIONS(request: Request) {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}