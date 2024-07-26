import axios from "axios";
import 'dotenv/config'
export const prerender = false;



export async function GET({ params }: { params: any }) {

  if (!params.user) {
    return new Response(null, {
      status: 422,
      statusText: 'User missing.',
    });
  }

  var fetched = await axios.get(`https://ws.audioscrobbler.com/2.0/?method=user.gettoptracks&user=${params.user}&api_key=${process.env.LastKey}&format=json`) //&period=7day&limit=6

  return new Response(JSON.stringify(fetched.data), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
