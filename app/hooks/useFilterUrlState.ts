import {useEffect, useState} from 'react';
import {useSearchParams} from 'react-router';
import type {Category} from '~/components/RadixDesktopFilters';

export interface PriceRange {
  label: string;
  min: number;
  max: number;
}

/**
 * Owns the shared product-filter state and keeps it in sync with the URL query
 * string so a filtered view is shareable: opening a link rehydrates the filters
 * from the params, and changing a filter writes the params back.
 *
 * Used by the collection-style "shop" routes (shop.vivo, shop.puma, ...).
 *
 * @param priceRanges the route's available price ranges, used to resolve the
 *   `price` param (stored as its label) back to the full {label,min,max} object.
 */
export function useFilterUrlState(priceRanges: PriceRange[]) {
  const [searchParams, setSearchParams] = useSearchParams();

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
  const [selectedPrice, setSelectedPrice] = useState<PriceRange | null>(() => {
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

  // Sync active filters into the URL so the current view is shareable.
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

    // Only touch history if something actually changed, to avoid loops.
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

  return {
    searchTerm,
    setSearchTerm,
    selectedSort,
    setSelectedSort,
    selectedGenders,
    setSelectedGenders,
    selectedDiscounts,
    setSelectedDiscounts,
    selectedPrice,
    setSelectedPrice,
    selectedBrands,
    setSelectedBrands,
    selectedSizes,
    setSelectedSizes,
    selectedCategories,
    setSelectedCategories,
  };
}
