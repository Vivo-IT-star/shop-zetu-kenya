// app/routes/featured-reviews.tsx
import {useEffect} from 'react';
import {useLoaderData} from 'react-router';
import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';

/* ---------------- SERVER ---------------- */
export async function loader({context}: LoaderFunctionArgs) {

  const apiUrl = `https://api.judge.me/api/v1/widgets/featured_carousel?shop_domain=shop-zetu-kenya.myshopify.com&api_token=dfedvgSe8k5yx0-DjK6POyjNyxY`;

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

/* ---------------- CLIENT ---------------- */
export default function FeaturedReviewsPage() {
  const {html} = useLoaderData<{html: string}>();

  useEffect(() => {
    // Load Judge.me JS to activate carousel functionality
    const script = document.createElement('script');
    script.src = 'https://cdn.judge.me/assets/judgeme.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl text-center font-semibold mb-8">
        Featured Reviews
      </h1>

      <div
        className="jdgm-carousel-wrapper"
        dangerouslySetInnerHTML={{__html: html}}
      />
    </main>
  );
}
