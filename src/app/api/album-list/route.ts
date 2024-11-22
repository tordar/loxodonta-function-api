import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const runtime = 'edge';

interface SpotifyAlbum {
    id: string;
    name: string;
    artists: { name: string }[];
    release_date: string;
    total_tracks: number;
    images: { url: string }[];
    external_urls: {
        spotify: string;
    };
}

interface SavedAlbum {
    added_at: string;
    album: SpotifyAlbum;
}

async function getSavedAlbums(accessToken: string): Promise<SavedAlbum[]> {
    let allAlbums: SavedAlbum[] = [];
    let url = 'https://api.spotify.com/v1/me/albums?limit=50';
    let totalAlbums = 0;

    while (url) {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        const data = await response.json();
        if ('error' in data) {
            throw new Error(`Failed to get saved albums: ${data.error.message}`);
        }

        allAlbums = allAlbums.concat(data.items);
        url = data.next;

        if (totalAlbums === 0) {
            totalAlbums = data.total;
        }

        console.log(`Fetched ${allAlbums.length} of ${totalAlbums} albums`);
    }

    return allAlbums;
}

export async function GET() {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('spotifyAccessToken')?.value;

    if (!accessToken) {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/spotify`);
    }

    try {
        console.log('Starting to fetch saved albums...');
        const albums = await getSavedAlbums(accessToken);
        console.log(`Finished fetching. Total albums: ${albums.length}`);

        const albumList = albums.map(item => ({
            id: item.album.id,
            name: item.album.name,
            artist: item.album.artists.map(artist => artist.name).join(', '),
            releaseDate: item.album.release_date,
            totalTracks: item.album.total_tracks,
            imageUrl: item.album.images[0]?.url,
            spotifyUrl: item.album.external_urls.spotify,
            addedAt: item.added_at,
        }));

        const finalResponse = JSON.stringify({
            totalAlbums: albumList.length,
            albums: albumList
        }, null, 2);  // Pretty print JSON

        return new Response(finalResponse, {
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache',
            },
        });
    } catch (error) {
        console.error('Error in GET /api/album-list:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}