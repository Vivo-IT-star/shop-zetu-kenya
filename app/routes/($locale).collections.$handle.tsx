import {redirect, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {
  useLoaderData,
  useParams,
  useSearchParams,
  type MetaFunction,
} from 'react-router';
import {getPaginationVariables, Analytics} from '@shopify/hydrogen';
import {ProductItem} from '~/components/ProductItem';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {ProductItemFragment} from 'storefrontapi.generated';
import {useState, useEffect, useMemo, useRef, Suspense} from 'react';
import {FiltersSidebar} from '~/components/RadixDesktopFilters';
import {FiltersMobileDrawer} from '~/components/RadixMobileFilters';

// Skeleton loading component
function ProductSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-200 aspect-square rounded mb-3"></div>
      <div className="h-4 bg-gray-200 rounded mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-6 bg-gray-200 rounded w-1/2"></div>
    </div>
  );
}

// Grid skeleton for initial loading
function ProductGridSkeleton({count = 24}: {count?: number}) {
  return (
    <div className="products-grid">
      {Array.from({length: count}).map((_, index) => (
        <ProductSkeleton key={`skeleton-${index}`} />
      ))}
    </div>
  );
}

type CollectionProductNode = {
  products: {
    nodes: ProductItemFragment[];
  };
};

export const meta: MetaFunction<typeof loader> = ({data}) => {
  return [{title: `Vivo Fashion Group | ${data?.collection.title ?? ''} Collection`}];
};

export async function loader(args: LoaderFunctionArgs) {
  // Only load critical data for initial render - faster page load
  const criticalData = await loadCriticalData(args);

  // Add caching headers for performance
  const response = new Response(JSON.stringify(criticalData), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400', // 1 day browser, 1 day CDN
    },
  });

  return criticalData;
}

/**
 * Fetch initial products from a collection for fast page load
 */
/**
 * Fetch initial products from a collection for fast page load
 */
async function fetchInitialProducts(
  storefront: any,
  handle: string,
  first: number = 24,
): Promise<{
  products: ProductItemFragment[];
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string;
  };
}> {
  const result = await storefront.query(COLLECTION_PRODUCTS_QUERY, {
    variables: {
      handle,
      first,
      after: null, // Explicitly set to null for initial fetch
    },
  });

  if (!result.collection) {
    return {
      products: [],
      pageInfo: {
        hasNextPage: false,
        endCursor: '',
      },
    };
  }

  return {
    products: result.collection.products.nodes,
    pageInfo: result.collection.products.pageInfo,
  };
}
/**
 * Fetch more products for client-side pagination
 */
/**
 * Fetch more products for client-side pagination
 */
async function fetchMoreProducts(
  storefront: any,
  handle: string,
  cursor: string,
  first: number = 24,
): Promise<{
  products: ProductItemFragment[];
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string;
  };
}> {
  const result = await storefront.query(COLLECTION_PRODUCTS_QUERY, {
    variables: {
      handle,
      first,
      after: cursor || null, // Handle case when cursor is empty
    },
  });

  if (!result.collection) {
    return {
      products: [],
      pageInfo: {
        hasNextPage: false,
        endCursor: '',
      },
    };
  }

  return {
    products: result.collection.products.nodes,
    pageInfo: result.collection.products.pageInfo,
  };
}
/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({
  context,
  params,
  request,
}: LoaderFunctionArgs) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) {
    throw redirect('/collections');
  }

  // First, get the collection basic info
  const [{collection}] = await Promise.all([
    storefront.query(COLLECTION_INFO_QUERY, {
      variables: {handle},
    }),
  ]);

  if (!collection) {
    throw new Response(`Collection ${handle} not found`, {
      status: 404,
    });
  }

  // The API handle might be localized, so redirect to the localized handle
  redirectIfHandleIsLocalized(request, {handle, data: collection});

  // Fetch only initial products for fast page load
  const initialProductsData = await fetchInitialProducts(
    storefront,
    handle,
    250,
  );

  return {
    collection: {
      ...collection,
      products: {
        nodes: initialProductsData.products,
        pageInfo: initialProductsData.pageInfo,
      },
    },
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: LoaderFunctionArgs) {
  return {};
}

