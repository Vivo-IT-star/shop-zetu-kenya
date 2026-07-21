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

  query PinkProductsCollection(
    $handle: String!
    $first: Int!
    $after: String
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      products(
        first: $first
        after: $after
        sortKey: MANUAL
        reverse: false
      ) {
        nodes {
          ...ProductItem
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
      }
    }
  }
`;

export async function loader({ request, context }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const after = url.searchParams.get('cursor');
  const first = parseInt(url.searchParams.get('first') || '24');

  try {
    const result = await context.storefront.query(PRODUCTS_BY_COLLECTION_QUERY, {
      variables: {
        handle: 'pink-collection',
        first,
        after,
        country: context.storefront.i18n?.country,
        language: context.storefront.i18n?.language,
      },
    });

    if (!result.collection) {
      throw new Response('Pink collection not found', { status: 404 });
    }

    const rawProducts = result.collection.products.nodes || [];
    
    // Filter only available products
    const availableProducts = rawProducts.filter((product: any) =>
      product.variants?.nodes?.some((variant: any) => variant.availableForSale)
    );

    return Response.json({
      products: availableProducts,
      pageInfo: result.collection.products.pageInfo,
      collection: {
        id: result.collection.id,
        handle: result.collection.handle,
        title: result.collection.title,
        description: result.collection.description,
      },
    });
  } catch (error) {
    console.error('Error fetching Pink Collection products:', error);
    throw new Response('Failed to load Pink Collection products', { status: 500 });
  }
}
