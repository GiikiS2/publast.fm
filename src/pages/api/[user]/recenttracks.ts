import axios from "axios";
import 'dotenv/config'
export const prerender = false;



export async function GET({ params, request }: { params: any, request: any }) {
  
  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', '*');

  if (!params.user) {
    return new Response(null, {
      status: 422,
      statusText: 'User missing.',
      headers: headers, // Include headers in the response
    });
  }

  const parsedUrl = new URL(request.url);

  const limit = parsedUrl.searchParams.get('limit');

  //&period=7day&limit=6
  const newUrl = new URL(`http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${params.user}&api_key=${process.env.LastKey}&format=json`)

  if (limit) {
    newUrl.searchParams.append('limit', limit);
  }
  var fetched = await axios.get(newUrl.toString())
  
  return new Response(JSON.stringify(fetched.data), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*", // Set the CORS header
    },
  });
}
