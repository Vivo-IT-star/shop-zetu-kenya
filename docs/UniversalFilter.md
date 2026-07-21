# Universal Filter Component Documentation

The `UniversalFilter` component is a reusable filter system that can be used across different collection pages in your Shopify Hydrogen store. It provides comprehensive filtering and sorting functionality for products.

## Features

- **Search**: Text-based product search
- **Brand Filtering**: Filter by product vendors/brands
- **Price Range**: Filter by price ranges
- **Size Filtering**: Filter by available sizes
- **Gender Filtering**: Filter by gender categories
- **Discount Filtering**: Filter by discount percentages
- **Sorting**: Multiple sorting options (price, name, date)
- **URL State Management**: Maintains filter state in URL parameters
- **Mobile Responsive**: Includes mobile-friendly filter drawer
- **Customizable Options**: Configurable filter options per page

## Usage

### Basic Implementation

```tsx
import UniversalFilter, {ExtendedProduct} from '~/components/UniversalFilter';
import {useProductFilter} from '~/hooks/useProductFilter';

function YourCollectionPage() {
  const {products} = useYourProductsLoader(); // Your products data
  const {filteredProducts, handleFilteredProductsChange} = useProductFilter(
    products as ExtendedProduct[]
  );

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Filter Sidebar */}
      <UniversalFilter
        products={products as ExtendedProduct[]}
        onFilteredProductsChange={handleFilteredProductsChange}
        className="w-64"
        showSearch={true}
        options={{
          sortOptions: [
            {label: 'Price: Low to High', value: 'price-asc'},
            {label: 'Price: High to Low', value: 'price-desc'},
            {label: 'Newest First', value: 'newest'},
            {label: 'Oldest First', value: 'oldest'},
          ],
          priceRanges: [
            {label: 'Under KES 1000', min: 0, max: 1000},
            {label: 'KES 1000 - 3000', min: 1000, max: 3000},
            {label: 'Over KES 3000', min: 3000, max: Infinity},
          ],
        }}
      />

      {/* Products Grid */}
      <div className="flex-1">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
```

### Advanced Configuration

```tsx
<UniversalFilter
  products={products}
  onFilteredProductsChange={handleFilteredProductsChange}
  showSearch={true}
  options={{
    // Custom sort options
    sortOptions: [
      {label: 'Price: Low to High', value: 'price-asc'},
      {label: 'Price: High to Low', value: 'price-desc'},
      {label: 'Name: A to Z', value: 'name-asc'},
      {label: 'Name: Z to A', value: 'name-desc'},
      {label: 'Newest First', value: 'newest'},
      {label: 'Oldest First', value: 'oldest'},
    ],
    
    // Custom price ranges
    priceRanges: [
      {label: 'Under KES 500', min: 0, max: 500},
      {label: 'KES 500 - 1500', min: 500, max: 1500},
      {label: 'KES 1500 - 3000', min: 1500, max: 3000},
      {label: 'KES 3000 - 5000', min: 3000, max: 5000},
      {label: 'Over KES 5000', min: 5000, max: Infinity},
    ],
    
    // Custom gender options
    genders: ['Women', 'Men', 'Kids', 'Unisex'],
    
    // Custom discount ranges
    discountRanges: ['0-10%', '11-25%', '26-50%', '50%+'],
    
    // Pre-defined brands (optional - auto-detected if not provided)
    brands: ['Nike', 'Adidas', 'Puma', 'Reebok'],
    
    // Pre-defined sizes (optional - auto-detected if not provided)
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  }}
/>
```

## Props

### UniversalFilter Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `products` | `ExtendedProduct[]` | Required | Array of products to filter |
| `onFilteredProductsChange` | `(products: ExtendedProduct[]) => void` | Required | Callback when filtered products change |
| `options` | `FilterOptions` | `{}` | Configuration options for filters |
| `showSearch` | `boolean` | `true` | Whether to show search input |
| `className` | `string` | `''` | Additional CSS classes |

### FilterOptions

| Option | Type | Description |
|--------|------|-------------|
| `brands` | `string[]` | Custom brand list (auto-detected if not provided) |
| `sizes` | `string[]` | Custom size list (auto-detected if not provided) |
| `genders` | `string[]` | Gender categories for filtering |
| `priceRanges` | `{label: string, min: number, max: number}[]` | Price range options |
| `discountRanges` | `string[]` | Discount percentage ranges |
| `sortOptions` | `{label: string, value: string}[]` | Sort options |

