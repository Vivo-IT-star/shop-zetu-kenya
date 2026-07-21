import {Product} from '@shopify/hydrogen/storefront-api-types';
import {createContext, useContext, useState, useEffect} from 'react';

interface CartUpsellProductsType {
  products: Product[];
  loading: boolean;
  error: Error | null;
}

const CartUpsellProducts = createContext<CartUpsellProductsType | null>(null);

export function CartUpsellProductsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        //console.log('Fetching products from API...');
        // const response = await fetch('/api/cart-upsell-products');
        const response = await fetch('/api/cart-upsell-products?handle=vivo-collection');

        // Check if response is ok first
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Get response text first to check if it's valid JSON
        const responseText = await response.text();
        //console.log('Raw response:', responseText); returns products

        let data: unknown;
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`);
        }

        //console.log('Parsed API response:', data); returns products

        if (
          typeof data === 'object' &&
          data !== null &&
          'products' in data &&
          Array.isArray((data as any).products)
        ) {
          setProducts((data as {products: Product[]}).products);
          // console.log(
          //   'Products set in context:',
          //   (data as {products: Product[]}).products,
          // ); 250 products in context
        } else {
          throw new Error('Invalid response format: missing products array');
        }
      } catch (err) {
        console.error('Error in fetchProducts:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  return (
    <CartUpsellProducts.Provider value={{products, loading, error}}>
      {children}
    </CartUpsellProducts.Provider>
  );
}

export function useCartUpsellProducts() {
  const context = useContext(CartUpsellProducts);
  if (!context) {
    throw new Error(
      'useCartProducts must be used within a CartProductsProvider',
    );
  }
  return context;
}
