import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {
  ProductItemFragment,
  CollectionItemFragment,
} from 'storefrontapi.generated';
import {useVariantUrl} from '~/lib/variants';
import {COLOR_MAP} from '~/lib/colorMap';
import {useState} from 'react';

export function ProductItem({
  product,
  loading,
}: {
  product: CollectionItemFragment | ProductItemFragment;
  loading?: 'eager' | 'lazy';
}) {
  const variantUrl = useVariantUrl(product.handle);
  const image = product.featuredImage;
  const [isHovered, setIsHovered] = useState(false);

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
      className="product-item transition-transform duration-200"
      key={product.id}
      prefetch="intent"
      to={variantUrl}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {displayImage && (
        <div className="product-image-container" style={{position: 'relative', padding: 0}}>
          <Image
            alt={displayImage.altText || product.title}
            data={displayImage}
            loading={loading}
            sizes="(min-width: 45em) 300px, 100vw"
            className="product-image"
            style={{padding: 0, margin: 0, height: '100%', width: '100%', objectFit: 'cover'}}
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

        {/* <div className="my-2">
          {'tags' in product && product.tags.includes('NEXT-DAY-DELIVERY') && (
            <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
              Next-Day Delivery
            </span>
          )}

          {'tags' in product && product.tags.includes('EXPRESS SHIPPING') && (
            <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
              Express Shipping
            </span>
          )}
        </div> */}

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
