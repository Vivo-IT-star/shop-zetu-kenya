import React from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import * as Checkbox from '@radix-ui/react-checkbox';
import * as RadioGroup from '@radix-ui/react-radio-group';
import {CheckIcon, ChevronDownIcon} from '@radix-ui/react-icons';

/* =======================
   Types & Constants
======================= */

interface PriceRange {
  label: string;
  min: number;
  max: number;
}

interface SortOption {
  label: string;
  value: string;
}

const CATEGORY_TAGS = {
  CLOTHING: 'CLOTHING',
  SHOES: 'SHOES',
  ACCESSORIES: 'ACCESSORIES',
} as const;

export type Category = keyof typeof CATEGORY_TAGS;

interface Props {
  filteredProducts: any[];

  searchTerm: string;
  setSearchTerm: (v: string) => void;

  brands: string[];
  selectedBrands: string[];
  setSelectedBrands: (v: string[]) => void;

  allSizes: string[];
  selectedSizes: string[];
  setSelectedSizes: (v: string[]) => void;

  sortOptions: SortOption[];
  selectedSort: string;
  setSelectedSort: (v: string) => void;

  priceRanges: PriceRange[];
  selectedPrice: PriceRange | null;
  setSelectedPrice: (v: PriceRange | null) => void;

  discountRanges: string[];
  selectedDiscounts: string[];
  setSelectedDiscounts: (v: string[]) => void;

  genders: string[];
  selectedGenders: string[];
  setSelectedGenders: (v: string[]) => void;

  categories?: Category[];
  selectedCategories: Category[];
  setSelectedCategories: (v: Category[]) => void;
}

/* =======================
   Component
======================= */

