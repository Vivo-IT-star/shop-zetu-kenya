// app/routes/api.collections.$handle.products.tsx
import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';

const COLLECTION_PRODUCTS_QUERY = `#graphql
  fragment MoneyProductItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment ProductItem on Product {
    id
    handle
    title
    tags
    vendor
    createdAt
    featuredImage {
      id
      altText
      url
      width
      height
    }
    images(first: 2) {
      nodes {
        id
        altText
        url
        width
        height
      }
    }
    priceRange {
      minVariantPrice {
        ...MoneyProductItem
      }
      maxVariantPrice {
        ...MoneyProductItem
      }
    }
    variants(first: 50) {
      nodes {
        availableForSale
        price {
          ...MoneyProductItem
        }
        compareAtPrice {
          ...MoneyProductItem
        }
        selectedOptions {
          name
          value
        }
      }
    }
  }

  query CollectionProducts(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $first: Int!
    $after: String
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      products(
        first: $first,
        after: $after,
        sortKey: MANUAL, 
        reverse: false
      ) {
        nodes {
          ...ProductItem
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;

export async function loader({context, params, request}: LoaderFunctionArgs) {
  const {handle} = params;
  const {storefront} = context;
  const url = new URL(request.url);
  const cursor = url.searchParams.get('cursor');
  const first = parseInt(url.searchParams.get('first') || '24');

  if (!handle) {
    throw new Response('Collection handle is required', {status: 400});
  }

  try {
    const result = await storefront.query(COLLECTION_PRODUCTS_QUERY, {
      variables: {
        handle,
        first,
        after: cursor || null, // Handle case when cursor is empty
      },
    });

    if (!result.collection) {
      throw new Response('Collection not found', {status: 404});
    }

    return new Response(JSON.stringify({
      products: result.collection.products.nodes,
      pageInfo: result.collection.products.pageInfo,
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    });
  } catch (error) {
    console.error('Error fetching more products:', error);
    throw new Response('Failed to fetch products', {status: 500});
  }
}