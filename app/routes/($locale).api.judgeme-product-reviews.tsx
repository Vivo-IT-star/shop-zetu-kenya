import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';

/* ---------------- SERVER ---------------- */
export async function loader({request,context}: LoaderFunctionArgs) {

  const url = new URL(request.url);

   const productHandle = url.searchParams.get('handle');
   //console.log('Judge.me API PRODUCT REVIEWS request for product handle:', productHandle);
  if (!productHandle) {
    throw new Response('Missing product handle', {status: 400});
  }

  const apiUrl = `https://api.judge.me/api/v1/widgets/product_review?handle=${productHandle}&shop_domain=shop-zetu-kenya.myshopify.com&api_token=dfedvgSe8k5yx0-DjK6POyjNyxY&`;

 // console.log('Judge.me API URL:', apiUrl);

  const res = await fetch(apiUrl);

  

 // console.log('Judge.me API response status:', res);

  if (!res.ok) {
    throw new Response('Failed to fetch featured reviews', {status: 500});
  }

  const data = (await res.json()) as {widget: string};

 //console.log('Judge.me API PRODUCT REVIEWS response data:', JSON.stringify(data));

  return new Response(
    JSON.stringify({html: data.widget}),
    {
      headers: {'Content-Type': 'application/json'},
    }
  );
}


