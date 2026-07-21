import { redirect, type LoaderFunctionArgs } from '@shopify/remix-oxygen';
import { useLoaderData, type MetaFunction } from 'react-router';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import { useWishlist } from '~/lib/contexts/WishlistContext';
import { ProductPrice } from '~/components/ProductPrice';
import { ProductImage } from '~/components/ProductImage';
import { ProductForm, ProductAddToCartButton } from '~/components/ProductForm';
import { redirectIfHandleIsLocalized } from '~/lib/redirect';
import ProductReviews from '~/components/ProductReviews';
import WriteReview from '~/components/WriteReview';
import { TopDealsProductsCarousel } from '~/components/TopDealsProducts';
import { FlashSaleProductsCarousel } from '~/components/FlashSaleCarouselProducts';
import { RelatedProductsCarousel } from '~/components/RelatedProducts';
import MissFitButton from '~/components/MissFitButton';

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: `Shopzetu | ${data?.product.title ?? ''}` },
    {
      rel: 'canonical',
      href: `/products/${data?.product.handle}`,
    },
  ];
};

export async function loader(args: LoaderFunctionArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return { ...deferredData, ...criticalData };
}

/**
 * Load data necessary for rendering content above the fold.
 */
async function loadCriticalData({
  context,
  params,
  request,
}: LoaderFunctionArgs) {
  const { handle } = params;
  const { storefront } = context;

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  const [{ product }] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: { handle, selectedOptions: getSelectedProductOptions(request) },
    }),
  ]);




  if (!product?.id) {
    throw new Response(null, { status: 404 });
  }

  redirectIfHandleIsLocalized(request, { handle, data: product });

  return { product };
}

/**
 * Load non-critical data deferred.
 */
function loadDeferredData({ context, params }: LoaderFunctionArgs) {
  return {};
}

