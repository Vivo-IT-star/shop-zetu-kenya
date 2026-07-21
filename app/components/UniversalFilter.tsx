import React, {useState, useEffect, useMemo} from 'react';
import {ProductItemFragment} from 'storefrontapi.generated';

export type FilterState = {
  search: string;
  sort: string;
  brand: string;
  sizes: string[];
  discount: string[];
  priceRange: {min: number; max: number} | null;
  gender: string[];
};

export type FilterOptions = {
  brands?: string[];
  sizes?: string[];
  genders?: string[];
  priceRanges?: Array<{label: string; min: number; max: number}>;
  discountRanges?: string[];
  sortOptions?: Array<{label: string; value: string}>;
};

// Extended product type that may include vendor property
export type ExtendedProduct = ProductItemFragment & {
  vendor?: string;
  createdAt?: string;
  variants?: {
    nodes?: Array<{
      availableForSale?: boolean;
      price?: {amount: string; currencyCode: string};
      compareAtPrice?: {amount: string; currencyCode: string};
      selectedOptions?: Array<{name: string; value: string}>;
    }>;
  } | ProductItemFragment['variants'];
};

type UniversalFilterProps = {
  products: ExtendedProduct[];
  onFilteredProductsChange: (products: ExtendedProduct[]) => void;
  options?: FilterOptions;
  showSearch?: boolean;
  className?: string;
};

const DEFAULT_SORT_OPTIONS = [
  {label: 'Price: Low to High', value: 'price-asc'},
  {label: 'Price: High to Low', value: 'price-desc'},
  {label: 'Newest: New to Old', value: 'newest'},
  {label: 'Oldest: Old to New', value: 'oldest'},
  {label: 'Name: A to Z', value: 'name-asc'},
  {label: 'Name: Z to A', value: 'name-desc'},
];

const DEFAULT_SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const DEFAULT_GENDER_OPTIONS = ['Women', 'Men', 'Kids', 'Unisex'];
const DEFAULT_DISCOUNT_OPTIONS = ['0-10%', '11-20%', '21-30%', '31-50%', '50%+'];
const DEFAULT_PRICE_RANGES = [
  {label: 'KES 0 - 1000', min: 0, max: 1000},
  {label: 'KES 1001 - 2000', min: 1001, max: 2000},
  {label: 'KES 2001 - 4000', min: 2001, max: 4000},
  {label: 'KES 4001 - 6000', min: 4001, max: 6000},
  {label: 'KES 6000+', min: 6000, max: Infinity},
];

