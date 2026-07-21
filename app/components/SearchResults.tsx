import React from 'react';
import {Link} from 'react-router';
import {Image, Money, Pagination} from '@shopify/hydrogen';
import {urlWithTrackingParams, type RegularSearchReturn} from '~/lib/search';
import {JSX} from 'react/jsx-runtime';

const PRODUCT_REDIRECTS: Record<string, string> = {
  'gift-card-for-him':
    'https://pay.shopzetu.com/products/gift-card-for-him?variant=44285866082523',
  'gift-card-for-her':
    'https://pay.shopzetu.com/products/gift-card-for-her?variant=44285865558235',
  'congratulatory-gift-card':
    'https://pay.shopzetu.com/products/congratulatory-gift-card?variant=44285868114139',
};

type SearchItems = RegularSearchReturn['result']['items'];
type PartialSearchResult<ItemType extends keyof SearchItems> = Pick<
  SearchItems,
  ItemType
> &
  Pick<RegularSearchReturn, 'term'>;

type SearchResultsProps = RegularSearchReturn & {
  children: (args: SearchItems & {term: string}) => React.ReactNode;
};

export function SearchResults({
  term,
  result,
  children,
}: Omit<SearchResultsProps, 'error' | 'type'>) {
  if (!result?.total) {
    return null;
  }

  return children({...result.items, term});
}

SearchResults.Articles = SearchResultsArticles;
SearchResults.Pages = SearchResultsPages;
SearchResults.Products = SearchResultsProducts;
// SearchResults.Articles = SearchResultsArticles;
// SearchResults.Pages = SearchResultsPages;
function SearchResultsArticles({
  term,
  articles,
}: PartialSearchResult<'articles'>) {
  if (!articles?.nodes.length) {
    return null;
  }

  return (
    <div className="search-result">
      <h2 className="mb-6 text-2xl font-bold">Articles</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles?.nodes?.map((article) => {
          const articleUrl = urlWithTrackingParams({
            baseUrl: `/blogs/${article.handle}`,
            trackingParams: article.trackingParameters,
            term,
          });

          return (
            <div
              className="search-results-item border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              key={article.id}
            >
              <Link prefetch="intent" to={articleUrl} className="block">
                <h3 className="font-semibold text-lg text-blue-600 hover:text-blue-800">
                  {article.title}
                </h3>
              </Link>
            </div>
          );
        })}
      </div>
      <br />
    </div>
  );
}

function SearchResultsPages({term, pages}: PartialSearchResult<'pages'>) {
  if (!pages?.nodes.length) {
    return null;
  }

  return (
    <div className="search-result">
      <h2 className="mb-6 text-2xl font-bold">Pages</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pages?.nodes?.map((page) => {
          const pageUrl = urlWithTrackingParams({
            baseUrl: `/pages/${page.handle}`,
            trackingParams: page.trackingParameters,
            term,
          });

          return (
            <div
              className="search-results-item border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              key={page.id}
            >
              <Link prefetch="intent" to={pageUrl} className="block">
                <h3 className="font-semibold text-lg text-blue-600 hover:text-blue-800">
                  {page.title}
                </h3>
              </Link>
            </div>
          );
        })}
      </div>
      <br />
    </div>
  );
}