export default function Product() {
  const { product } = useLoaderData<typeof loader>();
  const { isWishlisted, toggleWishlist } = useWishlist();
  // const productImage = product.images?.nodes?.[0]?.url ?? '';
  // console.log('Product Data:', product);
  const primaryCollection = product.collections.nodes[0];
  // console.log('Primary Collection:', primaryCollection);
  const collectionProducts = primaryCollection.products.nodes;

  // const relatedProducts = collectionProducts
  // .filter((p: any) => p.id !== product.id) // remove current product
  // .filter((p: any) => p.vendor === product.vendor) // same vendor
  // .slice(0, 8);

  const baseProducts = collectionProducts.filter(
  (p: any) => p.id !== product.id
);

// 1. First pass: same vendor
let relatedProducts = baseProducts.filter(
  (p: any) => p.vendor === product.vendor
);

// 2. Fallback: include other vendors if not enough
if (relatedProducts.length < 8) {
  const otherProducts = baseProducts.filter(
    (p: any) => p.vendor !== product.vendor
  );

  relatedProducts = [
    ...relatedProducts,
    ...otherProducts
  ];
}

// 3. Final limit
relatedProducts = relatedProducts.slice(0, 250);

  // console.log('Related Products:', relatedProducts);

  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const productId = Number(product.id.split('/').pop());
  const productImage = product.images?.nodes?.[0]?.url;
  const stringProductImage = productImage ? productImage.toString() : "";
  //console.log('Product Image URL:', stringProductImage);
  //console.log('Product ID:', productId);

  const { title, descriptionHtml } = product;

  return (
    <div className="mx-4 mt-40 lg:mt-52">

      <div className='product'>

          <div className="relative">
        {/* Product Image with Wishlist + Add to Cart */}
        <ProductImage
          images={(product.images?.nodes ?? []).map((img: any) => ({
            id: img.id ?? '',
            url: img.url,
            altText: img.altText ?? null,
            width: img.width ?? 0,
            height: img.height ?? 0,
          }))}
          addToCartButton={
            <ProductAddToCartButton selectedVariant={selectedVariant} />
          }
          wishlistButton={
            <button
              type="button"
              aria-label={isWishlisted(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
              className="absolute top-2 left-2 z-10 bg-white/90 rounded-full p-2 shadow-md hover:bg-white transition"
              onClick={() =>
                toggleWishlist({
                  id: product.id,
                  handle: product.handle,
                  title: product.title,
                  image: productImage,
                  price: selectedVariant?.price?.amount ?? undefined,
                  compareAtPrice: selectedVariant?.compareAtPrice?.amount ?? undefined,
                })
              }
            >
              {isWishlisted(product.id) ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="#C20000" viewBox="0 0 24 24" width="28" height="28" className='cursor-pointer'>
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 
                           2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 
                           4.5 2.09C13.09 3.81 14.76 3 16.5 3 
                           19.58 3 22 5.42 22 8.5c0 3.78-3.4 
                           6.86-8.55 11.54L12 21.35z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#C20000" strokeWidth="2" viewBox="0 0 24 24" width="28" height="28" className='cursor-pointer'>
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 
                           2 12.28 2 8.5 2 5.42 4.42 3 
                           7.5 3c1.74 0 3.41 0.81 
                           4.5 2.09C13.09 3.81 14.76 3 
                           16.5 3 19.58 3 22 5.42 
                           22 8.5c0 3.78-3.4 6.86-8.55 
                           11.54L12 21.35z" />
                </svg>
              )}
            </button>
          }
        />


      </div>

      {/* Product Details */}
      <div className="product-main">
        <h1>{title}</h1>

        {/* {'tags' in product && product.tags.includes('BUY X GET Y') && (
            <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 mb-4 -my-2 rounded">
             Buy One Get One Free
            </span>
          )} */}

        {/* <div className="-mt-4 mb-4">
          {product.tags?.includes('NEXT-DAY-DELIVERY') && (
            <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
              Next-Day Delivery
            </span>
          )}

          {(product.tags?.includes('EXPRESS SHIPPING') ||
            product.tags?.includes('EXPRESS  SHIPPING')) && (
            <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded mt-1">
              Express Shipping
            </span>
          )}
        </div> */}

        <ProductPrice
          price={selectedVariant?.price}
          compareAtPrice={selectedVariant?.compareAtPrice}
        />

        <ProductForm
          productOptions={productOptions}
          selectedVariant={selectedVariant}
          showAddToCart={true}
        />

          <div className="product-actions mb-8">
            {/* Other cart buttons... */}
            {/* <MissFitButton product={product} /> */}
          </div>

        <p className="mt-6 font-bold">Description</p>
        <div className="mt-6" dangerouslySetInnerHTML={{ __html: descriptionHtml }} />

        <ProductReviews productHandle={product.handle} />

        <WriteReview productId={productId} firstImage={[productImage]} />

        <div className="w-full mb-8 lg:hidden block mt-8">
          <ProductAddToCartButton selectedVariant={selectedVariant} />
        </div>

        <div className="jdgm-widget jdgm-preview-badge" data-id="add-your-product-id"></div>
      </div>

      </div>
    

      {/* <div className='flex justify-center items-center bg-green-600 mt-8 w-full'>
        Test Section
      </div> */}

      

      <div className='flex items-center justify-center '>
          <RelatedProductsCarousel
              products={relatedProducts.map((product: any) => ({
                id: product.id,
                title: product.title,
                handle: product.handle,
                vendor: product.vendor,
                image: product.images?.nodes?.[0] ?? {
                  id: '',
                  url: '',
                  altText: '',
                  width: 0,
                  height: 0,
                },
                price: `${product.priceRange?.minVariantPrice?.amount ?? '0.00'}`,
                compareAtPrice: `${product.priceRange?.maxVariantPrice?.amount ?? '0.00'}`,
              }))}
            />
        
      </div>

     

      {/* Analytics */}
      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price.amount || '0',
              tags: product.tags,
              vendor: product.vendor,
              variantId: selectedVariant?.id || '',
              variantTitle: selectedVariant?.title || '',
              quantity: 1,
            },
          ],
        }}
      />
    </div>
  );
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
` as const;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    tags
    handle
    descriptionHtml
    description
    collections(first: 5) {
      nodes {
        id
        title
        handle
        products(first: 50, reverse: true) {
          nodes {
            id
            title
            handle
            vendor
            category {
              id
              name
            }
            images(first: 1) {
              nodes {
                url
              }
            }
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
    encodedVariantExistence
    encodedVariantAvailability
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    images(first: 10) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants (selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    seo {
      description
      title
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
` as const;