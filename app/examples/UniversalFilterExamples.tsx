import React from 'react';
import {useLoaderData, type LoaderFunctionArgs, type MetaFunction} from 'react-router';
import UniversalFilter, {ExtendedProduct} from '~/components/UniversalFilter';
import {useProductFilter} from '~/hooks/useProductFilter';
import {ProductItem} from '~/components/ProductItem';

// Example loader for a custom collection page
export async function loader({context, params}: LoaderFunctionArgs) {
  const {storefront} = context;
  const {handle} = params;

  const collection = await storefront.query(`
    query ExampleCollection($handle: String!) {
      collection(handle: $handle) {
        id
        title
        description
        handle
        products(first: 100) {
          nodes {
            id
            title
            handle
            tags
            vendor
            createdAt
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
            variants(first: 10) {
              nodes {
                id
                availableForSale
                price {
                  amount
                  currencyCode
                }
                compareAtPrice {
                  amount
                  currencyCode
                }
                selectedOptions {
                  name
                  value
                }
              }
            }
          }
        }
      }
    }
  `, {
    variables: {handle}
  });

  return {collection: collection.collection};
}

export const meta: MetaFunction<typeof loader> = ({data}) => {
  return [
    {title: `${data?.collection?.title || 'Collection'} | Your Store`},
    {name: 'description', content: data?.collection?.description || ''},
  ];
};

export default function ExampleCollectionPage() {
  const {collection} = useLoaderData<typeof loader>();
  const {filteredProducts, handleFilteredProductsChange} = useProductFilter(
    collection?.products?.nodes as ExtendedProduct[] || []
  );

  if (!collection) {
    return <div>Collection not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {collection.title}
        </h1>
        {collection.description && (
          <p className="text-lg text-gray-600">{collection.description}</p>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filter Sidebar */}
        <div className="lg:w-80">
          <UniversalFilter
            products={(collection.products.nodes as ExtendedProduct[]) || []}
            onFilteredProductsChange={handleFilteredProductsChange}
            showSearch={true}
            className="lg:sticky lg:top-24"
            options={{
              sortOptions: [
                {label: 'Featured', value: 'featured'},
                {label: 'Price: Low to High', value: 'price-asc'},
                {label: 'Price: High to Low', value: 'price-desc'},
                {label: 'Alphabetically: A-Z', value: 'name-asc'},
                {label: 'Alphabetically: Z-A', value: 'name-desc'},
                {label: 'Date: New to Old', value: 'newest'},
                {label: 'Date: Old to New', value: 'oldest'},
              ],
              priceRanges: [
                {label: 'Under KES 1,000', min: 0, max: 1000},
                {label: 'KES 1,000 - 2,500', min: 1000, max: 2500},
                {label: 'KES 2,500 - 5,000', min: 2500, max: 5000},
                {label: 'KES 5,000 - 10,000', min: 5000, max: 10000},
                {label: 'Over KES 10,000', min: 10000, max: Infinity},
              ],
              genders: ['Women', 'Men', 'Kids', 'Unisex'],
              discountRanges: ['5-15%', '16-30%', '31-50%', '50%+'],
            }}
          />
        </div>

        {/* Products Section */}
        <div className="flex-1">
          {/* Results Summary */}
          <div className="flex items-center justify-between mb-6">
            <div className="text-sm text-gray-600">
              Showing {filteredProducts.length} of {collection.products.nodes.length} products
            </div>
          </div>

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product, index) => (
                <ProductItem
                  key={product.id}
                  product={product}
                  loading={index < 8 ? 'eager' : 'lazy'}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-gray-400 text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No products found
              </h3>
              <p className="text-gray-500 mb-4">
                Try adjusting your filters or search terms
              </p>
              <button
                onClick={() => window.location.href = window.location.pathname}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Example of how to use the filter in a search page
export function SearchPageExample() {
  // This would be loaded from your search loader
  const searchResults = [] as ExtendedProduct[];
  const searchQuery = 'dresses';
  
  const {filteredProducts, handleFilteredProductsChange} = useProductFilter(searchResults);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Search Results for "{searchQuery}"
        </h1>
        <p className="text-gray-600">
          Found {searchResults.length} products
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <UniversalFilter
          products={searchResults}
          onFilteredProductsChange={handleFilteredProductsChange}
          showSearch={false} // Don't show search on search results page
          className="lg:w-80"
          options={{
            sortOptions: [
              {label: 'Relevance', value: 'relevance'},
              {label: 'Price: Low to High', value: 'price-asc'},
              {label: 'Price: High to Low', value: 'price-desc'},
              {label: 'Newest First', value: 'newest'},
            ],
          }}
        />

        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductItem key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Example of how to use the filter for a sale/discount page
export function SalePageExample() {
  const saleProducts = [] as ExtendedProduct[];
  
  const {filteredProducts, handleFilteredProductsChange} = useProductFilter(saleProducts);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-2">
          🔥 SALE - Up to 70% Off
        </h1>
        <p className="text-lg text-gray-600">
          Limited time offers on selected items
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <UniversalFilter
          products={saleProducts}
          onFilteredProductsChange={handleFilteredProductsChange}
          className="lg:w-80"
          options={{
            // Focus on discount filtering for sale page
            discountRanges: ['20-30%', '31-50%', '51-70%', '70%+'],
            sortOptions: [
              {label: 'Biggest Discount', value: 'discount-desc'},
              {label: 'Price: Low to High', value: 'price-asc'},
              {label: 'Price: High to Low', value: 'price-desc'},
            ],
            priceRanges: [
              {label: 'Under KES 500', min: 0, max: 500},
              {label: 'KES 500 - 1,000', min: 500, max: 1000},
              {label: 'KES 1,000 - 2,000', min: 1000, max: 2000},
              {label: 'Over KES 2,000', min: 2000, max: Infinity},
            ],
          }}
        />

        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductItem key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