export const UniversalFilter: React.FC<UniversalFilterProps> = ({
  products,
  onFilteredProductsChange,
  options = {},
  showSearch = true,
  className = '',
}) => {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    sort: '',
    brand: '',
    sizes: [],
    discount: [],
    priceRange: null,
    gender: [],
  });

  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Extract unique brands from products
  const availableBrands = useMemo(() => {
    if (options.brands) return options.brands;
    const brands = new Set<string>();
    
    products.forEach((product) => {
      // Check vendor property if available
      if (product.vendor) {
        brands.add(product.vendor);
      }
      
      // Check tags for brand information
      product.tags?.forEach((tag) => {
        if (tag.startsWith('Brand:')) {
          brands.add(tag.replace('Brand:', ''));
        }
      });
    });
    
    return Array.from(brands).filter(Boolean);
  }, [products, options.brands]);

  // Extract available sizes from products
  const availableSizes = useMemo(() => {
    if (options.sizes) return options.sizes;
    const sizes = new Set<string>();
    products.forEach((product) => {
      product.variants?.nodes?.forEach((variant) => {
        variant.selectedOptions?.forEach((option) => {
          if (option.name.toLowerCase() === 'size') {
            sizes.add(option.value);
          }
        });
      });
    });
    return Array.from(sizes).sort();
  }, [products, options.sizes]);

  // URL state management
  useEffect(() => {
    const params = new URLSearchParams();

    if (filters.search) params.set('search', filters.search);
    if (filters.brand) params.set('brand', filters.brand);
    if (filters.sort) params.set('sort', filters.sort);
    if (filters.sizes.length) params.set('sizes', filters.sizes.join(','));
    if (filters.discount.length) params.set('discount', filters.discount.join(','));
    if (filters.gender.length) params.set('gender', filters.gender.join(','));
    if (filters.priceRange) {
      params.set('min', String(filters.priceRange.min));
      params.set('max', String(filters.priceRange.max));
    }

    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
    window.history.replaceState({}, '', newUrl);
  }, [filters]);

  // Reset filters when products change (i.e., when navigating to a new collection)
  useEffect(() => {
    // Clear URL parameters and reset filters when products change
    window.history.replaceState({}, '', window.location.pathname);
    setFilters({
      search: '',
      brand: '',
      sort: '',
      sizes: [],
      discount: [],
      gender: [],
      priceRange: null,
    });
  }, [products]);

  // Initialize from URL (only on mount)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);

    const savedSearch = urlParams.get('search') || '';
    const savedBrand = urlParams.get('brand') || '';
    const savedSort = urlParams.get('sort') || '';
    const savedSizes = urlParams.get('sizes')?.split(',').filter(Boolean) || [];
    const savedDiscount = urlParams.get('discount')?.split(',').filter(Boolean) || [];
    const savedGender = urlParams.get('gender')?.split(',').filter(Boolean) || [];

    const min = urlParams.get('min');
    const max = urlParams.get('max');
    const savedPriceRange = min && max ? {min: Number(min), max: Number(max)} : null;

    // Only set filters if there are actual URL parameters
    if (urlParams.toString()) {
      setFilters({
        search: savedSearch,
        brand: savedBrand,
        sort: savedSort,
        sizes: savedSizes,
        discount: savedDiscount,
        gender: savedGender,
        priceRange: savedPriceRange,
      });
    }
  }, []); // Only run on mount

  // Apply filters
  useEffect(() => {
    let filteredProducts = [...products];

    // Search filter
    if (filters.search) {
      filteredProducts = filteredProducts.filter((product) =>
        product.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        product.tags?.some((tag) => 
          tag.toLowerCase().includes(filters.search.toLowerCase())
        )
      );
    }

    // Brand filter
    if (filters.brand) {
      filteredProducts = filteredProducts.filter((product) => 
        product.vendor === filters.brand ||
        product.tags?.some((tag) => 
          tag === `Brand:${filters.brand}` || 
          tag === filters.brand
        )
      );
    }

    // Gender filter
    if (filters.gender.length) {
      filteredProducts = filteredProducts.filter((product) =>
        filters.gender.some((gender) =>
          product.tags?.some((tag) => 
            tag.toLowerCase().includes(gender.toLowerCase())
          )
        )
      );
    }

    // Size filter
    if (filters.sizes.length) {
      filteredProducts = filteredProducts.filter((product) =>
        product.variants?.nodes?.some((variant) =>
          variant.selectedOptions?.some(
            (option) =>
              option.name.toLowerCase() === 'size' && 
              filters.sizes.includes(option.value)
          )
        )
      );
    }

    // Discount filter
    if (filters.discount.length) {
      filteredProducts = filteredProducts.filter((product) => {
        // Check if product has variants with compareAtPrice
        const hasDiscount = product.variants?.nodes?.some((variant: any) => {
          const compareAtPrice = variant?.compareAtPrice?.amount;
          if (!compareAtPrice) return false;
          
          const price = parseFloat(variant?.price?.amount || '0');
          const compare = parseFloat(compareAtPrice);
          const discountPercentage = compare > price ? ((compare - price) / compare) * 100 : 0;

          return filters.discount.some((range) => {
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

    // Price range filter
    if (filters.priceRange) {
      filteredProducts = filteredProducts.filter((product) => {
        const price = parseFloat(product.priceRange.minVariantPrice.amount);
        return price >= filters.priceRange!.min && price <= filters.priceRange!.max;
      });
    }

    // Sorting
    if (filters.sort) {
      filteredProducts.sort((a, b) => {
        const priceA = parseFloat(a.priceRange.minVariantPrice.amount);
        const priceB = parseFloat(b.priceRange.minVariantPrice.amount);

        switch (filters.sort) {
          case 'price-asc':
            return priceA - priceB;
          case 'price-desc':
            return priceB - priceA;
          case 'name-asc':
            return a.title.localeCompare(b.title);
          case 'name-desc':
            return b.title.localeCompare(a.title);
          case 'newest':
            // Assuming products have a createdAt field or are already sorted by newest
            return 0; // Keep original order for newest
          case 'oldest':
            // Reverse order for oldest
            return 0; // Keep original order for oldest
          default:
            return 0;
        }
      });
    }

    onFilteredProductsChange(filteredProducts);
  }, [filters, products, onFilteredProductsChange]);

  const clearAllFilters = () => {
    setFilters({
      search: '',
      sort: '',
      brand: '',
      sizes: [],
      discount: [],
      priceRange: null,
      gender: [],
    });
  };

  const updateFilter = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    setFilters((prev) => ({...prev, [key]: value}));
  };

  const toggleArrayFilter = <K extends keyof Pick<FilterState, 'sizes' | 'discount' | 'gender'>>(
    key: K,
    value: string
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: (prev[key] as string[]).includes(value)
        ? (prev[key] as string[]).filter((item) => item !== value)
        : [...(prev[key] as string[]), value],
    }));
  };

  const sortOptions = options.sortOptions || DEFAULT_SORT_OPTIONS;
  const sizeOptions = availableSizes.length ? availableSizes : (options.sizes || DEFAULT_SIZE_OPTIONS);
  const genderOptions = options.genders || DEFAULT_GENDER_OPTIONS;
  const discountOptions = options.discountRanges || DEFAULT_DISCOUNT_OPTIONS;
  const priceRanges = options.priceRanges || DEFAULT_PRICE_RANGES;

  return (
    <>
      {/* Mobile Filter Button */}
      <div className="md:hidden sticky top-10 z-30 bg-white px-2 py-2 shadow mb-4">
        <button
          className="w-full p-2 border rounded text-center text-sm bg-gray-100 hover:bg-gray-200"
          onClick={() => setShowMobileFilters(true)}
        >
          🔍 Open Filters
        </button>
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
                  className="text-xl"
                >
                  ×
                </button>
              </div>
              <FilterContent
                filters={filters}
                updateFilter={updateFilter}
                toggleArrayFilter={toggleArrayFilter}
                clearAllFilters={clearAllFilters}
                availableBrands={availableBrands}
                sortOptions={sortOptions}
                sizeOptions={sizeOptions}
                genderOptions={genderOptions}
                discountOptions={discountOptions}
                priceRanges={priceRanges}
                showSearch={showSearch}
              />
            </div>
          </div>
        </div>
      )}

      {/* Desktop Filters */}
      <div className={`hidden md:block h-fit sticky top-24 ${className}`}>
        <FilterContent
          filters={filters}
          updateFilter={updateFilter}
          toggleArrayFilter={toggleArrayFilter}
          clearAllFilters={clearAllFilters}
          availableBrands={availableBrands}
          sortOptions={sortOptions}
          sizeOptions={sizeOptions}
          genderOptions={genderOptions}
          discountOptions={discountOptions}
          priceRanges={priceRanges}
          showSearch={showSearch}
        />
      </div>
    </>
  );
};

