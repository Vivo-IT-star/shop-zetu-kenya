import React from "react";
import * as Accordion from "@radix-ui/react-accordion";
import * as Checkbox from "@radix-ui/react-checkbox";
import * as RadioGroup from "@radix-ui/react-radio-group";
import { CheckIcon, ChevronDownIcon } from "@radix-ui/react-icons";

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
  onClose: () => void; // close Drawer
}

export const FiltersMobileDrawer: React.FC<Props> = ({
  filteredProducts,
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
  genders,
  selectedGenders,
  setSelectedGenders,
    categories,
  selectedCategories,
  setSelectedCategories,
  onClose,
}) => {
  const handleClearAll = () => {
    setSelectedBrands([]);
    setSelectedSizes([]);
    setSelectedCategories([]);
    setSelectedSort("");
    setSelectedPrice(null);
    setSelectedDiscounts([]);
    setSelectedGenders([]);
    setSearchTerm("");
  };

  const toggleValue = (arr: string[], value: string, setter: (v: string[]) => void) => {
    setter(arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]);
  };

  const toggleCategory = (arr: Category[], value: Category, setter: (v: Category[]) => void) => {
    setter(arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white sm:block md:hidden">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="absolute right-0 top-0 h-full w-80 bg-white flex flex-col shadow-xl">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">Filters</h3>
          <button
            onClick={onClose}
            className="p-2 rounded hover:bg-gray-100 text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Scrollable filter content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
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
              <Accordion.Content className="py-2 space-y-2">
                {brands.map((brand) => (
                  <label key={brand} className="flex items-center space-x-3">
                    <Checkbox.Root
                      checked={selectedBrands.includes(brand)}
                      onCheckedChange={() =>
                        toggleValue(selectedBrands, brand, setSelectedBrands)
                      }
                      className="w-5 h-5 border rounded flex items-center justify-center data-[state=checked]:bg-blue-500"
                    >
                      <Checkbox.Indicator>
                        <CheckIcon className="text-white w-3 h-3" />
                      </Checkbox.Indicator>
                    </Checkbox.Root>
                    <span className="text-sm">{brand}</span>
                  </label>
                ))}
              </Accordion.Content>
            </Accordion.Item>

            

            {/* Size */}
            <Accordion.Item value="size" className="border-b">
              <Accordion.Trigger className="flex justify-between w-full py-2 font-medium">
                Size <ChevronDownIcon />
              </Accordion.Trigger>
              <Accordion.Content className="py-2 space-y-2">
                {allSizes.map((size) => (
                  <label key={size} className="flex items-center space-x-3">
                    <Checkbox.Root
                      checked={selectedSizes.includes(size)}
                      onCheckedChange={() =>
                        toggleValue(selectedSizes, size, setSelectedSizes)
                      }
                      className="w-5 h-5 border rounded flex items-center justify-center data-[state=checked]:bg-blue-500"
                    >
                      <Checkbox.Indicator>
                        <CheckIcon className="text-white w-3 h-3" />
                      </Checkbox.Indicator>
                    </Checkbox.Root>
                    <span className="text-sm">{size}</span>
                  </label>
                ))}
              </Accordion.Content>
            </Accordion.Item>

            {/* Sort */}
            <Accordion.Item value="sort" className="border-b">
              <Accordion.Trigger className="flex justify-between w-full py-2 font-medium">
                Sort By <ChevronDownIcon />
              </Accordion.Trigger>
              <Accordion.Content className="py-2 space-y-2">
                <RadioGroup.Root
                  value={selectedSort}
                  onValueChange={setSelectedSort}
                  className="flex flex-col space-y-2"
                >
                  {sortOptions.map((opt) => (
                    <label key={opt.value} className="flex items-center space-x-3">
                      <RadioGroup.Item
                        value={opt.value}
                        id={opt.value}
                        className="w-5 h-5 rounded-full border border-gray-400 data-[state=checked]:border-blue-500 data-[state=checked]:bg-blue-500"
                      />
                      <span className="text-sm">{opt.label}</span>
                    </label>
                  ))}
                </RadioGroup.Root>
              </Accordion.Content>
            </Accordion.Item>

            {/* Price Range */}
            <Accordion.Item value="price" className="border-b">
              <Accordion.Trigger className="flex justify-between w-full py-2 font-medium">
                Price Range <ChevronDownIcon />
              </Accordion.Trigger>
              <Accordion.Content className="py-2 space-y-2">
                <RadioGroup.Root
                  value={selectedPrice?.label || ""}
                  onValueChange={(label) =>
                    setSelectedPrice(priceRanges.find((p) => p.label === label) || null)
                  }
                  className="flex flex-col space-y-2"
                >
                  {priceRanges.map((pr) => (
                    <label key={pr.label} className="flex items-center space-x-3">
                      <RadioGroup.Item
                        value={pr.label}
                        id={pr.label}
                        className="w-5 h-5 rounded-full border border-gray-400 data-[state=checked]:border-blue-500 data-[state=checked]:bg-blue-500"
                      />
                      <span className="text-sm">{pr.label}</span>
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
              <Accordion.Content className="py-2 space-y-2">
                {discountRanges.map((range) => (
                  <label key={range} className="flex items-center space-x-3">
                    <Checkbox.Root
                      checked={selectedDiscounts.includes(range)}
                      onCheckedChange={() =>
                        toggleValue(selectedDiscounts, range, setSelectedDiscounts)
                      }
                      className="w-5 h-5 border rounded flex items-center justify-center data-[state=checked]:bg-blue-500"
                    >
                      <Checkbox.Indicator>
                        <CheckIcon className="text-white w-3 h-3" />
                      </Checkbox.Indicator>
                    </Checkbox.Root>
                    <span className="text-sm">{range}</span>
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
                                  toggleCategory(
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

            {/* Gender */}
            {/* <Accordion.Item value="gender" className="border-b">
              <Accordion.Trigger className="flex justify-between w-full py-2 font-medium">
                Gender <ChevronDownIcon />
              </Accordion.Trigger>
              <Accordion.Content className="py-2 space-y-2">
                {genders.map((g) => (
                  <label key={g} className="flex items-center space-x-3">
                    <Checkbox.Root
                      checked={selectedGenders.includes(g)}
                      onCheckedChange={() =>
                        toggleValue(selectedGenders, g, setSelectedGenders)
                      }
                      className="w-5 h-5 border rounded flex items-center justify-center data-[state=checked]:bg-blue-500"
                    >
                      <Checkbox.Indicator>
                        <CheckIcon className="text-white w-3 h-3" />
                      </Checkbox.Indicator>
                    </Checkbox.Root>
                    <span className="text-sm">{g}</span>
                  </label>
                ))}
              </Accordion.Content>
            </Accordion.Item> */}
          </Accordion.Root>
        </div>

        {/* Footer Buttons */}
        <div className="p-4 border-t bg-white space-y-2">
          <button
            onClick={handleClearAll}
            className="w-full py-2 border rounded-md text-sm font-medium hover:bg-gray-100"
          >
            Clear All Filters
          </button>
          <button
            onClick={onClose}
            className="w-full py-2 bg-black text-white rounded-md text-sm font-medium"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};