## Filter State Management

The component automatically manages filter state and syncs with URL parameters:

- **URL Persistence**: All filter states are saved to URL parameters
- **Deep Linking**: Users can share filtered URLs
- **Browser Navigation**: Back/forward buttons work with filter state

### URL Parameters

| Parameter | Description | Example |
|-----------|-------------|---------|
| `search` | Search query | `?search=dress` |
| `brand` | Selected brand | `?brand=Nike` |
| `sort` | Sort option | `?sort=price-asc` |
| `sizes` | Selected sizes | `?sizes=M,L,XL` |
| `discount` | Discount ranges | `?discount=0-10%,11-20%` |
| `gender` | Gender filters | `?gender=Women,Men` |
| `min` & `max` | Price range | `?min=1000&max=3000` |

## Product Data Requirements

The component works with the `ExtendedProduct` type which extends `ProductItemFragment`:

```tsx
type ExtendedProduct = ProductItemFragment & {
  vendor?: string;           // Brand/vendor information
  createdAt?: string;        // For date-based sorting
  variants?: {
    nodes?: Array<{
      price?: {amount: string, currencyCode: string};
      compareAtPrice?: {amount: string, currencyCode: string};
      selectedOptions?: Array<{name: string, value: string}>;
    }>;
  };
};
```

### Brand Detection

Brands are detected from:
1. `product.vendor` property
2. Product tags starting with "Brand:" (e.g., "Brand:Nike")
3. Product tags that match known brand names

### Size Detection

Sizes are detected from variant options where `option.name.toLowerCase() === 'size'`.

## Styling

The component uses Tailwind CSS classes and is fully responsive:

- **Desktop**: Fixed sidebar layout
- **Mobile**: Overlay drawer with filter options

### Custom Styling

You can customize the appearance by:
1. Passing additional CSS classes via the `className` prop
2. Modifying the component's internal Tailwind classes
3. Using CSS overrides for specific selectors

## Examples

### E-commerce Collection Page

```tsx
// app/routes/($locale).collections.$handle.tsx
import UniversalFilter, {ExtendedProduct} from '~/components/UniversalFilter';
import {useProductFilter} from '~/hooks/useProductFilter';

export default function Collection() {
  const {collection} = useLoaderData<typeof loader>();
  const {filteredProducts, handleFilteredProductsChange} = useProductFilter(
    collection.products.nodes as ExtendedProduct[]
  );

  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-col md:flex-row gap-8">
        <UniversalFilter
          products={collection.products.nodes as ExtendedProduct[]}
          onFilteredProductsChange={handleFilteredProductsChange}
          className="w-full md:w-64"
        />
        
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-6">{collection.title}</h1>
          <ProductGrid products={filteredProducts} />
        </div>
      </div>
    </div>
  );
}
```

### Search Results Page

```tsx
// app/routes/($locale).search.tsx
export default function Search() {
  const {searchResults} = useLoaderData<typeof loader>();
  const {filteredProducts, handleFilteredProductsChange} = useProductFilter(
    searchResults as ExtendedProduct[]
  );

  return (
    <div className="flex gap-8">
      <UniversalFilter
        products={searchResults as ExtendedProduct[]}
        onFilteredProductsChange={handleFilteredProductsChange}
        showSearch={false} // Hide search since this is a search results page
        options={{
          sortOptions: [
            {label: 'Relevance', value: 'relevance'},
            {label: 'Price: Low to High', value: 'price-asc'},
            {label: 'Price: High to Low', value: 'price-desc'},
          ],
        }}
      />
      
      <div className="flex-1">
        <SearchResults products={filteredProducts} />
      </div>
    </div>
  );
}
```

## Best Practices

1. **Performance**: For large product catalogs, consider implementing server-side filtering
2. **SEO**: Use the URL state management for SEO-friendly filtered pages
3. **Analytics**: Track filter usage to understand customer behavior
4. **Accessibility**: The component includes proper ARIA labels and keyboard navigation
5. **Loading States**: Implement loading states when switching between filter options

## Migration from Existing Filters

To migrate from existing custom filter implementations:

1. Replace your existing filter components with `UniversalFilter`
2. Update your product data structure to match `ExtendedProduct`
3. Use the `useProductFilter` hook for state management
4. Configure filter options to match your current functionality
5. Update any custom styling to work with the new component structure
