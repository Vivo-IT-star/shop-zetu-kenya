import React, {useState, useEffect, useRef} from 'react';
import {useFilterUrlState} from '~/hooks/useFilterUrlState';
import {useAfricanYuvaProducts} from '~/lib/contexts/AfricanYuvaProductsContext';
import {Link} from 'react-router';
import AfricanYuvaHeroBanners from '~/components/AfricanYuvaHeroBanners';
import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {useLoaderData} from 'react-router';
import UniversalFilter, {ExtendedProduct} from '~/components/UniversalFilter';
import {useProductFilter} from '~/hooks/useProductFilter';
import {InfiniteScrollingProducts} from '~/components/infinite-scroll-products';
import {ProductItem} from '~/components/ProductItem';
import {FiltersSidebar} from '~/components/RadixDesktopFilters';

// const ShopAfricanYuva_COLLECTIONS_QUERY = `#graphql
//   query ShopAfricanYuvaCollections {
//     vivoDresses: collection(handle: "vivo-dresses") {
//       handle
//       title
//       image {
//         url
//         altText
//       }
//     }
//     tops: collection(handle: "vivo-tops") {
//       handle
//       title
//       image {
//         url
//         altText
//       }
//     }
//     vivoOuterWear: collection(handle: "vivo-outerwear-1") {
//       handle
//       title
//       image {
//         url
//         altText
//       }
//     }
//     vivoBottoms: collection(handle: "vivo-bottoms") {
//       handle
//       title
//       image {
//         url
//         altText
//       }
//     }
//   }
// `;

export async function loader({context, request, params}: LoaderFunctionArgs) {
  // fetch collections
  // const result = await context.storefront.query(ShopAfricanYuva_COLLECTIONS_QUERY);

  type Collection = {
    handle: string;
    title: string;
    image?: {
      url: string;
      altText?: string;
    } | null;
  };

  // const collections: Collection[] = Object.values(result).filter(Boolean);

  // fetch top selling
  const criticalData = await loadCriticalData({context, request, params});

  return {
    // collections,
    topSellingProducts: criticalData.topSellingProducts,
    topSellingProductsByID: criticalData.topSellingProductsByID,
  };
}

