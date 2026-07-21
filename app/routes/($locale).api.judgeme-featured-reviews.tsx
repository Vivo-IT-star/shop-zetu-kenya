import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';

/* ---------------- SERVER ---------------- */
export async function loader({context}: LoaderFunctionArgs) {

  const apiUrl = `https://api.judge.me/api/v1/widgets/featured_carousel?shop_domain=shop-zetu-kenya.myshopify.com&api_token=dfedvgSe8k5yx0-DjK6POyjNyxY&`;

 // console.log('Judge.me API URL:', apiUrl);

  const res = await fetch(apiUrl);

 // console.log('Judge.me API response status:', res);

  if (!res.ok) {
    throw new Response('Failed to fetch featured reviews', {status: 500});
  }

  const data = (await res.json()) as {featured_carousel: string};

 //console.log('Judge.me API response data:', JSON.stringify(data));

  return new Response(
    JSON.stringify({html: data.featured_carousel}),
    {
      headers: {'Content-Type': 'application/json'},
    }
  );
}


