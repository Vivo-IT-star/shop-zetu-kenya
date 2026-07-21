import {useState} from 'react';
import {ExtendedProduct} from '~/components/UniversalFilter';

export const useProductFilter = (initialProducts: ExtendedProduct[] = []) => {
  const [filteredProducts, setFilteredProducts] = useState<ExtendedProduct[]>(initialProducts);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  const handleFilteredProductsChange = (products: ExtendedProduct[]) => {
    setFilteredProducts(products);
  };

  const updateActiveFiltersCount = (count: number) => {
    setActiveFiltersCount(count);
  };

  return {
    filteredProducts,
    activeFiltersCount,
    handleFilteredProductsChange,
    updateActiveFiltersCount,
  };
};