function buildProductByIdQuery(ids: string[]) {
  const queryFields = ids
    .map(
      (id, idx) => `product${idx}: product(id: "${id}") {
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
        }
        variants(first: 12) {
          nodes {
            availableForSale
          }
        }
      }`,
    )
    .join('\n');

  return `#graphql
    query FetchProductsByIds {
      ${queryFields}
    }
  `;
}

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
        }
        variants(first: 12) {
          nodes {
            availableForSale
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

async function loadCriticalData({context}: LoaderFunctionArgs) {
  async function fetchProductsByHandles(
    context: LoaderFunctionArgs['context'],
    handles: string[],
  ) {
    const query = buildProductByHandleQuery(handles);
    const response = await context.storefront.query(query);

    const products = Object.values(response).filter(Boolean); // Flatten alias keys to array
    return products;
  }

  async function fetchProductsByIds(
    context: LoaderFunctionArgs['context'],
    ids: string[],
  ) {
    const query = buildProductByIdQuery(ids);
    const response = await context.storefront.query(query);
    return Object.values(response).filter(Boolean);
  }

  // new: specific products by ID
  const featuredProductIds = [
    'gid://shopify/Product/8926762500315',
    'gid://shopify/Product/8907288281307',
    'gid://shopify/Product/8256730497243',
    'gid://shopify/Product/7981118882011',
    'gid://shopify/Product/8905322168539',
    'gid://shopify/Product/8039824261339',
    'gid://shopify/Product/8140180422875',
    'gid://shopify/Product/8963412623579',
  ];
  const topSellingProductsByID = await fetchProductsByIds(
    context,
    featuredProductIds,
  );

  const topSellingProductHandles = [
    'vivo-zola-v-neck-cap-sleeve-maxi-dress-lilac-navy-emin-print',
    'salok-havilah-dabby-offshoulder-maxi-dress-navy-blue-strips',
    'timyt-urban-wear-beauty-poncho-black',
    'accessorize-with-style-14k-set-gold',
    'kipusa-beauty-alika-beard-oil?q=kipusa&_pos=4&_sid=ffd987ef2&_ss=r&Color=BLACK&Style=KB009223399&Size=30ML',
    'satin-luxe-ruffle-bonnet-black-currant-white',
    'cocoafrike-eila-shirt-dress-fuchsia',
    'the-fashion-frenzy-button-cardigan-red',
    'kakiba-collections-yvonne-dress-red-white',
    'prettygline-dat-chic-bodycon-multicolored',
    'hessed-long-palazzo-pants-brown',
    'blueberry-leather-sling-bag-brown',
    'magali-designs-lulu-dress-navy-blue',
  ];

  const topSellingProducts = await fetchProductsByHandles(
    context,
    topSellingProductHandles,
  );

  return {
    topSellingProducts,
    topSellingProductsByID,
  };
}

const ShopAfricanYuva = () => {
  const {topSellingProducts, topSellingProductsByID} =
    useLoaderData<typeof loader>();

  const {products, loading, error, pageInfo, loadMoreProducts, isLoadingMore} =
    useAfricanYuvaProducts();
  const observerTarget = useRef<HTMLDivElement>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  // Add a new state for sticky behavior
  const [isFiltersSticky, setIsFiltersSticky] = useState(false);

  // Add scroll effect for sticky behavior
  useEffect(() => {
    const handleScroll = () => {
      // Show fixed header when scrolled past 40px
      setIsFiltersSticky(window.scrollY > 40);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Filters
  const sortOptions = [
    {label: 'Price: Low to High', value: 'price-asc'},
    {label: 'Price: High to Low', value: 'price-desc'},
    {label: 'Newest: New to Old', value: 'newest'},
    {label: 'Oldest: Old to New', value: 'oldest'},
  ];
  const genders = ['Women', 'Men', 'Kids'];
  const discountRanges = ['0-10%', '11-20%', '21-30%', '31-50%', '50%+'];
  const priceRanges = [
    {label: 'KES 0 - 1000', min: 0, max: 1000},
    {label: 'KES 1001 - 2000', min: 1001, max: 2000},
    {label: 'KES 2001 - 4000', min: 2001, max: 4000},
    {label: 'KES 4001 - 5000', min: 4001, max: 5000},
    {label: 'KES 6000+', min: 6000, max: Infinity},
  ];

  const {
    searchTerm,
    setSearchTerm,
    selectedSort,
    setSelectedSort,
    selectedGenders,
    setSelectedGenders,
    selectedDiscounts,
    setSelectedDiscounts,
    selectedPrice,
    setSelectedPrice,
    selectedBrands,
    setSelectedBrands,
    selectedSizes,
    setSelectedSizes,
    selectedCategories,
    setSelectedCategories,
  } = useFilterUrlState(priceRanges);

  const CATEGORY_TAGS = {
    CLOTHING: 'CLOTHING',
    SHOES: 'SHOES',
    ACCESSORIES: 'ACCESSORIES',
  } as const;

  type Category = keyof typeof CATEGORY_TAGS;

  const categories: Category[] = React.useMemo(() => {
    if (!Array.isArray(products)) return [];

    return Array.from(
      new Set(
        products.flatMap((p) =>
          Array.isArray(p?.tags)
            ? p.tags.filter((tag: string) =>
                ['CLOTHING', 'SHOES', 'ACCESSORIES'].includes(
                  tag.toUpperCase(),
                ),
              )
            : [],
        ),
      ),
    ) as Category[];
  }, [products]);

  // Unique brands
  const brands = Array.from(
    new Set(
      products
        .map((p) => p.vendor)
        .filter((v): v is string => typeof v === 'string'),
    ),
  ).sort();

  // Unique sizes
  const allSizes: string[] = Array.from(
    new Set(
      products.flatMap((p) =>
        p.variants?.nodes
          ? p.variants.nodes.flatMap((v) =>
              v.selectedOptions
                .filter((opt) => opt.name.toLowerCase() === 'size')
                .map((opt) => opt.value),
            )
          : [],
      ),
    ),
  ).sort();

  // Client-side filtering
  const filteredProducts = products
    .filter((product) => {
      const variant = product?.variants?.nodes?.[0];
      const price = parseFloat(variant?.price?.amount || '0');
      const compareAt = parseFloat(variant?.compareAtPrice?.amount || '0');
      const discount =
        compareAt && compareAt > price
          ? Math.round(((compareAt - price) / compareAt) * 100)
          : 0;

      // Search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const inTitle = product.title?.toLowerCase().includes(term);
        const inVendor = product.vendor?.toLowerCase().includes(term);
        const inTags = product.tags?.some((t) =>
          t.toLowerCase().includes(term),
        );
        if (!inTitle && !inVendor && !inTags) return false;
      }

      // Gender filter
      if (
        selectedGenders.length > 0 &&
        !selectedGenders.some((g) => product.tags?.includes(g))
      ) {
        return false;
      }

      // Discount filter
      if (selectedDiscounts.length > 0) {
        const discountMatch = selectedDiscounts.some((range) => {
          if (range === '0-10%') return discount >= 0 && discount <= 10;
          if (range === '11-20%') return discount >= 11 && discount <= 20;
          if (range === '21-30%') return discount >= 21 && discount <= 30;
          if (range === '31-50%') return discount >= 31 && discount <= 50;
          if (range === '50%+') return discount >= 51;
          return false;
        });
        if (!discountMatch) return false;
      }

      // Price filter
      if (
        selectedPrice &&
        (price < selectedPrice.min || price > selectedPrice.max)
      ) {
        return false;
      }

      // Brand filter
      if (
        selectedBrands.length > 0 &&
        !selectedBrands.includes(product.vendor ?? '')
      ) {
        return false;
      }

      // Tag filter (generic)
      if (
        selectedCategories.length > 0 &&
        !selectedCategories.some((category) =>
          product.tags?.some(
            (tag) => tag.toUpperCase() === CATEGORY_TAGS[category],
          ),
        )
      ) {
        return false;
      }

      // Size filter
      if (selectedSizes.length > 0) {
        const hasSize = product.variants?.nodes
          ? product.variants.nodes.some((v) =>
              v.selectedOptions.some(
                (opt) =>
                  opt.name.toLowerCase() === 'size' &&
                  selectedSizes.includes(opt.value),
              ),
            )
          : false;
        if (!hasSize) return false;
      }

      return true;
    })
    .sort((a, b) => {
      const priceA = parseFloat(a?.variants?.nodes?.[0]?.price?.amount || '0');
      const priceB = parseFloat(b?.variants?.nodes?.[0]?.price?.amount || '0');
      if (selectedSort === 'price-asc') return priceA - priceB;
      if (selectedSort === 'price-desc') return priceB - priceA;
      if (selectedSort === 'newest')
        return (
          new Date(b.createdAt ?? 0).getTime() -
          new Date(a.createdAt ?? 0).getTime()
        );
      if (selectedSort === 'oldest')
        return (
          new Date(a.createdAt ?? 0).getTime() -
          new Date(b.createdAt ?? 0).getTime()
        );
      return 0;
    });

  // Infinite scroll implementation
  useEffect(() => {
    if (!pageInfo?.hasNextPage || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreProducts().catch((err) => {
            console.error('Error in infinite scroll:', err);
          });
        }
      },
      {threshold: 0.1},
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [pageInfo, isLoadingMore, loadMoreProducts]);

  // ... rest of the component code ...

  // Cleanup on component unmount - close mobile filters
  // useEffect(() => {
  //   console.log('Vivo shop component mounted');
  //   return () => {
  //     console.log('Vivo shop component unmounting, closing mobile filters');
  //     setShowMobileFilters(false);
  //   };
  // }, []);

  if (loading) {
    return <div className="text-center my-8">Loading products...</div>;
  }

  if (error) {
    return (
      <div className="text-red-600">
        Error loading products: {error.message}
      </div>
    );
  }

  if (!products.length) {
    return <div>No products available</div>;
  }

  return (
    <div className="flex flex-col w-full">
     <div className="w-full mt-52 md:mt-48 ">
        <AfricanYuvaHeroBanners />
      </div>

      {/* Collections Section */}
      {/* <div>
        {collections?.length > 0 && (
          <div className="px-4 mt-10">
            <div className="text-center font-semibold text-lg lg:text-2xl my-10 lg:my-0 ">
              Lizola TOP CATEGORIES
            </div>
            <div className="grid grid-cols-2 lg:scale-80  -mt-4 md:grid-cols-4 gap-4 ">
              {collections.map((col) =>
                col ? (
                  <div
                    key={col.handle}
                    className="block bg-white rounded-lg shadow hover:shadow-md transition overflow-hidden cursor-pointer"
                    onClick={() =>
                      (window.location.href = `/collections/${col.handle}`)
                    }
                  >
                    {col.image?.url ? (
                      <img
                        src={col.image.url}
                        alt={col.image.altText || col.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="h-40 bg-gray-200 flex items-center justify-center text-sm text-gray-500">
                        No image
                      </div>
                    )}
                  </div>
                ) : null,
              )}
            </div>
          </div>
        )}
      </div> */}

      {/* <InfiniteScrollingProducts
        products={topSellingProducts.map((product: any) => ({
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
          price: `${product.priceRange?.minVariantPrice?.amount ?? '0.00'} ${product.priceRange?.minVariantPrice?.currencyCode ?? ''}`,
        }))}
        direction="left"
        speed="slow"
        pauseOnHover={true}
      /> */}

      <div className=" z-10 md:-mt-8 md:bg-white">
        <div className="text-center pt-8 font-semibold text-lg lg:text-2xl lg:mt-0">
          TOP SELLING
        </div>

        <InfiniteScrollingProducts
          products={topSellingProductsByID.map((product: any) => ({
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
            price: `${product.priceRange?.minVariantPrice?.amount ?? '0.00'} ${
              product.priceRange?.minVariantPrice?.currencyCode ?? ''
            }`,
          }))}
          direction="left"
          speed="slow"
          pauseOnHover={true}
        />
      </div>

      {/* ALL PRODUCTS FILTER AND GRID */}
      <div className="flex flex-row gap-4 w-full min-h-screen relative overflow-hidden">
        {/* 🧭 Sidebar - Sticky & Independent Scroll */}
        <div className="hidden md:flex w-[310px] ">
          <div className=" fixed top-40 2xl:top-45 h-[450px] 2xl:h-[600px] overflow-y-auto p-4">
            <FiltersSidebar
              filteredProducts={filteredProducts}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              brands={brands}
              selectedBrands={selectedBrands}
              setSelectedBrands={setSelectedBrands}
              allSizes={allSizes}
              selectedSizes={selectedSizes}
              setSelectedSizes={setSelectedSizes}
              sortOptions={sortOptions}
              selectedSort={selectedSort}
              setSelectedSort={setSelectedSort}
              priceRanges={priceRanges}
              selectedPrice={selectedPrice}
              setSelectedPrice={setSelectedPrice}
              discountRanges={discountRanges}
              selectedDiscounts={selectedDiscounts}
              setSelectedDiscounts={setSelectedDiscounts}
              genders={genders}
              selectedGenders={selectedGenders}
              setSelectedGenders={setSelectedGenders}
              categories={categories}
              selectedCategories={selectedCategories}
              setSelectedCategories={setSelectedCategories}
            />
          </div>
        </div>

        {/* 🛍️ Products Section - Independent Scroll */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Sticky header for mobile */}
          {/* <div className="md:hidden flex fixed items-center justify-between top-0 h-14 z-20 bg-white shadow-sm left-1/2 transform -translate-x-1/2 w-full max-w-lg px-4">
           <h1 className="text-lg font-bold truncate">Vivo</h1>
     
           <div className="md:hidden flex justify-center">
             <button
               className="w-full p-3 border rounded-md text-center text-sm text-white transition-colors flex items-center justify-center gap-2"
               onClick={() => setShowMobileFilters(true)}
             >
               <svg
                 className="w-4 h-4"
                 fill="none"
                 stroke="currentColor"
                 viewBox="0 0 24 24"
               >
                 <path
                   strokeLinecap="round"
                   strokeLinejoin="round"
                   strokeWidth={2}
                   d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z"
                 />
               </svg>
               Open Filters
             </button>
           </div>
         </div> */}
          <div className="md:hidden flex fixed items-center justify-between top-38 h-14 z-50 bg-white shadow-sm left-1/2 transform -translate-x-1/2 w-full max-w-lg px-4">
            <h1 className="text-lg font-bold truncate">African Yuva</h1>

            {/* Mobile Filter Button - Sticky with title */}
            <div className="md:hidden flex justify-center ">
              <button
                className="w-full p-2 border rounded-md text-center text-sm text-white bg-black transition-colors flex items-center justify-center gap-2"
                onClick={() => setShowMobileFilters(true)}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z"
                  />
                </svg>
                Open Filters
              </button>
            </div>
          </div>

          {/* Scrollable Product Grid */}
          <div className="flex-1 overflow-y-auto smooth-scroll p-2 md:p-4  md:mt-0">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-1">
              {filteredProducts.map((product) => {
                const variant = product?.variants?.nodes?.[0];
                const price = parseFloat(
                  product.priceRange.minVariantPrice.amount || '0',
                );
                const compareAt = parseFloat(
                  (variant as any)?.compareAtPrice?.amount || '0',
                );
                const discount =
                  compareAt && compareAt > price
                    ? Math.round(((compareAt - price) / compareAt) * 100)
                    : null;

                return (
                  <Link
                    to={`/products/${product.handle}`}
                    key={product.id}
                    className=" rounded-lg transition m-2"
                    prefetch="intent"
                  >
                    <ProductItem product={product} />
                  </Link>
                );
              })}
            </div>

            {/* Infinite Scroll Trigger */}
            <div
              ref={observerTarget}
              className="h-10 flex items-center justify-center"
            >
              {isLoadingMore && (
                <div className="text-center py-4">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                  <p className="text-sm text-gray-500 mt-2">
                    Loading more products...
                  </p>
                </div>
              )}
              {!pageInfo?.hasNextPage && products.length > 24 && (
                <div className="text-center py-4 text-sm text-gray-500">
                  All products loaded
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filter Overlay */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 md:hidden">
          <div className="absolute right-0 top-0 h-full w-80 bg-white overflow-y-auto">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Filters</h3>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  ✕
                </button>
              </div>
              {/* Mobile filter UI - same as desktop, but in overlay */}
              {/* Search */}
              <input
                type="text"
                placeholder="Search by name, color, vendor..."
                className="w-full border rounded p-2 mb-4"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {/* Brand */}
              <div className="mb-4">
                <p className="font-medium mb-2">Brand</p>
                {brands.map((brand) => (
                  <label key={brand} className="block">
                    <input
                      type="checkbox"
                      value={brand}
                      checked={selectedBrands.includes(brand)}
                      onChange={(e) =>
                        setSelectedBrands((prev) =>
                          e.target.checked
                            ? [...prev, brand]
                            : prev.filter((x) => x !== brand),
                        )
                      }
                    />{' '}
                    {brand}
                  </label>
                ))}
              </div>

              {/* Size */}
              <div className="mb-4">
                <p className="font-medium mb-2">Size</p>
                {allSizes.map((size) => (
                  <label key={size} className="block">
                    <input
                      type="checkbox"
                      value={size}
                      checked={selectedSizes.includes(size)}
                      onChange={(e) =>
                        setSelectedSizes((prev) =>
                          e.target.checked
                            ? [...prev, size]
                            : prev.filter((x) => x !== size),
                        )
                      }
                    />{' '}
                    {size}
                  </label>
                ))}
              </div>
              {/* Sort */}
              <label className="block text-sm font-medium mb-1">Sort</label>
              <select
                className="w-full border rounded p-2 mb-4"
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
              >
                <option value="">Default</option>
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {/* Price Range Dropdown */}
              <label className="block text-sm font-medium mb-1">
                Price Range
              </label>
              <select
                className="w-full border rounded p-2 mb-4"
                value={selectedPrice?.label || ''}
                onChange={(e) =>
                  setSelectedPrice(
                    priceRanges.find((p) => p.label === e.target.value) || null,
                  )
                }
              >
                <option value="">All</option>
                {priceRanges.map((pr) => (
                  <option key={pr.label} value={pr.label}>
                    {pr.label}
                  </option>
                ))}
              </select>
              {/* Discount */}
              <div className="mb-4">
                <p className="font-medium mb-2">Discount</p>
                {discountRanges.map((range) => (
                  <label key={range} className="block">
                    <input
                      type="checkbox"
                      value={range}
                      checked={selectedDiscounts.includes(range)}
                      onChange={(e) =>
                        setSelectedDiscounts((prev) =>
                          e.target.checked
                            ? [...prev, range]
                            : prev.filter((x) => x !== range),
                        )
                      }
                    />{' '}
                    {range}
                  </label>
                ))}
              </div>

              {/* Product Type */}
              <div className="mb-4">
                <p className="font-medium mb-2">Type</p>
                {categories.map((category) => (
                  <label key={category} className="block">
                    <input
                      type="checkbox"
                      value={category}
                      checked={selectedCategories.includes(category)}
                      onChange={(e) =>
                        setSelectedCategories((prev) =>
                          e.target.checked
                            ? [...prev, category]
                            : prev.filter((x) => x !== category),
                        )
                      }
                    />{' '}
                    {category}
                  </label>
                ))}
              </div>
              {/* Gender */}
              {/* <div className="mb-4">
                <p className="font-medium mb-2">Gender</p>
                {genders.map((g) => (
                  <label key={g} className="block">
                    <input
                      type="checkbox"
                      value={g}
                      checked={selectedGenders.includes(g)}
                      onChange={(e) =>
                        setSelectedGenders((prev) =>
                          e.target.checked
                            ? [...prev, g]
                            : prev.filter((x) => x !== g),
                        )
                      }
                    />{' '}
                    {g}
                  </label>
                ))}
              </div> */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopAfricanYuva;
