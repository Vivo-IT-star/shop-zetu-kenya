import {useEffect, useState} from 'react';

interface ParsedReview {
  id: string;
  rating: number;
  title?: string;
  body: string;
  reviewer?: string;
  date?: string;
  imageUrl?: string;
  productUrl?: string;
}

export default function FeaturedReviews() {
  const [html, setHtml] = useState('');
  const [reviews, setReviews] = useState<ParsedReview[]>([]);
  const [loading, setLoading] = useState(true);

  /* ---------------- FETCH HTML ---------------- */

  useEffect(() => {
    async function fetchReviews() {
      const response = await fetch('/api/judgeme-featured-reviews');
      const data: any = await response.json();
      setHtml(data.html);
      setLoading(false);
    }

    fetchReviews();
  }, []);

  /* ---------------- PARSE HTML ---------------- */

  useEffect(() => {
    if (!html) return;

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const reviewNodes = doc.querySelectorAll('.jdgm-carousel-item');

    const parsed: ParsedReview[] = Array.from(reviewNodes).map(
      (node, index) => {
        const rating = node.querySelectorAll('.jdgm-star.jdgm--on').length;

        const img = node.querySelector<HTMLImageElement>(
          '.jdgm-carousel-item__product-image',
        );

        const imageUrl =
          img?.getAttribute('data-src-retina') ||
          img?.getAttribute('data-src') ||
          undefined;

        const productLink = node.querySelector<HTMLAnchorElement>(
          '.jdgm-carousel-item__product',
        );

        const productUrl = productLink?.getAttribute('href') || undefined;

        return {
          id: `review-${index}`,
          rating,
          title:
            node
              .querySelector('.jdgm-carousel-item__review-title')
              ?.textContent?.trim() || undefined,
          body:
            node
              .querySelector('.jdgm-carousel-item__review-body')
              ?.textContent?.trim() ?? '',
          reviewer: node
            .querySelector('.jdgm-carousel-item__reviewer-name')
            ?.textContent?.trim(),
          date: node
            .querySelector('.jdgm-carousel-item__timestamp')
            ?.textContent?.trim(),
          imageUrl: imageUrl
            ? imageUrl.replace('_78x78', '_300x533')
            : undefined,
          productUrl,
        };
      },
    );

    setReviews(parsed);
  }, [html]);

  /* ---------------- RENDER ---------------- */

  return (
    <div className="mx-auto px-4 max-w-7xl">
       <div className="text-center font-bold text-2xl my-8 ">
        What Our Customers Are Saying
      </div>

      {loading && <p className='text-center'>Loading reviews…</p>}

      {!loading && (
        <ul className="flex h-[450px] md:h-[500px] gap-6 overflow-x-auto scrollbar-hide">
          {reviews.map((review) => (
            <li
              key={review.id}
              className="flex flex-col py-8 text-center min-w-48 shadow-lg  duration-500 rounded-lg bg-white"
            >
              {/* Top content */}
             <div className="flex flex-col justify-start h-full overflow-hidden">

                {/* Rating */}
                <div className="flex justify-center text-3xl text-amber-400 items-center gap-1 mb-2">
                  {Array.from({length: 5}).map((_, i) => (
                    <span key={i}>{i < review.rating ? '★' : '☆'}</span>
                  ))}
                </div>

                {/* Title */}
                {review.title && (
                  <h3 className="font-semibold mb-1">{review.title}</h3>
                )}

                {/* Body */}
                <p className="text-sm mb-2">{review.body}</p>

                {/* Reviewer */}
                {review.reviewer && (
                  <p className="text-xs text-gray-500 ">
                    — {review.reviewer}
                  </p>
                )}
              </div>

              {/* Image pinned to bottom */}
              {review.imageUrl && review.productUrl && (
                <a
                  href={review.productUrl}
                  className="-mt-12 flex justify-center items-center overflow-hidden rounded-md aspect-9/16"
                >
                  <img
                    src={review.imageUrl}
                    alt={review.reviewer || 'Product'}
                    className=" object-cover transition-transform duration-300 hover:scale-105"
                    loading="lazy"
                  />
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
