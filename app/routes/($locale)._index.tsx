import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {
  Await,
  useLoaderData,
  Link,
  type MetaFunction,
  NavLink,
} from 'react-router';
import {Suspense} from 'react';
import {Image, Money} from '@shopify/hydrogen';
import type {CollectionFragment} from 'storefrontapi.generated';
import {ProductItem} from '~/components/ProductItem';
import HeroSlider from '~/components/HomeHeroSlider';
import {InfiniteTestimonials} from '~/components/infinite-scroll-testimonials';
import React, {useEffect, useRef, useState} from 'react';
import {InfiniteScrollingCollections} from '~/components/infinite-scroll-collection';
import {InfiniteScrollingProducts} from '~/components/infinite-scroll-products';
import {GiClick} from 'react-icons/gi';
import BlackNovemberTimer from '~/components/CountDownTimer';
import BlackNovemberCountdownPage from '../components/BlackNovemberCountdownPage';

import {FlashSaleProductsCarousel} from '~/components/FlashSaleCarouselProducts';
import {TopDealsProductsCarousel} from '~/components/TopDealsProducts';
import {TastefulProductDisplay} from '~/components/TastefulProductDisplay';
import FeaturedJudgeMeReviews from '~/components/JudgeMeReviewsCarousel';
import FeaturedReviewsPage from './($locale).featured-reviews';
import FeaturedReviews from '~/components/FeaturedReviews';
import Footer from '~/components/CustomFooter';

const testimonials = [
  {
    avatar: '/zola-light-men.webp',
    name: 'Robert Mwangi',
    quote: 'Such a Great fit and durable quality.',
    product: "Men's Polo Shirt - Blue",
    stars: 5,
  },
  {
    avatar: '/zola-mens-polo.webp',
    name: 'Bill Clinton',
    quote: 'Worth every cent.',
    product: "Men's Polo Shirt - Purple",
    stars: 4,
  },
  {
    avatar: '/white1.webp',
    name: 'Grace Otieno',
    quote: 'Fast delivery and amazing quality. Will shop again.',
    product: 'Vivo Waridi Sleeveless Overcoat - Black',
    stars: 5,
  },
  {
    avatar: '/darkmustard1.webp',
    name: 'Lilian Asiro',
    quote: 'Fabric that loves you back.',
    product: 'Vivo Basic Sienna Waterfall Dress - Mustard',
    stars: 4,
  },
  {
    avatar: '/darkmustard1.webp',
    name: 'Lilian Asiro',
    quote: 'Fabric that loves you back.',
    product: 'Vivo Basic Sienna Waterfall Dress - Mustard',
    stars: 4,
  },
  {
    avatar: '/darkmustard1.webp',
    name: 'Lilian Asiro',
    quote: 'Fabric that loves you back.',
    product: 'Vivo Basic Sienna Waterfall Dress - Mustard',
    stars: 4,
  },
  {
    avatar: '/darkmustard1.webp',
    name: 'Lilian Asiro',
    quote: 'Fabric that loves you back.',
    product: 'Vivo Basic Sienna Waterfall Dress - Mustard',
    stars: 4,
  },
  {
    avatar: '/zola-light-men.webp',
    name: 'Robert Mwangi',
    quote: 'Such a Great fit and durable quality.',
    product: "Men's Polo Shirt - Blue",
    stars: 5,
  },
  {
    avatar: '/zola-light-men.webp',
    name: 'Robert Mwangi',
    quote: 'Such a Great fit and durable quality.',
    product: "Men's Polo Shirt - Blue",
    stars: 5,
  },
  {
    avatar: '/zola-light-men.webp',
    name: 'Robert Mwangi',
    quote: 'Such a Great fit and durable quality.',
    product: "Men's Polo Shirt - Blue",
    stars: 5,
  },
  {
    avatar: '/zola-light-men.webp',
    name: 'Robert Mwangi',
    quote: 'Such a Great fit and durable quality.',
    product: "Men's Polo Shirt - Blue",
    stars: 5,
  },
];

