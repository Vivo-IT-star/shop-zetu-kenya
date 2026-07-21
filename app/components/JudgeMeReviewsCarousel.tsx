import {useEffect, useState} from 'react';

export default function FeaturedJudgeMeReviews() {
  const [html, setHtml] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const response = await fetch('/api/judgeme-reviews');

        //console.log('Fetch response:', response);

        const data:any  = await response.json();

        //console.log('Fetched Judge.me reviews HTML:', data.html);

        setHtml(data.html);
      } catch (error) {
        console.error('Failed to load Judge.me reviews', error);
      } finally {
        setLoading(false);
      }
    }

    fetchReviews();
  }, []);

  useEffect(() => {
    if (!html) return;

    // Load Judge.me JS AFTER HTML is injected
    const script = document.createElement('script');
    script.src = 'https://cdn.judge.me/assets/judgeme.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [html]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      <h1 className="text-3xl text-center font-semibold mb-8">
        Featured Reviews
      </h1>

      {loading && <p>Loading reviews…</p>}

      {!loading && (
        <div
          className="jdgm-carousel-wrapper"
          dangerouslySetInnerHTML={{__html: html}}
        />
      )}
    </main>
  );
}