export default function Collection() {
  const {collection} = useLoaderData<typeof loader>();
  const params = useParams();
  const currentHandle = params.handle;
  const [searchParams, setSearchParams] = useSearchParams();

  // Debug logging
  // console.log('Collection component rendered:', {
  //   id: collection.id,
  //   handle: collection.handle,
  //   currentHandle,
  //   title: collection.title,
  //   productsCount: collection.products?.nodes?.length || 0,
  // });

  // Force re-render when handle changes - this ensures the component completely resets
  const [componentKey, setComponentKey] = useState(currentHandle);

  useEffect(() => {
    if (currentHandle !== componentKey) {
      console.log('Handle changed, forcing component re-render:', {
        old: componentKey,
        new: currentHandle,
      });
      setComponentKey(currentHandle);
    }
  }, [currentHandle, componentKey]);

  // Emergency fallback: if the collection data doesn't match the URL, force a reload
  useEffect(() => {
    if (
      currentHandle &&
      collection.handle &&
      currentHandle !== collection.handle
    ) {
      console.warn('Collection data mismatch detected, forcing page reload:', {
        urlHandle: currentHandle,
        dataHandle: collection.handle,
      });
      // Give it a brief moment to see if React Router catches up, then reload
      setTimeout(() => {
        if (currentHandle !== collection.handle) {
          window.location.reload();
        }
      }, 500);
    }
  }, [currentHandle, collection.handle]);

  // Loading state for better UX
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isCollectionChanging, setIsCollectionChanging] = useState(false);

  // Product pagination state
  const [allProducts, setAllProducts] = useState<ProductItemFragment[]>(
    collection.products.nodes,
  );
  const [pageInfo, setPageInfo] = useState(collection.products.pageInfo);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [totalProductCount, setTotalProductCount] = useState<number | null>(
    null,
  );

  // console.log("All collection products", allProducts)

  // Track the collection we last reset for. Initialized to the current one so
  // the reset does NOT run on the initial mount — that would wipe filters that
  // were rehydrated from the URL (shared links). Comparing identity (instead of
  // a render counter) also makes this safe against React StrictMode's
  // double-invoked effects in development.
  const lastCollectionKey = useRef(`${collection.id}-${collection.handle}`);

  // Reset state when collection changes (navigation between collections)
  useEffect(() => {
    const collectionKey = `${collection.id}-${collection.handle}`;
    if (lastCollectionKey.current === collectionKey) {
      return;
    }
    lastCollectionKey.current = collectionKey;

    setIsCollectionChanging(true);
    setAllProducts(collection.products.nodes);
    setPageInfo(collection.products.pageInfo);
    setIsLoadingMore(false);

    // Reset filters when collection changes
    setSearchTerm('');
    setSelectedSort('');
    setSelectedPrice(null);
    setSelectedSizes([]);
    setSelectedGenders([]);
    setSelectedBrands([]);
    setSelectedCategories([]);
    setSelectedDiscounts([]);

    // Scroll to top when collection changes
    if (productsScrollRef.current) {
      productsScrollRef.current.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }

    // Remove collection changing state after a brief delay
    setTimeout(() => {
      setIsCollectionChanging(false);
    }, 300);
  }, [collection.id, collection.handle]); // Depend on collection ID and handle

  // Remove initial loading state after component mounts
  useEffect(() => {
    setIsInitialLoad(false);
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

  // Filter states

  const [sortBy, setSortBy] = useState('');
  const [selectedPriceRange, setSelectedPriceRange] = useState('');

  const [selectedBrand, setSelectedBrand] = useState('');

  const [searchTerm, setSearchTerm] = useState(() => searchParams.get('q') || '');
  const [selectedSort, setSelectedSort] = useState(
    () => searchParams.get('sort') || '',
  );
  const [selectedGenders, setSelectedGenders] = useState<string[]>(() =>
    searchParams.getAll('gender'),
  );
  const [selectedDiscounts, setSelectedDiscounts] = useState<string[]>(() =>
    searchParams.getAll('discount'),
  );
  const [selectedPrice, setSelectedPrice] = useState<{
    label: string;
    min: number;
    max: number;
  } | null>(() => {
    const label = searchParams.get('price');
    return label ? priceRanges.find((p) => p.label === label) ?? null : null;
  });
  const [selectedBrands, setSelectedBrands] = useState<string[]>(() =>
    searchParams.getAll('brand'),
  );
  const [selectedSizes, setSelectedSizes] = useState<string[]>(() =>
    searchParams.getAll('size'),
  );
  const [selectedCategories, setSelectedCategories] = useState<Category[]>(
    () => searchParams.getAll('category') as Category[],
  );

  // Mobile drawer state
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Ref for products scroll container
  const productsScrollRef = useRef<HTMLDivElement>(null);
  const collectionTitleRef = useRef<HTMLDivElement>(null);

  // Load more products function
  // In your collections.$handle.tsx, replace the loadMoreProducts function

  // Load more products function
  const loadMoreProducts = async () => {
    if (!pageInfo.hasNextPage || isLoadingMore || !pageInfo.endCursor) return;

    setIsLoadingMore(true);
    try {
      // Properly encode the cursor parameter
      const params = new URLSearchParams({
        cursor: pageInfo.endCursor,
        first: '24',
      });

      const response = await fetch(
        `/api/collections/${collection.handle}/products?${params}`,
      );

      if (!response.ok) {
        // Try to get the error message from the response
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          typeof errorData === 'object' &&
          errorData !== null &&
          'error' in errorData
            ? (errorData as {error?: string}).error
            : 'Failed to fetch more products';
        throw new Error(errorMessage);
      }

      const data = (await response.json()) as {
        products: ProductItemFragment[];
        pageInfo: typeof pageInfo;
      };

      // Only update state if we're still on the same collection
      if (collection.handle) {
        setAllProducts((prev) => [...prev, ...data.products]);
        setPageInfo(data.pageInfo);
      }
    } catch (error) {
      console.error('Error loading more products:', error);

      // If it's an invalid cursor error, reset pagination
      if (error instanceof Error && error.message.includes('Invalid cursor')) {
        console.log('Invalid cursor detected, resetting pagination...');
        setPageInfo((prev) => (prev ? {...prev, hasNextPage: false} : prev));
      }
    } finally {
      setIsLoadingMore(false);
    }
  };
  // Intersection Observer for infinite scroll
  const [loadMoreRef, setLoadMoreRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!loadMoreRef || !pageInfo.hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreProducts();
        }
      },
      {threshold: 0.1},
    );

    observer.observe(loadMoreRef);

    return () => observer.disconnect();
  }, [loadMoreRef, pageInfo.hasNextPage, isLoadingMore]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileFilterOpen) {
      document.body.classList.add('drawer-open');
    } else {
      document.body.classList.remove('drawer-open');
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('drawer-open');
    };
  }, [isMobileFilterOpen]);

  // Scroll to top of products when filters change
  useEffect(() => {
    if (productsScrollRef.current) {
      productsScrollRef.current.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  }, [
    searchTerm,
    selectedBrand,
    selectedPriceRange,
    selectedSizes,
    selectedGenders,
    selectedDiscounts,
    sortBy,
  ]);

  // Sync active filters into the URL so the current view is shareable.
  // Opening a shared link rehydrates the filters from these params (above).
  useEffect(() => {
    const next = new URLSearchParams();

    if (searchTerm) next.set('q', searchTerm);
    if (selectedSort) next.set('sort', selectedSort);
    if (selectedPrice) next.set('price', selectedPrice.label);
    selectedBrands.forEach((b) => next.append('brand', b));
    selectedSizes.forEach((s) => next.append('size', s));
    selectedDiscounts.forEach((d) => next.append('discount', d));
    selectedGenders.forEach((g) => next.append('gender', g));
    selectedCategories.forEach((c) => next.append('category', c));

    // Only update history if something actually changed, to avoid loops.
    if (next.toString() !== searchParams.toString()) {
      setSearchParams(next, {replace: true, preventScrollReset: true});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    searchTerm,
    selectedSort,
    selectedPrice,
    selectedBrands,
    selectedSizes,
    selectedDiscounts,
    selectedGenders,
    selectedCategories,
  ]);

  // Extract available brands from products
  const availableBrands = useMemo(() => {
    const brands = new Set<string>();
    allProducts.forEach((product: any) => {
      if (product.vendor) {
        brands.add(product.vendor);
      }
    });
    return Array.from(brands).sort();
  }, [allProducts]);

  const CATEGORY_TAGS = {
    CLOTHING: 'CLOTHING',
    SHOES: 'SHOES',
    ACCESSORIES: 'ACCESSORIES',
  } as const;

  type Category = keyof typeof CATEGORY_TAGS;

  const categories: Category[] = useMemo(() => {
    if (!Array.isArray(allProducts)) return [];

    return Array.from(
      new Set(
        allProducts.flatMap((p) =>
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
  }, [allProducts]);

  // Unique brands
  const brands = Array.from(
    new Set(
      allProducts
        .map((p) => p.vendor)
        .filter((v): v is string => typeof v === 'string'),
    ),
  ).sort();

  // Unique sizes
  const allSizes: string[] = Array.from(
    new Set(
      allProducts.flatMap((p) =>
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
  const filteredCollectionProducts = allProducts
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

      // Category filter (derived from tags)
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

  // Extract available sizes from products
  const availableSizes = useMemo(() => {
    const sizes = new Set<string>();
    allProducts.forEach((product: any) => {
      product.variants?.nodes?.forEach((variant: any) => {
        variant.selectedOptions?.forEach((option: any) => {
          if (option.name.toLowerCase() === 'size') {
            sizes.add(option.value);
          }
        });
      });
    });
    return Array.from(sizes).sort();
  }, [allProducts]);

  // Scroll to top of products when filters change
  // useEffect(() => {
  //   const hasFilters =
  //     searchTerm ||
  //     selectedBrand ||
  //     selectedPriceRange ||
  //     selectedSizes.length > 0 ||
  //     selectedGenders.length > 0 ||
  //     selectedDiscounts.length > 0 ||
  //     sortBy;

  //   if (hasFilters) {
  //     // Scroll to the collection title with offset
  //     if (collectionTitleRef.current) {
  //       const element = collectionTitleRef.current;
  //       const elementPosition =
  //         element.getBoundingClientRect().top + window.pageYOffset;
  //       const offsetPosition = elementPosition - 64;

  //       window.scrollTo({
  //         top: offsetPosition,
  //         behavior: 'smooth',
  //       });
  //     } else if (productsScrollRef.current) {
  //       productsScrollRef.current.scrollIntoView({
  //         behavior: 'smooth',
  //         block: 'start',
  //       });
  //     } else {
  //       // Fallback: scroll window to top
  //       window.scrollTo({
  //         top: 40,
  //         behavior: 'smooth',
  //       });
  //     }
  //   }
  // }, [
  //   searchTerm,
  //   selectedBrand,
  //   selectedPriceRange,
  //   selectedSizes,
  //   selectedGenders,
  //   selectedDiscounts,
  //   sortBy,
  // ]);

  // Calculate active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchTerm) count++;
    if (selectedBrands.length > 0) count++;
    if (selectedPrice) count++;
    if (selectedSizes.length > 0) count++;
    if (selectedGenders.length > 0) count++;
    if (selectedDiscounts.length > 0) count++;
    if (selectedCategories.length > 0) count++;
    if (selectedSort) count++;
    return count;
  }, [
    searchTerm,
    selectedBrands,
    selectedPrice,
    selectedSizes,
    selectedGenders,
    selectedDiscounts,
    selectedCategories,
    selectedSort,
  ]);

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedSort('');
    setSelectedPrice(null);
    setSelectedSizes([]);
    setSelectedGenders([]);
    setSelectedBrands([]);
    setSelectedCategories([]);
    setSelectedDiscounts([]);

    // Scroll to collection title with offset after clearing filters
    if (collectionTitleRef.current) {
      const element = collectionTitleRef.current;
      const elementPosition =
        element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - 24;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    } else if (productsScrollRef.current) {
      productsScrollRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    } else {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };

  // Handler functions
  const handleSizeToggle = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size],
    );
  };

  const handleGenderToggle = (gender: string) => {
    setSelectedGenders((prev) =>
      prev.includes(gender)
        ? prev.filter((g) => g !== gender)
        : [...prev, gender],
    );
  };

  const handleDiscountToggle = (discount: string) => {
    setSelectedDiscounts((prev) =>
      prev.includes(discount)
        ? prev.filter((d) => d !== discount)
        : [...prev, discount],
    );
  };

  return (
    <div key={`${collection.id}-${componentKey}`} className="">
      {/* Mobile Section */}
      <div className="flex-1 flex flex-col justify-center h-full lg:ml-96">
        <div className=" relative w-full ">
          {/* Mobile: Sticky Header with collection title and Filters button inside scrollable area */}
          <div className="md:hidden flex fixed items-center justify-between top-38  h-14 z-10 bg-white text-black shadow-sm left-1/2 transform -translate-x-1/2 w-full max-w-lg px-4">
            <h1 className="text-lg font-bold truncate">{collection.title}</h1>
            <button
              className="py-2 px-4 bg-black text-white rounded-md text-sm font-medium flex items-center gap-2 hover:bg-gray-800 transition-colors shadow-md"
              onClick={() => setIsMobileFilterOpen(true)}
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
              Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer Overlay */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden mobile-filter-drawer">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity backdrop-enter"
            onClick={() => setIsMobileFilterOpen(false)}
          />

          {/* Drawer */}
          <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl transform transition-transform drawer-enter flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b shrink-0">
              <h3 className="text-lg font-semibold">Filters</h3>
              <button
                className="p-2 hover:bg-gray-100 rounded-md"
                onClick={() => setIsMobileFilterOpen(false)}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Mobile Filter Content - Now Scrollable */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* Search Mobile Drawer*/}
              <FiltersMobileDrawer
                filteredProducts={filteredCollectionProducts}
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
                onClose={() => setIsMobileFilterOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Entire Desktop Layout for Products and sidebar Filters  */}
      <div className="flex w-full  overflow-hidden">
        {/* 🧭 Desktop Sidebar (independent scroll) */}
        {/* 🧭 Sidebar - Sticky & Independent Scroll */}
              <div className="hidden md:flex  ">
                <div className="fixed top-42 h-[440px] 2xl:h-[600px] overflow-y-auto p-4">
                  <FiltersSidebar
                    filteredProducts={filteredCollectionProducts}
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
        {/* 🛍️ Products Section (independent scroll) */}
        <div className="flex flex-col mt-50 md:mt-44 2xl:ml-[350px] lg:ml-[330px]  overflow-hidden">
          {/* Sticky header for mobile */}
          {/* <div className="md:hidden flex justify-between items-center px-4 shadow-sm bg-[#111111] sticky top-20 z-20">
            <h1 className="text-lg font-bold truncate">{collection.title}</h1>
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="py-2 px-4 bg-white text-black rounded-md text-sm font-medium flex items-center gap-2 hover:bg-gray-800 transition"
            >
              Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </button>
          </div> */}

          {/* Scrollable products grid */}
          <div
            ref={productsScrollRef}
            className="flex-1 overflow-y-auto smooth-scroll px-4 md:px-8 py-6 relative"
          >
            {/* Loading overlay */}
            {isCollectionChanging && (
              <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10">
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="animate-spin w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
                  Loading collection...
                </div>
              </div>
            )}

            {/* ✅ Products grid */}
            {filteredCollectionProducts.length > 0 ? (
              <>
                <div className="products-grid grid gap-6 sm:grid-cols-2 md:grid-cols-3 mb-12 xl:grid-cols-4 2xl:grid-cols-5">
                  {filteredCollectionProducts.map(
                    (product: any, index: number) => (
                      <ProductItem
                        key={product.id}
                        product={product}
                        loading="eager"
                      />
                    ),
                  )}
                </div>

                {pageInfo.hasNextPage && (
                  <div
                    ref={setLoadMoreRef}
                    className="py-8 flex justify-center"
                  >
                    {isLoadingMore ? (
                      <div className="flex items-center gap-2 text-gray-600">
                        <div className="animate-spin w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
                        Loading more products...
                      </div>
                    ) : (
                      <button
                        onClick={loadMoreProducts}
                        className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition"
                      >
                        Load More Products
                      </button>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <p className="text-gray-500 text-lg mb-2">
                  No products found matching your filters.
                </p>
                <p className="text-gray-400 mb-4">
                  Try adjusting your filters to see more products.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Analytics.CollectionView
        data={{
          collection: {
            id: collection.id,
            handle: collection.handle,
          },
        }}
      />
    </div>
  );
}

const PRODUCT_ITEM_FRAGMENT = `#graphql
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
` as const;

// Query to fetch collection info only
const COLLECTION_INFO_QUERY = `#graphql
  query CollectionInfo(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
    }
  }
` as const;

// Query to fetch products from a collection with pagination
// In your collections.$handle.tsx, update the COLLECTION_PRODUCTS_QUERY
// Query to fetch products from a collection with pagination
const COLLECTION_PRODUCTS_QUERY = `#graphql
  ${PRODUCT_ITEM_FRAGMENT}
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
` as const;

// NOTE: https://shopify.dev/docs/api/storefront/2022-04/objects/collection
const COLLECTION_QUERY = `#graphql
  ${PRODUCT_ITEM_FRAGMENT}
  query Collection(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      products(
        first: $first,
        last: $last,
        before: $startCursor,
        after: $endCursor
      ) {
        nodes {
          ...ProductItem
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          endCursor
          startCursor
        }
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
    dresses: collection(handle: "xmas-dresses") {
      ...FeaturedCollection
    }
    tops: collection(handle: "womens-tops2") {
      ...FeaturedCollection
    }
    loungewear: collection(handle: "loungewear") {
      ...FeaturedCollection
    }
    accessories: collection(handle: "womens-accessories") {
      ...FeaturedCollection
    }
  }
` as const;
