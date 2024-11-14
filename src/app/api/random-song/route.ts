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
    if (data.error) {
        throw new Error(`Failed to get access token: ${data.error}`);
    }

    return data.access_token;
}


async function getAllPlaylistTracks(accessToken: string, playlistId: string) {
    let tracks: PlaylistTrack[] = [];
    let url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=100`;

    while (url) {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        const data = await response.json();
        if (data.error) {
            throw new Error(`Failed to get playlist tracks: ${data.error.message}`);
        }

        tracks = tracks.concat(data.items);
        url = data.next;
    }

    return tracks;
}


export async function GET() {
    try {
        const accessToken = await getAccessToken();

        const playlistId = process.env.SPOTIFY_PLAYLIST_ID;
        
        if (!playlistId) {
            console.error('SPOTIFY_PLAYLIST_ID is not set');
            throw new Error('Spotify playlist ID is not set');
        }

        console.log(`Fetching tracks for playlist: ${playlistId}`);
        const tracks = await getAllPlaylistTracks(accessToken, playlistId);

        if (tracks.length === 0) {
            console.log('The playlist is empty');
            return NextResponse.json({ error: 'The playlist is empty' }, { status: 404 });
        }
        
        console.log(tracks.length)
        const randomTrack = tracks[Math.floor(Math.random() * tracks.length)].track;

        if (!randomTrack) {
            console.error('Failed to get track information');
            return NextResponse.json({ error: 'Failed to get track information' }, { status: 500 });
        }

        const songInfo = {
            name: randomTrack.name,
            artist: randomTrack.artists.map((artist: { name: string }) => artist.name).join(', '),
            album: randomTrack.album.name,
            releaseDate: randomTrack.album.release_date,
            previewUrl: randomTrack.preview_url,
            spotifyUrl: randomTrack.external_urls.spotify,
        };

        console.log('Successfully fetched random song:', songInfo.name);
        return NextResponse.json(songInfo);
    } catch (error) {
        console.error('Error in GET /api/random-song:', error);
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
    }
}