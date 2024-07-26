import axios from "axios";
import 'dotenv/config'
export const prerender = false;



export async function GET({ params, request }: { params: any, request: any }) {

  if (!params.user) {
    return new Response(null, {
      status: 422,
      statusText: 'User missing.',
    });
  }

  const parsedUrl = new URL(request.url);

  const period = parsedUrl.searchParams.get('period');
  const limit = parsedUrl.searchParams.get('limit');

  //&period=7day&limit=6
  const newUrl = new URL(`https://ws.audioscrobbler.com/2.0/?method=user.gettoptracks&user=${params.user}&api_key=${process.env.LastKey}&format=json`)
  if (period) {
    newUrl.searchParams.append('period', period);
  }
  if (limit) {
    newUrl.searchParams.append('limit', limit);
  }
  var fetched = await axios.get(newUrl.toString())
  
  return new Response(JSON.stringify(fetched.data), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