function SearchResultsProducts({
  term,
  products,
}: PartialSearchResult<'products'>) {
  if (!products?.nodes.length) {
    return null;
  }

  return (
    <div className="search-result mt-28">
      <h2 className="mb-6 text-2xl font-bold">Products</h2>
      <Pagination connection={products}>
        {({nodes, isLoading, NextLink, PreviousLink}) => {
          const ItemsMarkup = nodes.map((product) => {
            const productUrl = urlWithTrackingParams({
              baseUrl: `/products/${product.handle}`,
              trackingParams: product.trackingParameters,
              term,
            });
            const price = product?.selectedOrFirstAvailableVariant?.price;
            const compareAtPrice =
              product?.selectedOrFirstAvailableVariant?.compareAtPrice;
            const image = product?.selectedOrFirstAvailableVariant?.image;
            return (
              <Link
                className="search-product-item group flex flex-col"
                key={product.id}
                prefetch="intent"
                to={productUrl}
                onClick={(e) => {
                  const redirectUrl = PRODUCT_REDIRECTS[product.handle];

                  if (redirectUrl) {
                    e.preventDefault(); // stop React Router navigation
                    window.location.href = redirectUrl; // full-page redirect (same tab)
                  }
                }}
              >
                <div className=" h-fit flex justify-center items-center rounded-lg overflow-hidden  md:flex-none ">
                  {image && (
                    // <Image
                    //   data={image}
                    //  <Image data={image} alt={product.title} width={50} />
                    //   alt={product.title}
                    //   // sizes="(min-width: 45em) 300px, 100vw"
                    //   className="w-full h-full aspect-1/1 object-cover transition-transform duration-300 group-hover:scale-105 "
                    // />

                    <div className="relative group overflow-hidden rounded-md ">
                      <img
                        src={image.url}
                        alt={image.altText || product.title}
                        className="h-full w-full object-cover transform transition-transform duration-700 group-hover:scale-105"
                        style={{aspectRatio: '9/16'}}
                      />
                    </div>
                  )}
                </div>
                <div className="mt-3 flex flex-col text-center">
                  <h4 className="font-semibold line-clamp-2 text-sm md:text-base">
                    {product.vendor}
                  </h4>
                  <h4 className=" line-clamp-2 text-sm md:text-base">
                    {product.title}
                  </h4>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <small className="font-bold text-black">
                      {price && <Money data={price} />}
                    </small>
                    {compareAtPrice &&
                      parseFloat(compareAtPrice.amount) > 0 &&
                      parseFloat(compareAtPrice.amount) >
                        parseFloat(price?.amount || '0') && (
                        <small className="text-[#C20000] font-bold line-through">
                          <Money data={compareAtPrice} />
                        </small>
                      )}
                  </div>
                </div>
              </Link>
            );
          });

          // Infinite scroll logic
          const nextLinkRef = React.useRef<HTMLAnchorElement | null>(null);
          React.useEffect(() => {
            if (!nextLinkRef.current) return;
            const observer = new window.IntersectionObserver(
              (entries) => {
                if (entries[0].isIntersecting && !isLoading) {
                  nextLinkRef.current?.click();
                }
              },
              {
                root: null,
                rootMargin: '0px',
                threshold: 1.0,
              },
            );
            observer.observe(nextLinkRef.current);
            return () => {
              observer.disconnect();
            };
          }, [isLoading, nodes.length]);

          return (
            <div className="w-full">
              <div className="mb-4">
                <PreviousLink>
                  {isLoading ? (
                    'Loading...'
                  ) : (
                    <span className="text-blue-600 hover:underline">
                      ↑ Load previous
                    </span>
                  )}
                </PreviousLink>
              </div>
              <div
                className="products-grid mb-6 md:items-start"
                style={{alignItems: 'stretch'}}
              >
                {ItemsMarkup}
              </div>
              <div>
                <NextLink>
                  <a
                    ref={nextLinkRef}
                    style={{
                      display: 'block',
                      textAlign: 'center',
                      margin: '16px 0',
                    }}
                  >
                    {isLoading ? (
                      'Loading...'
                    ) : (
                      <span className="text-blue-600 hover:underline">
                        Load more ↓
                      </span>
                    )}
                  </a>
                </NextLink>
              </div>
            </div>
          );
        }}
      </Pagination>
      <br />
    </div>
  );
}

function SearchResultsEmpty() {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">🔍</div>
      <h3 className="text-xl font-semibold text-gray-700 mb-2">
        No results found
      </h3>
      <p className="text-gray-500">
        Try a different search term or check your spelling.
      </p>
    </div>
  );
}
