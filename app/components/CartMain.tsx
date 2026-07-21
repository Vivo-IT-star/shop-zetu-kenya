import {useOptimisticCart, CartForm, Image} from '@shopify/hydrogen';
import {Link} from 'react-router';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {CartLineItem} from '~/components/CartLineItem';
import {CartSummary} from './CartSummary';
// import {Progress} from '../../app/components/ui/progress';

import {useState} from 'react';
import {useCartUpsellProducts} from '~/lib/contexts/CartUpsellProductsContext';
import {AddToCartButton} from './AddToCartButton';

export type CartLayout = 'page' | 'aside';

export type CartMainProps = {
  cart: CartApiQueryFragment | null;
  layout: CartLayout;
};

/**
 * The main cart component that displays the cart items and summary.
 * It is used by both the /cart route and the cart aside dialog.
 */
export function CartMain({layout, cart: originalCart}: CartMainProps) {
  // The useOptimisticCart hook applies pending actions to the cart
  // so the user immediately sees feedback when they modify the cart.
  const cart = useOptimisticCart(originalCart);
  const [toastMessage, setToastMessage] = useState('');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const {close} = useAside();
  const {products, loading, error} = useCartUpsellProducts();

  // // Render loading state
  // if (loading) {
  //   return (
  //     <div className="cart-main-loading">
  //       <h2 className="text-lg font-bold mb-2">Related Products</h2>
  //       <div className="grid grid-cols-2 gap-4">
  //         {[...Array(4)].map((_, i) => (
  //           <div key={i} className="product-card">
  //             <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
  //             <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-32"></div>
  //           </div>
  //         ))}
  //       </div>
  //     </div>
  //   );
  // }

  // // Render error state
  // if (error) {
  //   return (
  //     <div className="cart-main-error text-black">
  //       <p>Error loading products: {error.message}</p>
  //     </div>
  //   );
  // }

  // // Render empty state
  // if (!products.length) {
  //   return (
  //     <div className="cart-main-empty">
  //       <p>No related products found</p>
  //     </div>
  //   );
  // }

  const FREE_SHIPPING_GOAL = 10000;
  const subtotal = Math.round(Number(cart?.cost?.subtotalAmount?.amount)) || 0;
  //console.log('Cart Subtotal:', subtotal);
  const progressPercent = Math.min((subtotal / FREE_SHIPPING_GOAL) * 100, 100);
  const isFreeShippingUnlocked = subtotal >= FREE_SHIPPING_GOAL;

  const linesCount = Boolean(cart?.lines?.nodes?.length || 0);
  const withDiscount =
    cart &&
    Boolean(cart?.discountCodes?.filter((code) => code.applicable)?.length);
  // const className = `cart-main ${withDiscount ? 'with-discount' : ''}`;
  const cartHasItems = cart?.totalQuantity ? cart.totalQuantity > 0 : false;

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4 h-auto md:h-[calc(100vh-64px)] overflow-y-auto">
      {/* left desktop */}
      {/* <div className="cart-upsell-products hidden lg:block pb-96 lg:pb-0 flex-1 md:max-h-[calc(100vh-var(--cart-aside-recommended-height))] md:overflow-y-auto">
        <h2 className="text-lg font-bold mb-2">
          Additional Items You May Like
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {products.map((product) => {
            const variantId = product?.variants?.nodes?.[0]?.id;
            if (!variantId) return null;

            const isLoading = loadingId === product.id;

            return (
              <div key={product.id} className="items-center flex flex-col mr-2">
                <Link
                  to={`/products/${product.handle}`}
                  onClick={close}
                  className="block mb-2"
                  prefetch="intent"
                >
                  {product.images?.nodes?.[0] ? (
                    <div className="w-full bg-gray-100 flex items-center justify-center overflow-hidden rounded-lg">
                      <Image
                        src={product.images.nodes[0].url}
                        alt={product.images.nodes[0].altText || product.title}
                        sizes="(min-width: 45em) 300px, 100vw"
                        className="h-full w-full aspect-9/16 object-cover"
                      />
                    </div>
                  ) : (
                    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-32 flex items-center justify-center">
                      <span>No image</span>
                    </div>
                  )}
                  <p className="line-clamp-2 ">{product.title}</p>
                </Link>

                <AddToCartButton
                  lines={[{merchandiseId: variantId, quantity: 1}]}
                  onClick={async () => {
                    setLoadingId(product.id);
                    try {
                      // If AddToCartButton does not handle the actual add, you may need to call your add-to-cart logic here.
                      // Otherwise, just handle UI feedback.
                      setToastMessage(`${product.title} added to cart`);
                    } finally {
                      setLoadingId(null);
                      setTimeout(() => setToastMessage(''), 2000);
                    }
                  }}
                >
                  <span className="inline-block bg-black text-white lg:px-6 rounded text-sm">
                    {isLoading ? 'Adding...' : 'Add to Cart'}
                  </span>
                </AddToCartButton>
              </div>
            );
          })}
        </div>
      </div> */}

      {/* right */}
      <div className="cart-main flex-1 pr-2 ">
        {/* {cartHasItems && (
          <div className="sticky top-0 left-0 right-0 pb-2 bg-white">
            <p
              className={`mb-2 mx-4 text-center font-semibold ${isFreeShippingUnlocked ? 'text-green-600' : 'text-purple-700'}`}
            >
              {isFreeShippingUnlocked ? (
                <>
                  🎉 Hurray! You earned <strong>Free Shipping!<br /> (On Your Prepaid Orders)</strong>
                </>
              ) : (
                <>
                  Spend <strong>KSh {FREE_SHIPPING_GOAL - subtotal}</strong>{' '}
                  more and get <br />
                  Free Shipping on your Prepaid Orders!
                </>
              )}
            </p>
            <Progress
              aria-label="Free shipping progress"
              className="max-w-md"
              color={isFreeShippingUnlocked ? 'success' : 'secondary'}
              value={progressPercent}
            />
          </div>
        )} */}

        <div
          className="fixed md:hidden top-3 left-1/2 transform -translate-x-1/2  bg-green-600 text-white px-4 py-2 shadow-lg z-50"
          onClick={close}
        >
          Continue Shopping
        </div>

        <CartEmpty hidden={linesCount} layout={layout} />
        {toastMessage && (
          <div className="fixed top-3 left-1/2 transform -translate-x-1/2 w-full bg-green-600 text-white px-4 py-2 shadow-lg z-50">
            {toastMessage}
          </div>
        )}
        <div className="cart-details">
          <div aria-labelledby="cart-lines">
            <ul>
              {(cart?.lines?.nodes ?? []).map((line) => (
                <CartLineItem key={line.id} line={line} layout={layout} />
              ))}
            </ul>

            {/* Mobile Additional items */}
            {/* <div className="cart-upsell-products pb-2 lg:hidden flex-1 md:max-h-[calc(100vh-var(--cart-aside-recommended-height))] md:overflow-y-auto">
              <h2 className="text-lg font-bold mb-2">
                Additional Items You May Like
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {products.map((product) => {
                  const variantId = product?.variants?.nodes?.[0]?.id;
                  if (!variantId) return null;

                  const isLoading = loadingId === product.id;

                  return (
                    <div
                      key={product.id}
                      className="items-center flex flex-col "
                    >
                      <Link
                        to={`/products/${product.handle}`}
                        onClick={close}
                        className="block mb-2  "
                        prefetch="intent"
                      >
                        {product.images?.nodes?.[0] ? (
                          <div className="w-full bg-gray-100 flex items-center justify-center overflow-hidden rounded-lg">
                            <Image
                              src={product.images.nodes[0].url}
                              alt={
                                product.images.nodes[0].altText || product.title
                              }
                              className="h-full w-full aspect-9/16 object-cover"
                              sizes="(min-width: 45em) 300px, 100vw"
                            />
                            
                          </div>
                        ) : (
                          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-32 flex items-center justify-center">
                            <span>No image</span>
                          </div>
                        )}
                        <p className="text-sm line-clamp-2">{product.title}</p>
                      </Link>

                      <AddToCartButton
                        lines={[{merchandiseId: variantId, quantity: 1}]}
                        onClick={async () => {
                          setLoadingId(product.id);
                          try {
                            // If AddToCartButton does not handle the actual add, you may need to call your add-to-cart logic here.
                            // Otherwise, just handle UI feedback.
                            setToastMessage(`${product.title} added to cart`);
                          } finally {
                            setLoadingId(null);
                            setTimeout(() => setToastMessage(''), 2000);
                          }
                        }}
                      >
                        <span className="inline-block text-white px-12 lg:py-2 rounded text-sm">
                          {isLoading ? 'Adding...' : 'Add'}
                        </span>
                      </AddToCartButton>
                    </div>
                  );
                })}
              </div>
            </div> */}
          </div>
          {cartHasItems && <CartSummary cart={cart} layout={layout} />}
        </div>
      </div>
    </div>
  );
}

function CartEmpty({
  hidden = false,
}: {
  hidden: boolean;
  layout?: CartMainProps['layout'];
}) {
  const {close} = useAside();
  return (
    <div hidden={hidden}>
      <br />
      <p>
        Looks like you haven&rsquo;t added anything yet, let&rsquo;s get you
        started!
      </p>
      <br />
      {/* <Link to="/collections" onClick={close} prefetch="viewport" className='px-4 py-2 border text-white rounded hover:bg-lime-400 transition-colors'>
        Continue shopping →
      </Link>
     */}
    </div>
  );
}