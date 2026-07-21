import React from 'react';
import {cn} from '../lib/utils';
import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';

// === Tasteful Product Display ===
// Same product logic as TopDealsProductsCarousel, presented as a clean,
// responsive editorial grid instead of a horizontal carousel.
export const TastefulProductDisplay = ({
  products,
  title = 'Curated For You',
  description = 'A handpicked edit — refined, ready, and worth a closer look.',
  ctaLabel = 'Shop The Edit',
  ctaLink = '/collections/pb-best-sellers',
  className,
}: any) => {
  return (
    <div className={cn('max-w-7xl mx-auto mt-12 md:mt-16 px-4', className)}>
      {/* Section header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8 md:mb-10">
        <div className="max-w-xl">
          <h2 className="text-4xl md:text-7xl font-serif mb-3">{title}</h2>
          <p className="text-sm text-neutral-600 max-w-md">{description}</p>
        </div>

        <Link to={ctaLink} className="shrink-0">
          <button className="bg-lime-500 cursor-pointer text-black font-bold px-8 py-3 hover:bg-black hover:text-white transition-colors w-full md:w-auto">
            {ctaLabel}
          </button>
        </Link>
      </div>

      {/* Responsive product grid */}
      <ul className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
        {products?.map((product: any, idx: number) => (
          <li key={idx} className="group">
            <Link
              to={`/products/${product.handle}`}
              className="flex flex-col h-full"
            >
              <div className="relative overflow-hidden rounded-md bg-neutral-100">
                <Image
                  src={product.image.url}
                  alt={product.image.altText || product.title}
                  sizes="(min-width: 1280px) 16vw, (min-width: 1024px) 20vw, (min-width: 640px) 25vw, 33vw"
                  className="h-full w-full object-cover aspect-9/16 transform transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />

                {/* DISCOUNT BADGE */}
                {product.compareAtPrice &&
                  parseFloat(product.compareAtPrice) >
                    parseFloat(product.price) && (
                    <span className="absolute top-2 right-2 bg-red-600 text-white text-[8px] md:text-xs font-semibold px-2 py-1 rounded-full shadow-md">
                      {Math.round(
                        ((parseFloat(product.compareAtPrice) -
                          parseFloat(product.price)) /
                          parseFloat(product.compareAtPrice)) *
                          100,
                      )}
                      % OFF
                    </span>
                  )}
              </div>

              <div className="p-2 space-y-1 flex flex-col items-center text-center">
                <h3 className="font-semibold line-clamp-1 text-xs md:text-sm">
                  {product.title}
                </h3>
                <div className="flex items-center gap-2">
                  <div className="font-bold text-xs md:text-sm">
                    KES {parseFloat(product.price).toLocaleString()}
                  </div>
                  {product.compareAtPrice &&
                    product.compareAtPrice > 0 && (
                      <span className="text-xs text-red-500 line-through">
                        KES{' '}
                        {parseFloat(product.compareAtPrice).toLocaleString()}
                      </span>
                    )}
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};
