import type {ActionFunctionArgs} from '@shopify/remix-oxygen';

export async function action({request}: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', {status: 405});
  }

  const body: any = await request.json();

  //console.log('Received review submission:', body);
  //console.log('Product Picture:', body.picture_urls);

  const payload = {
    shop_domain: 'shop-zetu-kenya.myshopify.com',
    platform: 'shopify',
    id: body.id,
    email: body.email,
    name: body.name,
    rating: body.rating,
    title: body.title,
    body: body.body,
    picture_urls: body.picture_urls,
  };

  //console.log('Server Side review payload to Judge.me:', payload);

  const res = await fetch('https://api.judge.me/api/v1/reviews', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Only required if Judge.me dashboard gives you a token
      // 'Authorization': `Bearer ${process.env.JUDGEME_API_TOKEN}`,
    },
    body: JSON.stringify(payload),
  });

  //console.log('Judge.me submission response status:', res);

  if (!res.ok) {
    const text = await res.text();
    console.error('Judge.me error:', text);

    return new Response(
      JSON.stringify({error: 'Judge.me submission failed'}),
      {status: 500}
    );
  }

  return new Response(JSON.stringify({success: true}), {
    headers: {'Content-Type': 'application/json'},
  });
}
