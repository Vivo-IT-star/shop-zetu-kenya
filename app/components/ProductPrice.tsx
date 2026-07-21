import {Money} from '@shopify/hydrogen';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';

export function ProductPrice({
  price,
  compareAtPrice,
}: {
  price?: MoneyV2;
  compareAtPrice?: MoneyV2 | null;
}) {
  // Only show compare price if it exists, is greater than 0, and is higher than current price
  const shouldShowComparePrice = compareAtPrice && 
    parseFloat(compareAtPrice.amount) > 0 && 
    price && 
    parseFloat(compareAtPrice.amount) > parseFloat(price.amount);

  return (
    <div className="product-price mb-4 text-black">
      {shouldShowComparePrice ? (
        <div className="product-price-on-sale flex items-center gap-2">
          {price ? (
            <span className="font-bold ">
              <Money data={price} />
            </span>
          ) : null}
          <s className="text-[#C20000] font-bold">
            <Money data={compareAtPrice} />
          </s>
        </div>
      ) : price ? (
        <span className="font-bold ">
          <Money data={price} />
        </span>
      ) : (
        <span>&nbsp;</span>
      )}
    </div>
  );
}
