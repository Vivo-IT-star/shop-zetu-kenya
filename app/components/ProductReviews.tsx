import {useEffect, useState} from 'react';

interface ProductReview {
  id: string;
  rating: number;
  reviewTitle?: string;
  body: string;
  author?: string;
  productTitle?: string;
  productUrl?: string;
}

export default function ProductReviews({
  productHandle,
}: {
  productHandle: string;
}) {
  const [html, setHtml] = useState('');
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);

  /* ---------------- FETCH HTML ---------------- */

  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch(
          `/api/judgeme-product-reviews?handle=${productHandle}`,
        );
        const data: any = await res.json();
        setHtml(data.html);
      } catch (e) {
        console.error('Judge.me fetch failed', e);
      } finally {
        setLoading(false);
      }
    }

    fetchReviews();
  }, [productHandle]);

  /* ---------------- PARSE HTML ---------------- */

  useEffect(() => {
    if (!html) return;

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const reviewNodes = doc.querySelectorAll('.jdgm-rev');

    const parsed: ProductReview[] = Array.from(reviewNodes).map(
      (node, index) => {
        const rating = Number(
          node
            .querySelector('.jdgm-rev__rating')
            ?.getAttribute('data-score') || 0,
        );

         const rawTitle =
        node.querySelector('.jdgm-rev__title')?.textContent?.trim() || '';


        return {
          id:
            node.getAttribute('data-review-id') ||
            `review-${index}`,
          rating,
          reviewTitle: rawTitle.length > 0 ? rawTitle : "",
          body:
            node.querySelector('.jdgm-rev__body p')
              ?.textContent?.trim() ?? '',
          author:
            node.querySelector('.jdgm-rev__author')
              ?.textContent?.trim(),
          productTitle:
            node.getAttribute('data-product-title') ||
            undefined,
          productUrl:
            node.getAttribute('data-product-url') ||
            undefined,
        };
      },
    );

    setReviews(parsed);
  }, [html]);

  /* ---------------- RENDER ---------------- */

  if (loading) {
    return <p className="text-center">Loading reviews…</p>;
  }

  if (!reviews.length) {
    return (
      <p className="text-center  text-gray-500">
        No reviews yet.
      </p>
    );
  }

  return (
    <section className="max-w-5xl mx-auto px-4 py-10">
      <h2 className="text-2xl font-semibold mb-6">
        Customer Reviews
      </h2>

      <ul className="space-y-6">
        {reviews.map((review) => (
          <li
            key={review.id}
            className="rounded-lg border p-5 bg-white"
          >
            {/* Rating */}
            {/* Stars + numeric count */}
            <div className="flex items-center  gap-2 mb-2">
              <div className="flex text-amber-400 text-lg">
                {Array.from({length: 5}).map((_, i) => (
                  <span key={i}>
                    {i < review.rating ? '★' : '☆'}
                  </span>
                ))}
              </div>
              <span className="text-sm font-medium">
                {review.rating} star review
              </span>
            </div>

             {/* Title */}
            <h3 className="font-semibold text-lg mb-1">
              {review.reviewTitle}
            </h3>

            {/* Review body */}
            <p className="text-sm mb-3">{review.body}</p>

            {/* Author */}
            {review.author && (
              <p className="text-xs text-gray-500 mb-2">
                — {review.author}
              </p>
            )}

            {/* Product link (optional) */}
            {/* {review.productTitle && review.productUrl && (
              <a
                href={review.productUrl}
                className="text-xs text-blue-600 underline"
              >
                {review.productTitle}
              </a>
            )} */}
          </li>
        ))}
      </ul>
    </section>
  );
}
