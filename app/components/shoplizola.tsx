import React, {useState, useEffect, useMemo, useRef} from 'react';
import {useLizolaProducts} from '~/lib/contexts/LizolaProductsContext';
import {Link} from 'react-router';
import LizolaHeroBanners from '~/components/LizolaHeroBanners';
import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {useLoaderData} from 'react-router';

export async function loader({context}: LoaderFunctionArgs) {
  return {collections: []};
}

const ShopLizola = () => {
  // Wishlist logic
  const { isWishlisted, toggleWishlist } = require('~/lib/contexts/WishlistContext').useWishlist();
  const {products, loading, error, pageInfo, loadMoreProducts, isLoadingMore} = useLizolaProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [selectedPriceRange, setSelectedPriceRange] = useState('');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedDiscounts, setSelectedDiscounts] = useState<string[]>([]);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const productsScrollRef = useRef<HTMLDivElement>(null);
  const shopTitleRef = useRef<HTMLDivElement>(null);
  const [isLoadingMoreState, setIsLoadingMoreState] = useState(false);
  const [allProducts, setAllProducts] = useState(products);
  const [pageInfoState, setPageInfoState] = useState(pageInfo);
  const [loadMoreRef, setLoadMoreRef] = useState<HTMLDivElement | null>(null);

  const firstRowRef = useRef<HTMLDivElement | null>(null);


  useEffect(() => {
    setAllProducts(products);
    setPageInfoState(pageInfo);
    setIsLoadingMoreState(false);
    setSearchTerm('');
    setSortBy('');
    setSelectedPriceRange('');
    setSelectedSizes([]);
    setSelectedGenders([]);
    setSelectedBrand('');
    setSelectedDiscounts([]);
    if (productsScrollRef.current) {
      productsScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [products]);

  useEffect(() => {
    if (!loadMoreRef || !pageInfoState?.hasNextPage) return;
    const observer = new window.IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        handleLoadMoreProducts();
      }
    }, { threshold: 0.1 });
    observer.observe(loadMoreRef);
    return () => observer.disconnect();
  }, [loadMoreRef, pageInfoState?.hasNextPage, isLoadingMoreState]);

  useEffect(() => {
    if (isMobileFilterOpen) {
      document.body.classList.add('drawer-open');
    } else {
      document.body.classList.remove('drawer-open');
    }
    return () => {
      document.body.classList.remove('drawer-open');
    };
  }, [isMobileFilterOpen]);

  useEffect(() => {
    if (productsScrollRef.current) {
      productsScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [searchTerm, selectedBrand, selectedPriceRange, selectedSizes, selectedGenders, selectedDiscounts, sortBy]);

  const availableBrands = useMemo(() => {
    const brands = new Set<string>();
    allProducts.forEach((product: any) => {
      if (product.vendor) brands.add(product.vendor);
    });
    return Array.from(brands).sort();
  }, [allProducts]);

  const availableSizes = useMemo(() => {
    const sizes = new Set<string>();
    allProducts.forEach((product: any) => {
      product.variants?.nodes?.forEach((variant: any) => {
        variant.selectedOptions?.forEach((option: any) => {
          if (option.name.toLowerCase() === 'size') sizes.add(option.value);
        });
      });
    });
    return Array.from(sizes).sort();
  }, [allProducts]);

  const filteredProducts = useMemo(() => {
    const hasFilters = searchTerm || selectedBrand || selectedPriceRange || selectedSizes.length > 0 || selectedGenders.length > 0 || selectedDiscounts.length > 0 || sortBy;
    if (!hasFilters) return allProducts;
    let filtered = [...allProducts];
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((product: any) =>
        product.title.toLowerCase().includes(searchLower) ||
        product.tags?.some((tag: string) => tag.toLowerCase().includes(searchLower)),
      );
    }
    if (selectedBrand) {
      filtered = filtered.filter((product: any) => product.vendor === selectedBrand);
    }
    if (selectedPriceRange) {
      filtered = filtered.filter((product: any) => {
        const price = parseFloat(product.priceRange.minVariantPrice.amount);
        switch (selectedPriceRange) {
          case 'KES 0 - 1000': return price >= 0 && price <= 1000;
          case 'KES 1001 - 2000': return price > 1000 && price <= 2000;
          case 'KES 2001 - 4000': return price > 2000 && price <= 4000;
          case 'KES 4001 - 6000': return price > 4000 && price <= 6000;
          case 'KES 6000+': return price > 6000;
          default: return true;
        }
      });
    }
    if (selectedSizes.length > 0) {
      filtered = filtered.filter((product: any) =>
        product.variants?.nodes?.some((variant: any) =>
          variant.selectedOptions?.some((option: any) =>
            option.name.toLowerCase() === 'size' && selectedSizes.includes(option.value),
          ),
        ),
      );
    }
    if (selectedGenders.length > 0) {
      filtered = filtered.filter((product: any) =>
        selectedGenders.some((gender) =>
          product.tags?.some((tag: string) => tag.toLowerCase().includes(gender.toLowerCase())),
        ),
      );
    }
    if (selectedDiscounts.length > 0) {
      filtered = filtered.filter((product: any) => {
        const hasDiscount = product.variants?.nodes?.some((variant: any) => {
          const compareAtPrice = variant?.compareAtPrice?.amount;
          if (!compareAtPrice) return false;
          const price = parseFloat(variant?.price?.amount || '0');
          const compare = parseFloat(compareAtPrice);
          const discountPercentage = compare > price ? ((compare - price) / compare) * 100 : 0;
          return selectedDiscounts.some((range) => {
            if (range === '0-10%') return discountPercentage >= 0 && discountPercentage <= 10;
            if (range === '11-20%') return discountPercentage > 10 && discountPercentage <= 20;
            if (range === '21-30%') return discountPercentage > 20 && discountPercentage <= 30;
            if (range === '31-50%') return discountPercentage > 30 && discountPercentage <= 50;
            if (range === '50%+') return discountPercentage > 50;
            return false;
          });
        });
        return hasDiscount;
      });
    }
    if (sortBy) {
      filtered.sort((a: any, b: any) => {
        switch (sortBy) {
          case 'price-asc': return parseFloat(a.priceRange.minVariantPrice.amount) - parseFloat(b.priceRange.minVariantPrice.amount);
          case 'price-desc': return parseFloat(b.priceRange.minVariantPrice.amount) - parseFloat(a.priceRange.minVariantPrice.amount);
          case 'name-asc': return a.title.localeCompare(b.title);
          case 'name-desc': return b.title.localeCompare(a.title);
          case 'newest': return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
          default: return 0;
        }
      });
    }
    return filtered;
  }, [allProducts, searchTerm, selectedBrand, selectedPriceRange, selectedSizes, selectedGenders, selectedDiscounts, sortBy]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchTerm) count++;
    if (selectedBrand) count++;
    if (selectedPriceRange) count++;
    if (selectedSizes.length > 0) count++;
    if (selectedGenders.length > 0) count++;
    if (selectedDiscounts.length > 0) count++;
    return count;
  }, [searchTerm, selectedBrand, selectedPriceRange, selectedSizes, selectedGenders, selectedDiscounts]);

  const clearAllFilters = () => {
    setSearchTerm('');
    setSortBy('');
    setSelectedPriceRange('');
    setSelectedSizes([]);
    setSelectedGenders([]);
    setSelectedBrand('');
    setSelectedDiscounts([]);
    if (shopTitleRef.current) {
      const element = shopTitleRef.current;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - 24;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    } else if (productsScrollRef.current) {
      productsScrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSizeToggle = (size: string) => {
    setSelectedSizes((prev) => prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]);
  };
  const handleGenderToggle = (gender: string) => {
    setSelectedGenders((prev) => prev.includes(gender) ? prev.filter((g) => g !== gender) : [...prev, gender]);
  };
  const handleDiscountToggle = (discount: string) => {
    setSelectedDiscounts((prev) => prev.includes(discount) ? prev.filter((d) => d !== discount) : [...prev, discount]);
  };

  const handleLoadMoreProducts = async () => {
    if (!pageInfoState?.hasNextPage || isLoadingMoreState) return;
    setIsLoadingMoreState(true);
    try {
      await loadMoreProducts();
    } catch (error) {
      // handle error
    } finally {
      setIsLoadingMoreState(false);
    }
  };

  

  if (loading) {
    return <div className="text-center my-8">Loading products...</div>;
  }
  if (error) {
    return <div className="text-red-600">Error loading products: {error.message}</div>;
  }
  if (!products.length) {
    return <div>No products available</div>;
  }

  return (
    <div className="flex flex-col w-full">
      <div className="w-full">
        <LizolaHeroBanners />
      </div>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Desktop Filter Sidebar - Hidden on Mobile with Fixed Position */}
        <div className="hidden lg:block lg:fixed lg:left-4 lg:top-47 lg:w-80 lg:h-[calc(100vh-200px)] lg:z-10 w-80 h-screen flex-shrink-0">
          <div className="bg-white border rounded-lg h-full flex flex-col">
            <div className="flex-1 overflow-y-auto p-6 filter-scroll smooth-scroll">
              <div className="mb-6">
                <label className="block text-lg font-bold mb-2">Lizola Shop</label>
                <input type="text" placeholder="Search this shop..." className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Sort by</label>
                <select className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="">Featured</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                  <option value="name-asc">Name: A to Z</option>
                  <option value="name-desc">Name: Z to A</option>
                </select>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Price Range</label>
                <div className="space-y-2">
                  {['KES 0 - 1000', 'KES 1001 - 2000', 'KES 2001 - 4000', 'KES 4001 - 6000', 'KES 6000+'].map((range) => (
                    <label key={range} className="flex items-center cursor-pointer">
                      <input type="radio" name="price" className="mr-2 text-blue-600 focus:ring-blue-500" checked={selectedPriceRange === range} onChange={() => setSelectedPriceRange(selectedPriceRange === range ? '' : range)} />
                      <span className="text-sm">{range}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Sizes</label>
                <div className="grid grid-cols-3 gap-2">
                  {(availableSizes.length > 0 ? availableSizes : ['XS', 'S', 'M', 'L', 'XL', 'XXL']).map((size) => (
                    <label key={size} className={`flex items-center justify-center p-2 border rounded cursor-pointer transition-colors ${selectedSizes.includes(size) ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'}`}>
                      <input type="checkbox" className="sr-only" checked={selectedSizes.includes(size)} onChange={() => handleSizeToggle(size)} />
                      <span className="text-sm">{size}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Gender</label>
                <div className="space-y-2">
                  {['Men', 'Women', 'Kids', 'Unisex'].map((gender) => (
                    <label key={gender} className="flex items-center cursor-pointer">
                      <input type="checkbox" className="mr-2 text-blue-600 focus:ring-blue-500 rounded" checked={selectedGenders.includes(gender)} onChange={() => handleGenderToggle(gender)} />
                      <span className="text-sm">{gender}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Brand</label>
                <select className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)}>
                  <option value="">All Brands</option>
                  {availableBrands.map((brand) => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Discount</label>
                <div className="space-y-2">
                  {['0-10%', '11-20%', '21-30%', '31-50%', '50%+'].map((discount) => (
                    <label key={discount} className="flex items-center cursor-pointer">
                      <input type="checkbox" className="mr-2 text-blue-600 focus:ring-blue-500 rounded" checked={selectedDiscounts.includes(discount)} onChange={() => handleDiscountToggle(discount)} />
                      <span className="text-sm">{discount}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 border-t">
              <button className="w-full py-2 px-4 bg-black text-white rounded-md hover:bg-green-600 transition-colors" onClick={clearAllFilters}>Clear All Filters</button>
            </div>
          </div>
        </div>
        {/* Products Section with Independent Scroll */}
        <div className="flex-1 flex flex-col lg:mt-8 h-full lg:ml-96">
          <div ref={shopTitleRef} className="-mt-2 lg:mt-8 md:hidden">
            <h1 className="text-2xl font-bold">Lizola Shop</h1>
          </div>
          <div ref={productsScrollRef} className="flex-1 overflow-y-auto products-scroll smooth-scroll relative">
            {filteredProducts.length > 0 ? (
              <>
                <div className="products-grid">
                  {filteredProducts.map((product: any, index: number) => {
                    const variant = product?.variants?.nodes?.[0];
                    const image = product?.featuredImage;
                    const price = parseFloat(product.priceRange.minVariantPrice.amount || '0');
                    const compareAt = parseFloat(variant?.compareAtPrice?.amount || '0');
                    const discount = compareAt && compareAt > price ? Math.round(((compareAt - price) / compareAt) * 100) : null;
                    const isWished = isWishlisted(product.id);
                    return (
                      <div key={product.id} className="bg-white rounded-lg transition relative">
                        {/* Wishlist Heart Icon - top left */}
                        <button
                          type="button"
                          aria-label={isWished ? 'Remove from wishlist' : 'Add to wishlist'}
                          className="absolute top-2 left-2 z-10 bg-white/80 rounded-full p-2 shadow hover:bg-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWishlist({
                              id: product.id,
                              handle: product.handle,
                              title: product.title,
                              image: image?.url ?? '',
                              price: price.toString(),
                              compareAtPrice: compareAt ? compareAt.toString() : undefined
                            });
                          }}
                        >
                          {isWished ? (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="#C20000" viewBox="0 0 24 24" width="28" height="28">
                              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#C20000" strokeWidth="2" viewBox="0 0 24 24" width="28" height="28">
                              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                          )}
                        </button>
                        {/* Discount Tag - top right */}
                        {discount && (
                          <span className="absolute top-2 right-2 text-xs bg-orange-100 text-orange-600 font-semibold px-2 py-0.5 rounded">-{discount}%</span>
                        )}
                        <Link to={`/products/${product.handle}`} className="block" prefetch="intent">
                          <div className="relative w-full h-full rounded-lg mb-2 px-2 gap-4 flex flex-col" style={{borderRadius: '8px'}}>
                            {image ? (
                              <img src={image.url} alt={image.altText || product.title} className="max-w-full max-h-full object-contain" />
                            ) : (
                              <div className="text-sm text-gray-400">No image</div>
                            )}
                            <div className="">
                              {product.tags?.includes('NEXT-DAY-DELIVERY') && (
                                <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Next-Day Delivery</span>
                              )}
                              {(product.tags?.includes('EXPRESS SHIPPING') || product.tags?.includes('EXPRESS  SHIPPING')) && (
                                <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded mt-1">Express Shipping</span>
                              )}
                            </div>
                            <div className="text-sm line-clamp-1">{product.title}</div>
                            <div className="text-sm flex items-center justify-start gap-4 -mt-2 font-bold mb-4">KSh {price.toLocaleString()} {compareAt > price && (<span className="text-xs text-gray-400 line-through">KSh {compareAt.toLocaleString()}</span>)}</div>
                          </div>
                        </Link>
                      </div>
                    );
                  })}
                </div>
                {/* Infinite Scroll Trigger */}
                {pageInfoState?.hasNextPage && (
                  <div ref={setLoadMoreRef} className="py-8 flex justify-center">
                    {isLoadingMoreState ? (
                      <div className="flex items-center gap-2 text-gray-600">
                        <div className="animate-spin w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
                        Loading more products...
                      </div>
                    ) : (
                      <button onClick={handleLoadMoreProducts} className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition-colors">Load More Products</button>
                    )}
                  </div>
                )}
                {isLoadingMoreState && (
                  <div className="products-grid">
                    {Array.from({length: 8}).map((_, index) => (
                      <div key={`skeleton-${index}`} className="animate-pulse">
                        <div className="bg-gray-200 aspect-square rounded mb-3"></div>
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg mb-4">No products found matching your filters.</p>
                <p className="text-gray-400">Try adjusting your filters to see more products.</p>
                <button className="mt-4 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors" onClick={clearAllFilters}>Clear All Filters</button>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Mobile Filter Drawer Overlay */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden mobile-filter-drawer">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity backdrop-enter" onClick={() => setIsMobileFilterOpen(false)} />
          <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl transform transition-transform drawer-enter flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
              <h3 className="text-lg font-semibold">Filters</h3>
              <button className="p-2 hover:bg-gray-100 rounded-md" onClick={() => setIsMobileFilterOpen(false)}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="mb-6">
                <label className="block text-lg font-bold mb-2">Lizola Shop</label>
                <input type="text" placeholder="Search this shop..." className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Sort by</label>
                <select className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="">Featured</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                  <option value="name-asc">Name: A to Z</option>
                  <option value="name-desc">Name: Z to A</option>
                </select>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-3">Price Range</label>
                <div className="space-y-3">
                  {['KES 0 - 1000', 'KES 1001 - 2000', 'KES 2001 - 4000', 'KES 4001 - 6000', 'KES 6000+'].map((range) => (
                    <label key={range} className="flex items-center cursor-pointer">
                      <input type="radio" name="price" className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300" checked={selectedPriceRange === range} onChange={() => setSelectedPriceRange(selectedPriceRange === range ? '' : range)} />
                      <span className="ml-3 text-sm">{range}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-3">Sizes</label>
                <div className="grid grid-cols-3 gap-2">
                  {(availableSizes.length > 0 ? availableSizes : ['XS', 'S', 'M', 'L', 'XL', 'XXL']).map((size) => (
                    <label key={size} className={`flex items-center justify-center p-2 border rounded-md cursor-pointer transition-colors ${selectedSizes.includes(size) ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'}`}>
                      <input type="checkbox" className="sr-only" checked={selectedSizes.includes(size)} onChange={() => handleSizeToggle(size)} />
                      <span className="text-sm font-medium">{size}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-3">Gender</label>
                <div className="space-y-3">
                  {['Men', 'Women', 'Kids', 'Unisex'].map((gender) => (
                    <label key={gender} className="flex items-center cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" checked={selectedGenders.includes(gender)} onChange={() => handleGenderToggle(gender)} />
                      <span className="ml-3 text-sm">{gender}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Brand</label>
                <select className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)}>
                  <option value="">All Brands</option>
                  {availableBrands.map((brand) => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-3">Discount</label>
                <div className="space-y-3">
                  {['0-10%', '11-20%', '21-30%', '31-50%', '50%+'].map((discount) => (
                    <label key={discount} className="flex items-center cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" checked={selectedDiscounts.includes(discount)} onChange={() => handleDiscountToggle(discount)} />
                      <span className="ml-3 text-sm">{discount}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="border-t p-4 space-y-3 flex-shrink-0">
              <button className="w-full py-3 px-4 bg-gray-100 text-black rounded-md hover:bg-gray-200 transition-colors font-medium" onClick={clearAllFilters}>Clear All Filters</button>
              <button className="w-full py-3 px-4 bg-black text-white rounded-md hover:bg-gray-800 transition-colors font-medium" onClick={() => setIsMobileFilterOpen(false)}>Show {filteredProducts.length} Products</button>
            </div>
          </div>
        </div>
      )}
      {/* Mobile: Sticky row with shop title and Filters button inside scrollable area */}
      <div className="lg:hidden flex fixed items-center justify-between top-32 h-14 z-10 bg-white shadow-sm left-1/2 transform -translate-x-1/2 w-full max-w-lg px-4">
        <h1 className="text-lg font-bold truncate">Lizola Shop</h1>
        <button className="py-2 px-4 bg-black text-white rounded-md text-sm font-medium flex items-center gap-2 hover:bg-gray-800 transition-colors shadow-md" onClick={() => setIsMobileFilterOpen(true)}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
          </svg>
          Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
        </button>
      </div>
    </div>
  );
};

export default ShopLizola;
