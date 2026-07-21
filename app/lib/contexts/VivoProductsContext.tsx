import {ProductItemFragment} from 'storefrontapi.generated';
import {createContext, useContext, useState, useEffect, useCallback} from 'react';

interface PageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}

interface VivoProductsContextType {
  products: ProductItemFragment[];
  loading: boolean;
  error: Error | null;
  pageInfo: PageInfo | null;
  loadMoreProducts: () => Promise<void>;
  isLoadingMore: boolean;
}

const VivoProducts = createContext<VivoProductsContextType | null>(null);

export function VivoProductsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [products, setProducts] = useState<ProductItemFragment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchInitialProducts = useCallback(async () => {
    try {
      setLoading(true);
      
      // console.log('[VivoProducts] Fetching initial products:', {
      //   endpoint: '/api/vivo_products',
      //   handle: 'vivo',
      //   first: 250
      // });
      const response = await fetch('/api/vivo_products?handle=vivo-collection&first=250');
        // console.log('[VivoProducts] Initial fetch response:', response);
      const data: unknown = await response.json();

      if (response.ok) {
        if (
          typeof data === 'object' &&
          data !== null &&
          'products' in data &&
          Array.isArray((data as any).products)
        ) {
          const responseData = data as {products: ProductItemFragment[]; pageInfo: PageInfo};
          setProducts(responseData.products);
          setPageInfo(responseData.pageInfo);
        } else {
          throw new Error('Invalid response format: missing products array');
        }
      } else {
        throw new Error(
          typeof data === 'object' && data !== null && 'error' in data
            ? (data as any).error
            : 'Failed to fetch products',
        );
      }
    } catch (err) {
      console.error('Error in fetchInitialProducts:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMoreProducts = useCallback(async () => {
    console.log('[VivoProducts] Pagination request:', {
      endpoint: '/api/vivo_products',
      handle: 'vivo',
      first: 250,
      cursor: pageInfo?.endCursor
    });
    
    if (!pageInfo?.hasNextPage || isLoadingMore || !pageInfo.endCursor) return;

    try {
      setIsLoadingMore(true);
      
      // Properly encode the cursor parameter
      const params = new URLSearchParams({
        handle: 'vivo-collection',
        first: '250',
        cursor: pageInfo.endCursor
      });
      
      const response = await fetch(`/api/vivo_products?${params}`);
      const data: unknown = await response.json();

      if (response.ok) {
        if (
          typeof data === 'object' &&
          data !== null &&
          'products' in data &&
          Array.isArray((data as any).products)
        ) {
          const responseData = data as {products: ProductItemFragment[]; pageInfo: PageInfo};
          setProducts(prev => [...prev, ...responseData.products]);
          setPageInfo(responseData.pageInfo);
          setError(null);
          console.log('Additional products loaded:', responseData.products.length);
        } else {
          throw new Error('Invalid response format: missing products array');
        }
      } else {
        // Try to get the error message from the response
        const errorMessage = typeof data === 'object' && data !== null && 'error' in data
          ? (data as any).error
          : 'Failed to load more products';
        throw new Error(errorMessage);
      }
    } catch (err) {
      console.error('Error loading more products:', err);
      
      // If it's an invalid cursor error, reset pagination
      if (err instanceof Error && err.message.includes('Invalid cursor')) {
        console.log('Invalid cursor detected, resetting pagination...');
        setPageInfo(prev => prev ? {...prev, hasNextPage: false} : null);
      }
      
      setError(err as Error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [pageInfo, isLoadingMore]);

  useEffect(() => {
    fetchInitialProducts();
  }, [fetchInitialProducts]);

  return (
    <VivoProducts.Provider value={{
      products, 
      loading, 
      error, 
      pageInfo, 
      loadMoreProducts, 
      isLoadingMore
    }}>
      {children}
    </VivoProducts.Provider>
  );
}

export function useVivoProducts() {
  const context = useContext(VivoProducts);
  if (!context) {
    throw new Error(
      'useVivoProducts must be used within a Vivo Products Provider',
    );
  }
  return context;
}