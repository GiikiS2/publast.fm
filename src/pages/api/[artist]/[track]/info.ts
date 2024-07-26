import axios from "axios";
import 'dotenv/config'
export const prerender = false;


export async function GET({ params, request }: { params: any, request: any }) {

  if (!params.artist || !params.track) {
    return new Response(null, {
      status: 422,
      statusText: 'Track or artist missing.',
    });
  }

  const parsedUrl = new URL(request.url);

  const period = parsedUrl.searchParams.get('period');
  const limit = parsedUrl.searchParams.get('limit');


  const newUrl = new URL(`http://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=${process.env.LastKey}&artist=${params.artist}&track=${params.track}&format=json`)
  if (period) {
    newUrl.searchParams.append('period', period);
  }
  if (limit) {
    newUrl.searchParams.append('limit', limit);
  }

  var fetched = await axios.get(newUrl.toString())

  return new Response(JSON.stringify(fetched.data), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

