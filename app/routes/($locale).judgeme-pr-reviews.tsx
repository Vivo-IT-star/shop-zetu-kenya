// app/routes/featured-reviews.tsx
import {useEffect} from 'react';
import {useLoaderData} from 'react-router';
import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';

/* ---------------- SERVER ---------------- */
export async function loader({context}: LoaderFunctionArgs) {

  const apiUrl = `https://api.judge.me/api/v1/widgets/product_review?handle=afrodame-checked-poncho-green&shop_domain=shop-zetu-kenya.myshopify.com&api_token=dfedvgSe8k5yx0-DjK6POyjNyxY`;

 // console.log('Judge.me API URL:', apiUrl);

  const res = await fetch(apiUrl);

 console.log('Judge.me API response status:', res);

  if (!res.ok) {
    throw new Response('Failed to fetch featured reviews', {status: 500});
  }

  const data = (await res.json()) as {widget: string};

  console.log('Judge.me ROUTE WIDGET response data:', JSON.stringify(data.widget));

  return new Response(
    JSON.stringify({html: data.widget}),
    {
      headers: {'Content-Type': 'application/json'},
    }
  );
}

/* ---------------- CLIENT ---------------- */


export default function ProductReviewsPage() {
  const {html} = useLoaderData<{html: string}>();

  useEffect(() => {
    // Inject Judge.me script if not already present
    if (!document.querySelector('script[src*="judgeme.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://cdn.judge.me/assets/judgeme.js';
      script.async = true;
      script.onload = () => {
        // Initialize after script loads
        (window as any).JudgeMeInit?.();
      };
      document.body.appendChild(script);
    } else {
      // Script already loaded, just re-init
      (window as any).JudgeMeInit?.();
    }
  }, [html]); // run whenever HTML changes

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl text-center font-semibold mb-8">
        Featured Reviews
      </h1>

      <div
        className="jdgm-widget jdgm-product-reviews"
        dangerouslySetInnerHTML={{__html: html}}
      />
    </main>
  );
}
