import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';




interface ShopifyAdminAPIResponse<T = any> {
  data: T;
  errors?: Array<{ message: string }>;
}

export async function fetchAdminAPI<T = any>(
  query: string,
  variables: Record<string, any>,
  ADMIN_API_URL: string,
  ADMIN_API_TOKEN: string
): Promise<T> {
  try {
    const res = await fetch(ADMIN_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': ADMIN_API_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
    });
    const jsonRes = await res.json() as ShopifyAdminAPIResponse<T>;
    if (jsonRes.errors) {
      console.error('Shopify Admin API error:', JSON.stringify(jsonRes.errors, null, 2));
      throw new Error(jsonRes.errors[0].message || JSON.stringify(jsonRes.errors));
    }
    return jsonRes.data;
  } catch (err) {
    console.error('fetchAdminAPI failed:', err);
    throw err;
  }
}


export const loader = async ({params, context, request}: LoaderFunctionArgs) => {
  // Log the Admin API URL and token for debugging
  console.log('ADMIN_API_URL:', context.env.SHOPIFY_ADMIN_API_URL);
  console.log('ADMIN_API_TOKEN:', context.env.SHOPIFY_ADMIN_API_TOKEN);
  const ADMIN_API_URL = context.env.SHOPIFY_ADMIN_API_URL;
  const ADMIN_API_TOKEN = context.env.SHOPIFY_ADMIN_API_TOKEN;
  // console.log("Shopify Admin Details", ADMIN_API_URL);
  try {
    const vendor = params.name;
    const url = new URL(request.url);
    const limit = url.searchParams.get('limit')
      ? parseInt(url.searchParams.get('limit') || '20', 10)
      : 20;

    // Last 14 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 14);

    const startStr = startDate.toISOString().slice(0, 10);
    const endStr = endDate.toISOString().slice(0, 10);

    // Step 1: Get products by vendor (use Storefront API via context)
    let hasNextPageProducts = true;
    let afterCursorProducts: string | null = null;
    const products: any[] = [];
    const productIds: string[] = [];

    while (hasNextPageProducts) {
      const productsQuery = `
       query ($vendorQuery: String!, $after: String) {
  products(first: 20, query: $vendorQuery, after: $after) {
    edges {
      node {
        id
        title
        handle
        vendor
        status
        totalInventory
        featuredImage {
          url
          altText
        }
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        variants(first: 1) {
          edges {
            node {
              compareAtPrice {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
      `;

      // Storefront API: use context.storefront
      const productsRes: any = await context.storefront.query(productsQuery, {
        variables: {
          vendorQuery: `vendor:${vendor}`,
          after: afterCursorProducts,
        },
      });

      const productsData = productsRes.products;
      productsData.edges.forEach((edge: any) => {
        products.push(edge.node);
        productIds.push(edge.node.id);
      });

      hasNextPageProducts = productsData.pageInfo.hasNextPage;
      afterCursorProducts = productsData.pageInfo.endCursor;
    }

    // Step 2: Query orders from last 14 days using Admin API (direct fetch, NOT context)
    let hasNextPageOrders = true;
    let afterCursorOrders: string | null = null;
    const salesCount: Record<string, number> = {};

    while (hasNextPageOrders) {
      const ordersQuery = `
        query ($query: String!, $after: String) {
          orders(first: 20, query: $query, after: $after) {
            edges {
              node {
                lineItems(first: 100) {
                  edges {
                    node {
                      product { id }
                      quantity
                    }
                  }
                }
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      `;

      // Admin API: use direct fetch, NOT context
      const ordersRes: any = await fetchAdminAPI(
        ordersQuery,
        {
          query: `created_at:>=${startStr} AND created_at:<=${endStr}`,
          after: afterCursorOrders,
        },
        ADMIN_API_URL,
        ADMIN_API_TOKEN
      );

      const ordersData = ordersRes.orders;
      ordersData.edges.forEach((edge: any) => {
        edge.node.lineItems.edges.forEach((liEdge: any) => {
          const productId = liEdge.node.product?.id;
          if (productId && productIds.includes(productId)) {
            salesCount[productId] =
              (salesCount[productId] || 0) + liEdge.node.quantity;
          }
        });
      });

      hasNextPageOrders = ordersData.pageInfo.hasNextPage;
      afterCursorOrders = ordersData.pageInfo.endCursor;
    }

    // Step 3: Format response (only ACTIVE + in stock) and apply limit
    const bestSellers = products
      .filter((product) => product.status === 'ACTIVE' && product.totalInventory > 0)
      .map((product) => {
        const compareAtPriceRange = product.compareAtPriceRange || {};
        const minVariantCompareAtPrice =
          compareAtPriceRange.minVariantCompareAtPrice || {};

        return {
          id: product.id,
          title: product.title,
          handle: product.handle,
          image: product.featuredImage?.url || null,
          imageAlt: product.featuredImage?.altText || '',
          price: product.priceRange?.minVariantPrice?.amount
            ? parseFloat(product.priceRange.minVariantPrice.amount)
            : null,
          vendor: product.vendor,
          compareAtPrice: minVariantCompareAtPrice.amount
            ? parseFloat(minVariantCompareAtPrice.amount)
            : null,
          totalSales: salesCount[product.id] || 0,
        };
      })
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, limit);

    return {
      success: true,
      startDate: startStr,
      endDate: endStr,
      limit,
      bestSellers,
    };
  } catch (error: any) {
  console.error('Best sellers API error:', error);
  return {
    success: false,
    error: {
      code: '500',
      message: error?.message || String(error),
      stack: error?.stack,
    },
  };
}
};
    ;
  
