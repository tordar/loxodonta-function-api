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
    // First, get the total count and first batch
    const firstResponse = await fetch('https://api.spotify.com/v1/me/albums?limit=50', {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    });

    const firstData = await firstResponse.json();
    if ('error' in firstData) {
        throw new Error(`Failed to get saved albums: ${firstData.error.message}`);
    }

    const totalAlbums = firstData.total;
    const totalPages = Math.ceil(totalAlbums / 50);
    
    console.log(`Total albums: ${totalAlbums}, Total pages: ${totalPages}`);

    // If only one page, return immediately
    if (totalPages === 1) {
        return firstData.items;
    }

    // Create array of all page URLs
    const pageUrls: string[] = [];
    for (let i = 1; i < totalPages; i++) {
        pageUrls.push(`https://api.spotify.com/v1/me/albums?limit=50&offset=${i * 50}`);
    }

    const batchSize = 10; // Process 10 pages at a time
    const allAlbums: SavedAlbum[] = [...firstData.items];
    
    for (let i = 0; i < pageUrls.length; i += batchSize) {
        const batch = pageUrls.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (url) => {
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });
            const data = await response.json();
            if ('error' in data) {
                throw new Error(`Failed to get saved albums: ${data.error.message}`);
            }
            return data.items;
        });

        const batchResults = await Promise.all(batchPromises);
        for (const items of batchResults) {
            allAlbums.push(...items);
        }

        console.log(`Fetched ${allAlbums.length} of ${totalAlbums} albums (batch ${Math.floor(i / batchSize) + 1})`);
        
        // Small delay between batches to respect rate limits
        if (i + batchSize < pageUrls.length) {
            await new Promise(resolve => setTimeout(resolve, 10));
        }
    }

    return allAlbums;
}

export async function GET(request: Request) {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('spotifyAccessToken')?.value;

    if (!accessToken) {
        const currentUrl = new URL(request.url);
        const encodedReturnUrl = encodeURIComponent(currentUrl.pathname + currentUrl.search);
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/spotify?state=${encodedReturnUrl}`);
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

        return NextResponse.json({
            totalAlbums: albumList.length,
            albums: albumList
        }, {
            headers: {
                'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
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