export const meta: MetaFunction = () => {
  return [{title: 'Vivo Fashion Group | Home'}];
};

export async function loader(args: LoaderFunctionArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  // Fetch blogs and articles for homepage preview
  const blogsResponse = await args.context.storefront.query(`#graphql
    query HomeBlogs {
      blogs(first: 5) {
        nodes {
          id
          title
          handle
          articles(first: 10, sortKey: PUBLISHED_AT, reverse: true) {
            nodes {
              id
              title
              handle
              publishedAt
              image { url altText }
            }
          }
        }
      }
    }
  `);
  const blogs = blogsResponse.blogs?.nodes ?? [];
  // Flatten all articles from all blogs
  const allArticles = blogs.flatMap(
    (blog: any) =>
      blog.articles?.nodes?.map((article: any) => ({
        ...article,
        blogHandle: blog.handle,
        blogTitle: blog.title,
        image: article.image ?? null,
      })) ?? [],
  );
  // Sort by publishedAt descending
  const sortedArticles = allArticles.sort(
    (a: {publishedAt: string}, b: {publishedAt: string}) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
  const top2Articles = sortedArticles.slice(0, 3);

  return {...deferredData, ...criticalData, top2Articles};
}

async function fetchAllCollections(context: LoaderFunctionArgs['context']) {
  let hasNextPage = true;
  let after: string | null = null;
  let allCollections: any[] = [];

  while (hasNextPage) {
    const response: {
      collections: {
        nodes: any[];
        pageInfo: {
          hasNextPage: boolean;
          endCursor: string | null;
        };
      };
    } = await context.storefront.query(ALL_COLLECTIONS_QUERY, {
      variables: {
        first: 250,
        after,
      },
    });

    const collections = response.collections.nodes;
    allCollections.push(...collections);

    hasNextPage = response.collections.pageInfo.hasNextPage;
    after = response.collections.pageInfo.endCursor;
  }

  return allCollections;
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context}: LoaderFunctionArgs) {
  // const allCollections = await fetchAllCollections(context);

  const data = await context.storefront.query(
    XMASS_COLLECTIONS_BY_HANDLE_QUERY,
  );

  const newInCollectionsData = await context.storefront.query(
    NEWIN_COLLECTIONS_BY_HANDLE_QUERY,
  );

  const valentinesData = await context.storefront.query(
    VALENTINES_COLLECTIONS_BY_HANDLE_QUERY,
  );

  // Convert aliased fields into an array
  const xmasCollections = Object.values(data).filter(Boolean);
  const newInCollections = Object.values(newInCollectionsData).filter(Boolean);
  const valentinesCollections = Object.values(valentinesData).filter(Boolean);

  async function fetchProductsByHandles(
    context: LoaderFunctionArgs['context'],
    handles: string[],
  ) {
    const query = buildProductByHandleQuery(handles);
    const response = await context.storefront.query(query);

    const products = Object.values(response).filter(Boolean); // Flatten alias keys to array
    // Log the *entire* structure to see if any productByHandle is null
    // console.log('Full Shopify response:', JSON.stringify(response, null, 2));

    // console.log(`Fetched products by handles:`, products);

    return products;
  }

  // Best Sellers — real Vivo Woman Uganda best-selling products
  const topDealsProductHandles = [
    'vivo-basic-leggings-black-1',
    'sienna-waterfall-black',
    'vivo-upe-wide-leg-pants-black',
    'vivo-dua-jacket-black',
    'vivo-panelled-leisure-pants-black',
    'vivo-rema-straight-leg-pants-navy-copy-1',
    'vivo-basic-bodycon-black-black',
    'vivo-basic-leggings-black',
    'vivo-val-cap-sleeve-top-white',
    'vivo-basic-straight-leg-pants-black',
    'vivo-waridi-pencil-skirt-black',
    'vivo-basic-leggings-navy-blue',
  ];

  // On Sale — products from the Uganda New Sale collection
  const FlashSaleProductHandles = [
    'vivo-dua-shirt-dusty-pink',
    'safari-hawi-cargo-pants-black',
    'vivo-hanabi-drop-shoulder-dress-grey-koto-print',
    'vivo-basic-double-layered-wrap-poncho-dark-gree',
    'vivo-dua-shirt-hunters-green',
    'vivo-sani-long-sleeve-v-neck-ruffle-top-dark-taupe',
    'vivo-dali-panel-wide-leg-pants-black-1',
    'vivo-basic-satin-bishop-sleeved-top-peach-black-print',
    'vivo-zawadi-shift-dress-pink-print',
    'safari-lira-front-panelled-shirt-dress-orange',
    'vivo-basic-palazzo-pants-hunters-green',
    'vivo-ziwa-long-sleeve-ruffle-kimono-mustard-off-white-zuri-abstract-print',
  ];

  // JUST IN — newest Vivo Woman Uganda arrivals (one row = 6 on desktop)
  const NewInProductHandles = [
    'safari-naledi-wrap-top-in-cotton-olive',
    'vivo-sierra-maxi-dress-in-chiffon-light-green-hunters-arah-print',
    'vivo-ruched-maxi-top-in-textured-satin-dark-red',
    'vivo-diella-v-neck-jumpsuit-in-crepe-dark-green',
    'safari-by-vivo-short-trench-coat-in-kitenge-taiyo-print',
    'safari-by-vivo-samira-maxi-dress-in-cotton-lilac',
  ];

  const spotlightProductHandles = [
    'silk-house-collection-rana-pant-blue-abstract-print',
    'lizola-asiro-bodycon-dress-purple',
    'afriwia-tamarind-silk-skirt-black',
    'safari-long-sleeve-waterfall-white',
    'vintlyne-shira-shift-dress-blue',
    'plainchic-babra-skater-dress-burnt-orange',
    'afriwia-imani-jumpsuit-ankara',
    'elan-cocoafrike-panelope-two-piece-set-rust',
    'african-yuva-baobab-dress-black',
    'julz-racer-sneakers-brown',
    'vivo-hadiya-tie-maxi-dress-brown-black-luwe-print',
    'timyt-urban-wear-the-cozy-code-double-layered-set-hoddie-pant-light-grey',
    'afriwia-aura-shift-dress-black',
    'silk-house-collection-rosa-top-burnt-orange',
    'julz-duke-black-wedges-sandal-black',
    'julz-sage-boot-tan',
    'vivo-seli-maxi-dress-green-cream-print',
  ];

  const spotlightProducts = await fetchProductsByHandles(
    context,
    spotlightProductHandles,
  );

  const newInProducts = await fetchProductsByHandles(
    context,
    NewInProductHandles,
  );

  const topDealsProducts = await fetchProductsByHandles(
    context,
    topDealsProductHandles,
  );

  const flashSaleProducts = await fetchProductsByHandles(
    context,
    FlashSaleProductHandles,
  );

  return {
    xmasCollections,
    newInCollections,
    valentinesCollections,
    spotlightProducts,
    topDealsProducts,
    flashSaleProducts,
    newInProducts,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: LoaderFunctionArgs) {
  const recommendedProducts = context.storefront
    .query(RECOMMENDED_PRODUCTS_QUERY)
    .catch((error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });

  return {
    recommendedProducts,
  };
}

// function buildProductByHandleQuery(handles: string[]) {
//   const queryFields = handles
//     .map(
//       (handle, idx) => `
//       product${idx}: productByHandle(handle: "${handle}") {
//         id
//         title
//         handle
//         featuredImage {
//           id
//           url
//           altText
//           width
//           height
//         }

//         priceRange {
//           minVariantPrice {
//             amount
//             currencyCode
//           }
//         }
//         variants(first: 12) {
//           nodes {
//             availableForSale

//           }
//         }
//       }
//     `,
//     )
//     .join('\n');

//   return `#graphql
//     query FetchSpecificProducts {
//       ${queryFields}
//     }
//   `;
// }

function buildProductByHandleQuery(handles: string[]) {
  const queryFields = handles
    .map(
      (handle, idx) => `
      product${idx}: productByHandle(handle: "${handle}") {
        id
        title
        handle
        featuredImage {
          id
          url
          altText
          width
          height
        }
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
          maxVariantPrice {
            amount
            currencyCode
          }
        }
        variants(first: 12) {
          nodes {
            id
            title
            availableForSale
            price {
              amount
              currencyCode
            }
            compareAtPrice {
              amount
              currencyCode
            }
          }
        }
      }
    `,
    )
    .join('\n');

  return `#graphql
    query FetchSpecificProducts {
      ${queryFields}
    }
  `;
}

export default function Homepage() {
  const data = useLoaderData<typeof loader>();
  const xmasCollections = data.xmasCollections;
  const newInCollections = data.newInCollections;
  const valentinesCollections = data.valentinesCollections;
  // console.log('Homepage data:', data);
  const monthlyThemeHandles = [
    '✨-the-social-calendar',
    '🌊-coastin',
    '🛋-couch-couture',
    '⏰-the-daily-spin',
  ];

  // const orderedMonthlyThemes = monthlyThemeHandles
  //   .map((handle) =>
  //     data.fetchedCollections.find((c: any) => c.handle === handle),
  //   )
  //   .filter(Boolean);

  // Partner brands — Vivo Woman Uganda's own brand collections
  const spotlightCollectionHandles = ['vivo', 'safari', 'zoya'];

  // These brand collections have no collection image, so fall back to the
  // first product image in the collection for the tile.
  const firstProductImage = (collection: any) => {
    const nodes = collection?.products?.nodes || [];
    const withImg = nodes.find((n: any) => n?.featuredImage);
    return withImg?.featuredImage;
  };

  const slidingSpotlightCollections = spotlightCollectionHandles
    .map((handle) =>
      data.newInCollections.find((c: any) => c.handle === handle),
    )
    .filter(Boolean)
    .map((collection: any) => ({
      ...collection,
      image: collection.image ??
        firstProductImage(collection) ?? {
          id: '',
          url: '',
          altText: '',
          width: 0,
          height: 0,
        }, // Provide a fallback image object if missing
    }));

  const topCategoryHandles = [
    'pb-workwear',
    'back-to-basics-1',
    'athleisure-wear',
    'neutral-ground',
  ];

  const partnerBrandsCollectionHandles = ['partner-brands'];

  // const orderedTopCategories = topCategoryHandles
  //   .map((handle) =>
  //     data.fetchedCollections.find((c: any) => c.handle === handle),
  //   )
  //   .filter(Boolean);

  return (
    <div className="home">
      <div className="mb-2">
        <Link to="/collections/xmas-collection">
          {/* Desktop Strip Banner Image */}

          {/* { <Image
            src="https://cdn.shopify.com/s/files/1/0621/5162/2875/files/Hero_Banner_Web_c83a9e4f-dd9b-47b6-873e-dbfd7b4fbbb7.jpg?v=1764765309"
            alt="black-november-launch-strip-banner"
            className="hidden md:block w-full"
            sizes="100vw"
            loading='eager'
          /> } */}
          {/* 
          Mobile Strip Banner Image */}
          {/* {<Image
            src="https://cdn.shopify.com/s/files/1/0621/5162/2875/files/Hero_Banner_Mobile-1.jpg?v=1764765309"
            alt="black-november-lights-off-strip-banner mobile"
            className="block md:hidden w-full"
            sizes="(min-width: 45em) 300px, 100vw"
            loading='eager'
          /> } */}
        </Link>
      </div>

      <div className="mt-38 md:mt-48">
        <HeroSlider />
      </div>

      {/* <FlashSaleProductsCarousel products={
        data.spotlightProducts.map((product: any) => ({
          id: product.id,
          title: product.title,
          handle: product.handle,
          image: product.featuredImage ?? {
            id: '',
            url: '',
            altText: '',
            width: 0,
            height: 0,
          },
          price: `${product.priceRange?.minVariantPrice?.amount ?? '0.00'}`,
        }))
      } />   */}

      {/* <div className="flex flex-col items-center mx-8 justify-center mt-12 ">
        <div className="text-center text-white font-semibold text-2xl ">
          EXPLORE OUR JANUARY CATEGORIES
        </div>

        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4 my-12 justify-items-center lg:mx-8">
          {orderedTopCategories.map((collection: any) => (
            <FeaturedCollection key={collection.id} collection={collection} />
          ))}
        </div>
      </div> */}

      <div className="flex flex-col items-center mx-8 justify-center mt-12 ">
        <div className="text-center font-semibold text-2xl ">
          EXPLORE OUR JULY TOP CATEGORIES
        </div>

        <div className="grid grid-cols-2 mt-8  lg:grid-cols-4 gap-6">
          {xmasCollections.filter(Boolean).map((collection: any) => (
            <FeaturedCollection key={collection.id} collection={collection} />
          ))}
        </div>
      </div>

      {/* <div className="flex flex-col items-center mx-8 justify-center mt-12 ">
        <div className="text-center font-semibold text-2xl ">
          VALENTINE'S DAY SHOP
        </div>

        <div className="grid grid-cols-2 mt-8  lg:grid-cols-4 gap-6">
          {valentinesCollections.filter(Boolean).map((collection: any) => (
            <ValentinesFeaturedCollection key={collection.id} collection={collection} />
          ))}
        </div>
      </div> */}

      {/* <div className="text-center text-white  font-semibold text-lg lg:text-2xl ">
        FEATURED PRODUCTS
      </div>

      <InfiniteScrollingProducts
        products={data.spotlightProducts.map((product: any) => ({
          id: product.id,
          title: product.title,
          handle: product.handle,
          image: product.featuredImage ?? {
            id: '',
            url: '',
            altText: '',
            width: 0,
            height: 0,
          },
          price: `${product.priceRange?.minVariantPrice?.amount ?? '0.00'}`,
        }))}
        direction="left"
        speed="slow"
        pauseOnHover={true}
      /> */}

      <div className="mt-12">
        <Link to={'/collections/zetu-gift-cards'}>
          {/* Desktop Strip Banner Image */}
          <Image
            src="https://cdn.shopify.com/s/files/1/0621/5162/2875/files/Hero_Banner_Web_copy_2_3e36282d-6d46-4966-b41c-251c49bcb9d2.jpg?v=1712125324"
            alt="black-november-launch-strip-banner"
            className="hidden md:block w-full"
            sizes="100vw"
            loading="eager"
          />
          {/* 
          Mobile Strip Banner Image */}
          {
            <img
              src="https://cdn.shopify.com/s/files/1/0621/5162/2875/files/Hero_Banner_Mobile_copy_5f3e54a9-cadf-404c-8f38-b3610cfde9f2.jpg?v=1712125339"
              alt="black-november-lights-off-strip-banner mobile"
              className="block md:hidden w-full"
            />
          }
        </Link>
      </div>

      <TopDealsProductsCarousel
        products={data.topDealsProducts.map((product: any) => ({
          id: product.id,
          title: product.title,
          handle: product.handle,
          image: product.featuredImage ?? {
            id: '',
            url: '',
            altText: '',
            width: 0,
            height: 0,
          },
          price: `${product.variants?.nodes?.[0]?.price?.amount ?? '0.00'}`,
          compareAtPrice: `${product.variants?.nodes?.[0]?.compareAtPrice?.amount ?? '0.00'}`,
        }))}
      />

      <TastefulProductDisplay
        title="JUST IN!"
        description="Take a look at our newest arrivals."
        ctaLabel="See What’s NEW 🔥"
        ctaLink="/collections/new-arrivals?sort_by=created-descending"
        products={data.newInProducts.map((product: any) => ({
          id: product.id,
          title: product.title,
          handle: product.handle,
          image: product.featuredImage ?? {
            id: '',
            url: '',
            altText: '',
            width: 0,
            height: 0,
          },
          price: `${product.variants?.nodes?.[0]?.price?.amount ?? '0.00'}`,
          compareAtPrice: `${product.variants?.nodes?.[0]?.compareAtPrice?.amount ?? '0.00'}`,
        }))}
      />

      {/* <div className="flex flex-col items-center mx-8 justify-center mt-12">
        <div className="text-center text-white font-semibold text-lg lg:text-3xl ">
          EXPLORE OUR WEEKLY THEMES
        </div>

        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4 my-12 justify-items-center lg:mx-8">
          {orderedMonthlyThemes.map((collection: any) => (
            <FeaturedCollection key={collection.id} collection={collection} />
          ))}
        </div>
      </div> */}

      {/* <div className="mt-8">
        <NavLink to="/collections/zetu-gift-cards">
          <img
            src="https://cdn.shopify.com/s/files/1/0621/5162/2875/files/Hero_Banner_Web_copy_2_3e36282d-6d46-4966-b41c-251c49bcb9d2.jpg?v=1712125324"
            alt="gift_cards_banner"
            className=""
          />
        </NavLink>
      </div> */}

      {/* <div>
        <Image
          src="https://cdn.shopify.com/s/files/1/0621/5162/2875/files/Hero_Banner_Mobile_copy_5f3e54a9-cadf-404c-8f38-b3610cfde9f2.jpg?v=1712125339"
          alt="accessories_banner"
          className=""
        />
      </div> */}

      {/* <div className="mt-12">
        <Link to={'/collections/vivo-safari-zoya-sale'}>
         
          <Image
            src="https://cdn.shopify.com/s/files/1/0621/5162/2875/files/Vivo_15th_Strip_Desktop.jpg?v=1778832021"
            alt="black-november-launch-strip-banner"
            className="hidden md:block w-full"
            sizes="100vw"
            loading="eager"
          />
         
          
            <img
              src="https://cdn.shopify.com/s/files/1/0621/5162/2875/files/Vivo_15th_Strip_Mobile.jpg?v=1778832022"
              alt="black-november-lights-off-strip-banner mobile"
              className="block md:hidden w-full"
            />
          }
        </Link>
      </div> */}

      <FlashSaleProductsCarousel
        products={data.flashSaleProducts.map((product: any) => ({
          id: product.id,
          title: product.title,
          handle: product.handle,
          image: product.featuredImage ?? {
            id: '',
            url: '',
            altText: '',
            width: 0,
            height: 0,
          },
          price: `${product.variants?.nodes?.[0]?.price?.amount ?? '0.00'}`,
          compareAtPrice: `${product.variants?.nodes?.[0]?.compareAtPrice?.amount ?? '0.00'}`,
        }))}
      />

      <div className="text-center text-black font-semibold text-xl lg:text-2xl mb-12">
        MORE FROM OUR PARTNER BRANDS
      </div>

      <InfiniteScrollingCollections
        collections={slidingSpotlightCollections.map((collection: any) => ({
          id: collection.id,
          title: collection.title,
          handle: collection.handle,
          image: collection.image ?? {
            id: '',
            url: '',
            altText: '',
            width: 0,
            height: 0,
          },
        }))}
        direction="left"
        speed="slow"
        pauseOnHover={true}
        className=""
      />

      {/* <InfiniteTestimonials
        direction="left"
        items={testimonials}
        speed="normal"
        className="mt-12"
      /> */}

      {/* JudgeMe Reviews Widget */}
      {/* <FeaturedJudgeMeReviews /> */}

      {/* <FeaturedReviews /> */}

      {/* Blogs section removed — not enough blog posts to display.
      <div className="mx-4 md:mx-64">
        <div className="text-3xl text-center text-black font-bold my-8">
          Blogs
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-20 my-6">
          {data.top2Articles.map((article: any) => (
            <Link
              key={article.handle}
              to={`/blogs/${article.blogHandle}/${article.handle}`}
              className="block border border-white rounded-lg shadow hover:shadow-md transition overflow-hidden"
            >
              {article.image?.url && (
                <img
                  src={article.image.url}
                  alt={article.image.altText || article.title}
                  className="blog-article-image object-cover mb-4"
                />
              )}
              <div className="px-4 pb-4">
                <h3 className="font-semibold text-lg mb-2">{article.title}</h3>
                <div className="text-xs text-gray-500 mb-2">
                  {new Date(article.publishedAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="flex justify-center mt-12 mb-8">
        <NavLink
          to="/blogs/news"
          className="bg-lime-400 text-black py-2 px-8 rounded-sm text-xl hover:underline"
        >
          View All Blogs
        </NavLink>
      </div>
      */}

      <Footer />

      {/* <RecommendedProducts products={data.recommendedProducts} />  */}
    </div>
  );
}

function FeaturedCollection({
  collection,
}: {
  collection: CollectionFragment & {
    products?: {nodes: any[]};
  };
}) {
  if (!collection) return null;
  const products = (collection.products?.nodes || []).filter(
    (product: {variants: {nodes: {availableForSale: any}[]}}) =>
      product.variants?.nodes?.some(
        (v: {availableForSale: any}) => v.availableForSale,
      ),
  );

  const image = collection?.image;
  // console.log('Rendering collection Image: ', image);
  return (
    <div className="">
      <Link className="" to={`/collections/${collection.handle}`}>
        {image && (
          <div className="relative group overflow-hidden">
            {/* Image with hover zoom */}
            {/* <Image
              data={image}
              className="lg:h-[400px] w-full object-cover transform transition-transform duration-800 group-hover:scale-108"
              sizes="(min-width: 1024px) 25vw, 50vw"
              loading="lazy"
            /> */}
            {/* <Image
              data={image}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              loading="lazy"
              className="w-full h-[200px] sm:h-[300px] lg:h-[400px] object-cover transition-transform duration-300 group-hover:scale-105"
              ref={(img) => {
                if (img) {
                  console.log('Rendered image src:', img.currentSrc); // actual image loaded
                  console.log('Rendered image width:', img.width);
                  console.log('Rendered image height:', img.height);
                }
              }}
            /> */}
            <Image
              data={image}
              sizes="(min-width: 45em) 300px, 100vw"
              loading="eager"
              className="w-full h-[160px] sm:h-[230px] lg:h-[300px] transform duration-700 hover:scale-110 object-cover"
            />

            {/* Overlay Button */}
            <div className="absolute bottom-3 bg-black/60 w-full left-1/2 -translate-x-1/2 z-5 flex items-center justify-center gap-2 md:p-2">
              <button className="text-white text-sm px-4 py-2 rounded hover:bg-gray-800 transition">
                Shop Now
              </button>

              <GiClick className="text-white text-lg" />
            </div>
          </div>
        )}
      </Link>
    </div>
  );
}

function ValentinesFeaturedCollection({
  collection,
}: {
  collection: CollectionFragment & {
    products?: {nodes: any[]};
  };
}) {
  if (!collection) return null;
  const products = (collection.products?.nodes || []).filter(
    (product: {variants: {nodes: {availableForSale: any}[]}}) =>
      product.variants?.nodes?.some(
        (v: {availableForSale: any}) => v.availableForSale,
      ),
  );

  const image = collection?.image;
  // console.log('Rendering collection Image: ', image);
  return (
    <div className="">
      <Link className="" to={`/collections/${collection.handle}`}>
        {image && (
          <div className="relative group overflow-hidden">
            {/* Image with hover zoom */}
            {/* <Image
              data={image}
              className="lg:h-[400px] w-full object-cover transform transition-transform duration-800 group-hover:scale-108"
              sizes="(min-width: 1024px) 25vw, 50vw"
              loading="lazy"
            /> */}
            {/* <Image
              data={image}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              loading="lazy"
              className="w-full h-[200px] sm:h-[300px] lg:h-[400px] object-cover transition-transform duration-300 group-hover:scale-105"
              ref={(img) => {
                if (img) {
                  console.log('Rendered image src:', img.currentSrc); // actual image loaded
                  console.log('Rendered image width:', img.width);
                  console.log('Rendered image height:', img.height);
                }
              }}
            /> */}
            <Image
              data={image}
              sizes="(min-width: 45em) 300px, 100vw"
              loading="eager"
              className="w-full h-[160px] sm:h-[230px] lg:h-[300px] transform duration-700 hover:scale-110 object-cover"
            />

            {/* Overlay Button */}
            <div className="absolute bottom-3 bg-black/60 w-full left-1/2 -translate-x-1/2 z-5 flex items-center justify-center gap-2 md:p-2">
              <button className="text-white text-sm px-4 py-2 rounded hover:bg-gray-800 transition">
                Shop Now
              </button>

              <GiClick className="text-white text-lg" />
            </div>
          </div>
        )}

        <div className="text-2xl mt-4 text-upper text-center">
          {collection.title}
        </div>
      </Link>
    </div>
  );
}

const ALL_COLLECTIONS_QUERY = `#graphql
  query AllCollections($first: Int = 250, $after: String, $country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: $first, after: $after, sortKey: UPDATED_AT, reverse: true) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        title
        handle
        image {
          id
          url
          altText
          width
          height
        }
        products(first: 4) {
          nodes {
            id
            title
            featuredImage {
              id
              url
              altText
              width
              height
            }
            variants(first: 10) {
              nodes {
                availableForSale
              }
            }
          }
        }
      }
    }
  }
` as const;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
 fragment RecommendedProduct on Product {
  id
  title
  handle
  priceRange {
    minVariantPrice {
      amount
      currencyCode
    }
  }
  featuredImage {
    id
    url
    altText
    width
    height
  }
  variants(first: 12) {
    nodes {
      availableForSale
    }
  }
}

  query RecommendedProducts ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 4, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
` as const;

const XMASS_COLLECTIONS_BY_HANDLE_QUERY = `#graphql
  fragment FeaturedCollection on Collection {
    id
    title
    handle
    image {
      id
      url
      altText
      width
      height
    }
  }

  query CollectionsByHandles(
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    dresses: collection(handle: "dresses") {
      ...FeaturedCollection
    }
    tops: collection(handle: "tops") {
      ...FeaturedCollection
    }
    bottoms: collection(handle: "bottoms") {
      ...FeaturedCollection
    }
    skirts: collection(handle: "skirts") {
      ...FeaturedCollection
    }
  }
` as const;

const VALENTINES_COLLECTIONS_BY_HANDLE_QUERY = `#graphql
  fragment FeaturedCollection on Collection {
    id
    title
    handle
    image {
      id
      url
      altText
      width
      height
    }
  }

  query CollectionsByHandles(
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    mensgiftcards: collection(handle: "gift-for-him") {
      ...FeaturedCollection
    }
    womensgiftcards: collection(handle: "gift-for-her") {
      ...FeaturedCollection
    }
    galentines: collection(handle: "galentines") {
      ...FeaturedCollection
    }
    sweetdeals: collection(handle: "sweet-deals") {
      ...FeaturedCollection
    }
  }
` as const;

const NEWIN_COLLECTIONS_BY_HANDLE_QUERY = `#graphql
  fragment FeaturedCollection on Collection {
    id
    title
    handle
    image {
      id
      url
      altText
      width
      height
    }
    products(first: 6) {
      nodes {
        featuredImage {
          id
          url
          altText
          width
          height
        }
      }
    }
  }

  query CollectionsByHandles(
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    vivo: collection(handle: "vivo") {
      ...FeaturedCollection
    }
    safaribyvivo: collection(handle: "safari") {
      ...FeaturedCollection
    }
    zoya: collection(handle: "zoya") {
      ...FeaturedCollection
    }
  }
` as const;
