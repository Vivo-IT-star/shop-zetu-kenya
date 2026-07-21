import { type LoaderFunctionArgs } from '@shopify/remix-oxygen';

const PRODUCTS_BY_COLLECTION_QUERY = `#graphql
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

  query VivoProductsByCollection(
    $handle: String!
    $first: Int!
    $after: String
  ) {
    collection(handle: $handle) {
      title
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
` as const;

// app/routes/api.vivo_products.tsx
// ... existing imports and code ...

export async function loader({ context, request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const handle = url.searchParams.get('handle') || 'vivo-collection';
  const cursor = url.searchParams.get('cursor');
  const first = parseInt(url.searchParams.get('first') || '250');

  try {
    const result = await context.storefront.query(PRODUCTS_BY_COLLECTION_QUERY, {
      variables: { 
        handle,
        first,
        after: cursor || null,
      },
    });

    if (!result.collection) {
      return new Response(
        JSON.stringify({ error: 'Collection not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const rawProducts = result.collection.products.nodes || [];

    // Filter products to only include those with at least one available variant
    const products = rawProducts.filter((product: { variants: { nodes: any[]; }; }) =>
      product.variants?.nodes?.some((variant) => variant.availableForSale)
    );

    return new Response(JSON.stringify({ 
      products,
      pageInfo: result.collection.products.pageInfo,
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    });
  } catch (error) {
    console.error('Error fetching collection products:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch collection products' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}