export const FiltersSidebar: React.FC<Props> = ({
  searchTerm,
  setSearchTerm,

  brands,
  selectedBrands,
  setSelectedBrands,

  allSizes,
  selectedSizes,
  setSelectedSizes,

  sortOptions,
  selectedSort,
  setSelectedSort,

  priceRanges,
  selectedPrice,
  setSelectedPrice,

  discountRanges,
  selectedDiscounts,
  setSelectedDiscounts,

  categories,
  selectedCategories,
  setSelectedCategories,
}) => {
  const handleClearAll = () => {
    setSearchTerm('');
    setSelectedBrands([]);
    setSelectedSizes([]);
    setSelectedCategories([]);
    setSelectedSort('');
    setSelectedPrice(null);
    setSelectedDiscounts([]);
  };

  const toggleValue = <T,>(arr: T[], value: T, setter: (v: T[]) => void) => {
    setter(
      arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
    );
  };

  return (
    <div
      className="hidden md:block rounded-lg p-4 h-full"
      style={{maxWidth: '300px', minWidth: '300px'}}
    >
      {/* Search */}
      <input
        type="text"
        placeholder="Search this collection..."
        className="w-full border rounded p-2 mb-4"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <Accordion.Root type="single" collapsible className="space-y-2">
        {/* Brand */}
        <Accordion.Item value="brand" className="border-b">
          <Accordion.Trigger className="flex justify-between w-full py-2 font-medium">
            Brand <ChevronDownIcon />
          </Accordion.Trigger>
          <Accordion.Content className="py-2 space-y-1">
            {brands.map((brand) => (
              <label key={brand} className="flex items-center space-x-2">
                <Checkbox.Root
                  checked={selectedBrands.includes(brand)}
                  onCheckedChange={() =>
                    toggleValue(selectedBrands, brand, setSelectedBrands)
                  }
                  className="w-4 h-4 border rounded flex items-center justify-center data-[state=checked]:bg-blue-500"
                >
                  <Checkbox.Indicator>
                    <CheckIcon className="w-3 h-3" />
                  </Checkbox.Indicator>
                </Checkbox.Root>
                <span>{brand}</span>
              </label>
            ))}
          </Accordion.Content>
        </Accordion.Item>

   
        {/* Size */}
        <Accordion.Item value="size" className="border-b">
          <Accordion.Trigger className="flex justify-between w-full py-2 font-medium">
            Size <ChevronDownIcon />
          </Accordion.Trigger>
          <Accordion.Content className="py-2 space-y-1">
            {allSizes.map((size) => (
              <label key={size} className="flex items-center space-x-2">
                <Checkbox.Root
                  checked={selectedSizes.includes(size)}
                  onCheckedChange={() =>
                    toggleValue(selectedSizes, size, setSelectedSizes)
                  }
                  className="w-4 h-4 border rounded flex items-center justify-center data-[state=checked]:bg-blue-500"
                >
                  <Checkbox.Indicator>
                    <CheckIcon className="w-3 h-3" />
                  </Checkbox.Indicator>
                </Checkbox.Root>
                <span>{size}</span>
              </label>
            ))}
          </Accordion.Content>
        </Accordion.Item>

        {/* Sort */}
        <Accordion.Item value="sort" className="border-b">
          <Accordion.Trigger className="flex justify-between w-full py-2 font-medium">
            Sort By <ChevronDownIcon />
          </Accordion.Trigger>
          <Accordion.Content className="py-2 space-y-1">
            <RadioGroup.Root
              value={selectedSort}
              onValueChange={setSelectedSort}
              className="flex flex-col space-y-1"
            >
              {sortOptions.map((opt) => (
                <label key={opt.value} className="flex items-center space-x-2">
                  <RadioGroup.Item
                    value={opt.value}
                    className="w-4 h-4 rounded-full border data-[state=checked]:bg-blue-500"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </RadioGroup.Root>
          </Accordion.Content>
        </Accordion.Item>

        {/* Price */}
        <Accordion.Item value="price" className="border-b">
          <Accordion.Trigger className="flex justify-between w-full py-2 font-medium">
            Price Range <ChevronDownIcon />
          </Accordion.Trigger>
          <Accordion.Content className="py-2 space-y-1">
            <RadioGroup.Root
              value={selectedPrice?.label || ''}
              onValueChange={(label) =>
                setSelectedPrice(
                  priceRanges.find((p) => p.label === label) ?? null,
                )
              }
              className="flex flex-col space-y-1"
            >
              {priceRanges.map((pr) => (
                <label key={pr.label} className="flex items-center space-x-2">
                  <RadioGroup.Item
                    value={pr.label}
                    className="w-4 h-4 rounded-full border data-[state=checked]:bg-blue-500"
                  />
                  <span>{pr.label}</span>
                </label>
              ))}
            </RadioGroup.Root>
          </Accordion.Content>
        </Accordion.Item>

        {/* Discount */}
        <Accordion.Item value="discount" className="border-b">
          <Accordion.Trigger className="flex justify-between w-full py-2 font-medium">
            Discount <ChevronDownIcon />
          </Accordion.Trigger>
          <Accordion.Content className="py-2 space-y-1">
            {discountRanges.map((range) => (
              <label key={range} className="flex items-center space-x-2">
                <Checkbox.Root
                  checked={selectedDiscounts.includes(range)}
                  onCheckedChange={() =>
                    toggleValue(selectedDiscounts, range, setSelectedDiscounts)
                  }
                  className="w-4 h-4 border rounded flex items-center justify-center data-[state=checked]:bg-blue-500"
                >
                  <Checkbox.Indicator>
                    <CheckIcon className="w-3 h-3" />
                  </Checkbox.Indicator>
                </Checkbox.Root>
                <span>{range}</span>
              </label>
            ))}
          </Accordion.Content>
        </Accordion.Item>


             {/* Category (Derived from Tags) */}
        {Array.isArray(categories) && categories.length > 0 && (
          <Accordion.Item value="category" className="border-b">
            <Accordion.Trigger className="flex justify-between w-full py-2 font-medium">
              Type <ChevronDownIcon />
            </Accordion.Trigger>
            <Accordion.Content className="py-2 space-y-1">
              {categories.map((category) => (
                <label key={category} className="flex items-center space-x-2">
                  <Checkbox.Root
                    checked={selectedCategories.includes(category)}
                    onCheckedChange={() =>
                      toggleValue(
                        selectedCategories,
                        category,
                        setSelectedCategories,
                      )
                    }
                    className="w-4 h-4 border rounded flex items-center justify-center data-[state=checked]:bg-blue-500"
                  >
                    <Checkbox.Indicator>
                      <CheckIcon className="w-3 h-3" />
                    </Checkbox.Indicator>
                  </Checkbox.Root>
                  <span>{category}</span>
                </label>
              ))}
            </Accordion.Content>
          </Accordion.Item>
        )}


      </Accordion.Root>

      <button
        onClick={handleClearAll}
        className="w-full mt-4 bg-black text-white font-medium py-2 rounded-lg"
      >
        Clear All Filters
      </button>
    </div>
  );
};
