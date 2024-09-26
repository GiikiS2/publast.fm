import axios from "axios";
import 'dotenv/config';

export const prerender = false;

const cache = new Map<string, Buffer>();

async function fetchCoverArtUrl(artistName: string, trackName: string): Promise<Buffer | null> {
    const cacheKey = `${artistName.toLowerCase()}-${trackName.toLowerCase()}`;

    if (cache.has(cacheKey)) {
        console.log('Returning cached image');
        return cache.get(cacheKey)!;
    }

    const attemptFetchCoverArt = async (releaseId: string): Promise<string | null> => {
        try {
            const coverArtUrl = `https://coverartarchive.org/release/${releaseId}/front-500`;
            console.log(coverArtUrl)
            const response = await axios.get(coverArtUrl);
            return coverArtUrl;
        } catch (error) {
            if (error.response && error.response.status === 404) {
                console.warn(`Cover art not found for release ID: ${releaseId}`);
                return null;
            }
            throw error; // Rethrow if the error is not a 404
        }
    };

    function getBase64(url) {
        return axios.get(url, {
            responseType: 'arraybuffer',
            timeout: 50000, // 30 seconds
        }).then(response => Buffer.from(response.data, 'binary'))
    }

    try {
        const img = await axios.get(`https://publast-fm.vercel.app/api/${artistName}/${trackName}/info`);
        if (img.data.track && img.data.track.album) {
            const coverArtUrl = img.data.track.album.image[3]['#text'];
            const imageBuffer = await getBase64(coverArtUrl)
            cache.set(cacheKey, imageBuffer); // Cache the image buffer
            
            console.log(coverArtUrl)
            return imageBuffer;
        }

        try {
            const url = `https://musicbrainz.org/ws/2/recording/?query=artistname:${encodeURIComponent(artistName)}%20AND%20recording:${encodeURIComponent(trackName)}&fmt=json`;
            const imgResponse = await axios.get(url);
            if (imgResponse.status === 200 ) {
                
            console.log('Response data:', imgResponse.data);
            } else {
                console.error(`Request failed with status code: ${imgResponse.status}`);

        }
        
            const matchingRecording = imgResponse.data?.recordings.find((rec: any) =>
                rec.video === true &&
                rec.releases && rec.releases.length > 0
            );


            if (matchingRecording && matchingRecording.releases.length > 0) {
                const img = await attemptFetchCoverArt(matchingRecording.releases[0].id);
                if (img) {
                    var buffer
                    await axios.get(img, {
                        responseType: 'arraybuffer',
                        // timeout: 20000 // only wait for 2s
                    }).then(response => {
                        
            console.log(response.data)
                        buffer = Buffer.from(response.data, 'binary')
                        cache.set(cacheKey, buffer); // Cache the image buffer
                        // buffer;
                    })
                    // const imageBuffer2 = await getBase64(img)
                    // cache.set(cacheKey, imageBuffer2); // Cache the image buffer
                    return buffer;
                }
            }
            
            const matching = imgResponse.data.recordings.find((rec: any) =>
                rec.releases && rec.releases.length > 0
            );
            

            if (matching && matching.releases.length > 0) {
                for (const release of matching.releases) {
                    const img = await attemptFetchCoverArt(release.id);
                    if (img) {
                        var buffer
                        await axios.get(img, {
                            responseType: 'arraybuffer',
                            // timeout: 20000 // only wait for 2s
                        }).then(response => {
                            
            console.log(response.data)
                            buffer = Buffer.from(response.data, 'binary')
                            cache.set(cacheKey, buffer); // Cache the image buffer
                            // buffer;
                        })
                        // const imageBuffer2 = await getBase64(img)
                        // cache.set(cacheKey, imageBuffer2); // Cache the image buffer
                        return buffer;
                    }
                }
            }

            
        } catch (error) {
            console.error(`Error contacting musicBrainz api:`, error);
            return null;
        }
    } catch (error) {
        console.error(`Error fetching cover art:`, error);
        return null;
    }
    
        const defaultImageResponse = await axios.get('https://publast-fm.vercel.app/result.png', {
            responseType: 'arraybuffer',
        });
        return Buffer.from(defaultImageResponse.data, 'binary');
    
}

export async function GET({ params, request }: { params: any, request: any }) {
    const headers = new Headers();
    headers.set('Access-Control-Allow-Origin', '*');

    if (!params.artist || !params.track) {
        return new Response(null, {
            status: 422,
            statusText: 'Track or artist missing.',
            headers: headers,
        });
    }

    const imageBuffer = await fetchCoverArtUrl(params.artist, params.track);
console.log(imageBuffer)
    if (imageBuffer) {
        return new Response(imageBuffer, {
            status: 200,
            headers: {
                "Content-Type": "image/jpeg",
                "Access-Control-Allow-Origin": "*", // Set the CORS header
            },
        });
    } else {
        const defaultImageResponse = await axios.get('https://publast-fm.vercel.app/result.png', {
            responseType: 'arraybuffer',
        });
        return new Response(Buffer.from(defaultImageResponse.data, 'binary'), {
            status: 200,
            headers: {
                "Content-Type": "image/jpeg",
                "Access-Control-Allow-Origin": "*", // Set the CORS header
            },
        });
        return new Response('Image not found', {
            status: 404,
            headers: {
                "Content-Type": "text/plain",
                "Access-Control-Allow-Origin": "*",
            },
        });
    }
}
