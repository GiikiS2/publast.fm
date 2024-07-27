import axios from "axios";
import 'dotenv/config'
export const prerender = false;


export async function GET({ params, request }: { params: any, request: any }) {
  
  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', '*');

  if (!params.artist || !params.track) {
    return new Response(null, {
      status: 422,
      statusText: 'Track or artist missing.',
      headers: headers, // Include headers in the response
    });
  }
  
  const newUrl = new URL(`http://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=${process.env.LastKey}&artist=${params.artist}&track=${params.track}&format=json`)

  var fetched = await axios.get(newUrl.toString())

  return new Response(JSON.stringify(fetched.data), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*", // Set the CORS header
    },
  });
}

