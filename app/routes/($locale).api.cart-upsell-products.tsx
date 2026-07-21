import { type LoaderFunctionArgs } from '@shopify/remix-oxygen';

const PRODUCTS_BY_COLLECTION_QUERY = `#graphql
  query ProductsByCollection($handle: String!) {
    collection(handle: $handle) {
      title
      products(first: 250) {
        nodes {
          id
          title
          handle
          tags
          description
          images(first: 12) {
            nodes {
              url
              altText
            }
          }
          variants(first: 30) {
            nodes {
              id
              availableForSale
              price {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
  }
` as const;


export async function loader({ context, request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const handle = url.searchParams.get('handle') || 'default-collection-handle';

  try {
    const result = await context.storefront.query(PRODUCTS_BY_COLLECTION_QUERY, {
      variables: { handle },
    });

    const rawProducts = result.collection?.products?.nodes || [];

    // Filter products to only include those with at least one available variant
    const products = rawProducts.filter((product: { variants: { nodes: any[]; }; }) =>
      product.variants?.nodes?.some((variant) => variant.availableForSale)
    );

    return new Response(JSON.stringify({ products }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching collection products:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch collection products' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