type FilterContentProps = {
  filters: FilterState;
  updateFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  toggleArrayFilter: <K extends keyof Pick<FilterState, 'sizes' | 'discount' | 'gender'>>(
    key: K,
    value: string
  ) => void;
  clearAllFilters: () => void;
  availableBrands: string[];
  sortOptions: Array<{label: string; value: string}>;
  sizeOptions: string[];
  genderOptions: string[];
  discountOptions: string[];
  priceRanges: Array<{label: string; min: number; max: number}>;
  showSearch: boolean;
};

const FilterContent: React.FC<FilterContentProps> = ({
  filters,
  updateFilter,
  toggleArrayFilter,
  clearAllFilters,
  availableBrands,
  sortOptions,
  sizeOptions,
  genderOptions,
  discountOptions,
  priceRanges,
  showSearch,
}) => {
  return (
    <div className="space-y-6">
      {/* Clear All Button */}
      <button
        className="w-full p-2 bg-gray-500 text-white rounded hover:bg-red-600 transition-colors"
        onClick={clearAllFilters}
      >
        Clear All Filters
      </button>

      {/* Search */}
      {showSearch && (
        <div>
          <label className="block font-semibold mb-2">Search</label>
          <input
            className="w-full p-2 border rounded"
            placeholder="Search products..."
            type="text"
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
          />
        </div>
      )}

      {/* Sort */}
      <div>
        <label className="block font-semibold mb-2">Sort By</label>
        <select
          className="w-full p-2 border rounded"
          onChange={(e) => updateFilter('sort', e.target.value)}
          value={filters.sort}
        >
          <option value="">None</option>
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Brand */}
      {availableBrands.length > 0 && (
        <div>
          <label className="block font-semibold mb-2">Brand</label>
          <div className="space-y-1">
            <label className="flex items-center">
              <input
                type="radio"
                name="brand"
                checked={filters.brand === ''}
                onChange={() => updateFilter('brand', '')}
              />
              <span className="ml-2">All Brands</span>
            </label>
            {availableBrands.map((brand) => (
              <label key={brand} className="flex items-center">
                <input
                  type="radio"
                  name="brand"
                  value={brand}
                  checked={filters.brand === brand}
                  onChange={() => updateFilter('brand', brand)}
                />
                <span className="ml-2">{brand}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Price Range */}
      <div>
        <label className="block font-semibold mb-2">Price Range</label>
        <select
          className="w-full p-2 border rounded"
          value={filters.priceRange ? `${filters.priceRange.min}-${filters.priceRange.max}` : ''}
          onChange={(e) => {
            const selected = e.target.value;
            if (!selected) {
              updateFilter('priceRange', null);
            } else {
              const [min, max] = selected.split('-').map(Number);
              updateFilter('priceRange', {min, max});
            }
          }}
        >
          <option value="">All Prices</option>
          {priceRanges.map((range) => (
            <option key={range.label} value={`${range.min}-${range.max}`}>
              {range.label}
            </option>
          ))}
        </select>
      </div>

      {/* Gender */}
      {genderOptions.length > 0 && (
        <div>
          <label className="block font-semibold mb-2">Gender</label>
          <div className="space-y-1">
            {genderOptions.map((gender) => (
              <label key={gender} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.gender.includes(gender)}
                  onChange={() => toggleArrayFilter('gender', gender)}
                />
                <span className="ml-2">{gender}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Size */}
      {sizeOptions.length > 0 && (
        <div>
          <label className="block font-semibold mb-2">Size</label>
          <div className="grid grid-cols-3 gap-2">
            {sizeOptions.map((size) => (
              <label key={size} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.sizes.includes(size)}
                  onChange={() => toggleArrayFilter('sizes', size)}
                />
                <span className="ml-1 text-sm">{size}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Discount */}
      <div>
        <label className="block font-semibold mb-2">Discount</label>
        <div className="space-y-1">
          {discountOptions.map((discount) => (
            <label key={discount} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.discount.includes(discount)}
                onChange={() => toggleArrayFilter('discount', discount)}
              />
              <span className="ml-2">{discount}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UniversalFilter;
