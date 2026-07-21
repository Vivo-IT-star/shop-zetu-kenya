import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {
  ProductItemFragment,
  CollectionItemFragment,
} from 'storefrontapi.generated';
import {useVariantUrl} from '~/lib/variants';
import {COLOR_MAP} from '~/lib/colorMap';
import {useState} from 'react';
import { useWishlist } from '~/lib/contexts/WishlistContext';

export function ShopsProductItem({
  product,
  loading,
}: {
  product: CollectionItemFragment | ProductItemFragment;
  loading?: 'eager' | 'lazy';
}) {
  const variantUrl = useVariantUrl(product.handle);
  const image = product.featuredImage;
  const [isHovered, setIsHovered] = useState(false);
  // Wishlist context
  const { isWishlisted, toggleWishlist } = useWishlist();

  // Get the first two images for hover effect
  const images = 'images' in product ? product.images?.nodes || [] : [];
  const secondImage = images.length > 1 ? images[1] : null;
  const displayImage = isHovered && secondImage ? secondImage : image;

  // ✅ Get unique color options (assuming 'Color' is the name of the option)
  const colorOptions =
    'variants' in product && product.variants?.nodes
      ? product.variants.nodes
          .map((v: any) =>
            'selectedOptions' in v
              ? v.selectedOptions.find(
                  (opt: {name: string; value: string}) => opt.name.toLowerCase() === 'color',
                )
              : undefined,
          )
          .filter((opt: any) => !!opt?.value)
          .map((opt: any) => opt!.value)
      : [];

  const uniqueColors = Array.from(new Set(colorOptions));

  // Get the first variant for compare price (similar to selectedVariant in product detail)
  const firstVariant = 'variants' in product && product.variants?.nodes ? product.variants.nodes[0] : null;

  // Calculate discount percentage
  const price = parseFloat(product.priceRange.minVariantPrice.amount);
  const compareAt = firstVariant?.compareAtPrice ? parseFloat(firstVariant.compareAtPrice.amount) : 0;
  const discountPercent = compareAt > price ? Math.round(((compareAt - price) / compareAt) * 100) : 0;

  return (
      <Link
        className="product-item relative transition-transform duration-200"
        key={product.id}
        prefetch="intent"
        to={variantUrl}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Heart Icon */}
        <button
          type="button"
          aria-label={isWishlisted(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
          className="absolute top-2 left-2 z-10 bg-white/80 rounded-full p-1 shadow hover:bg-white"
          onClick={e => {
            e.preventDefault();
            toggleWishlist({
              id: product.id,
              handle: product.handle,
              title: product.title,
              image: image?.url || '',
              price: product.priceRange?.minVariantPrice?.amount || '',
              compareAtPrice: firstVariant?.compareAtPrice?.amount || ''
            });
          }}
        >
        {isWishlisted(product.id) ? (
          <svg xmlns="http://www.w3.org/2000/svg" fill="#C20000" viewBox="0 0 24 24" width="24" height="24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#C20000" strokeWidth="2" viewBox="0 0 24 24" width="24" height="24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        )}
      </button>
        {displayImage && (
          <div className="" style={{position: 'relative', padding: 0, background: 'transparent', overflow: 'hidden'}}>
             <Image
                alt={displayImage.altText || product.title}
                data={displayImage}
                loading={loading}
                sizes="(min-width: 45em) 300px, 100vw"
                className="product-image"
                style={{padding: 0, margin: 0, width: '100%', objectFit: 'cover'}}
              />
            {discountPercent > 0 && (
              <span
                className="absolute top-2 right-2 bg-[#C20000] text-white text-xs font-bold px-2 py-1 rounded-full shadow"
                style={{zIndex: 2}}
              >
                -{discountPercent}%
              </span>
            )}
          </div>
        )}

  <div className="">
        {/* ✅ Render color swatches */}
        {/* <div className="flex items-center gap-4 mt-2"> 
          <div>
            {' '}
            {uniqueColors?.length > 0 && (
              <div className=" flex gap-2">
                {uniqueColors.map((color) => {
                  const normalizedColor = String(color).trim();
                  const swatchColor =
                    COLOR_MAP[normalizedColor] || normalizedColor.toLowerCase();

                  return (
                    <span
                      key={normalizedColor}
                      title={normalizedColor}
                      className="w-4 h-4 rounded-full border border-gray-300"
                      style={{backgroundColor: swatchColor}}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div> */}

        <div className="mt-2 flex justify-between">
          {/* {'tags' in product && product.tags.includes('NEXT-DAY-DELIVERY') && (
            <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
              Next-Day Delivery
            </span>
          )} */}
{/* 
          {'tags' in product && product.tags.includes('EXPRESS SHIPPING') && (
            <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
              Express Shipping
            </span>
          )} */}

          
          {'tags' in product && product.tags.includes('SIZE-UP') && (
            <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
              SIZE UP
            </span>
          )}

           {'tags' in product && product.tags.includes('TRUE TO SIZE') && (
            <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
              TRUE TO SIZE
            </span>
          )}

           {'tags' in product && product.tags.includes('GENUINE LEATHER') && (
            <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
              GENUINE LEATHER
            </span>
          )}
        </div>

        <h4 className="font-semibold line-clamp-2">{product.title}</h4>
       
        <div className="flex items-center gap-2">
          <small className="font-bold text-black">
            <Money data={product.priceRange.minVariantPrice} />
          </small>
          {firstVariant?.compareAtPrice && 
           parseFloat(firstVariant.compareAtPrice.amount) > 0 && 
           parseFloat(firstVariant.compareAtPrice.amount) > parseFloat(product.priceRange.minVariantPrice.amount) && (
            <small className="text-[#C20000] font-bold line-through">
              <Money data={firstVariant.compareAtPrice} />
            </small>
          )}
        </div>
      </div>
      </Link>
  
  );
}
