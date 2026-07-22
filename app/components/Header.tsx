import {Suspense, useState, useRef} from 'react';
import {Await, NavLink, useAsyncValue} from 'react-router';
import {
  type CartViewPayload,
  useAnalytics,
  useOptimisticCart,
  Image,
} from '@shopify/hydrogen';
import type {HeaderQuery, CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {useWishlist} from '~/lib/contexts/WishlistContext';
import {SearchForm} from '~/components/SearchForm';
import {Menu, Search, ShoppingCart} from 'lucide-react';
import {FaShoppingCart, FaRegUserCircle, FaUserCircle} from 'react-icons/fa';

interface HeaderProps {
  header: HeaderQuery;
  cart: Promise<CartApiQueryFragment | null>;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
}

type Viewport = 'desktop' | 'mobile';

export function Header({
  header,
  isLoggedIn,
  cart,
  publicStoreDomain,
}: HeaderProps) {
  const {shop, menu} = header;
  return (
    <header className="flex flex-col fixed bg-white max-w-[1760px]  pt-3 top-18 md:top-15 z-40 mx-auto max-w-8xl w-full left-0 right-0 border-gray-200">
      <div className="flex items-center justify-between px-2 2xl:px-0 w-full mx-auto">
        {/* Left: Logo */}
        <NavLink to="/" prefetch="intent" className="cursor-pointer shrink-0">
          <Image
            src="https://cdn.shopify.com/s/files/1/0533/4797/5326/files/vivo-logo.webp"
            sizes="(min-width: 1024px) 180px, (min-width: 640px) 120px, 110px"
            alt="Vivo Fashion Group"
            className="h-11 -mt-1 lg:h-16 w-auto"
          />
        </NavLink>

        {/* Center: Search */}
        <div className="flex justify-center">
          <SearchToggle />
        </div>

        {/* Right: Header CTAs */}
        <div className="shrink-0">
          <HeaderCtas isLoggedIn={isLoggedIn} cart={cart} />
        </div>
      </div>

      <div className="my-2 -ml-2">
        <HeaderMenu
          menu={menu}
          viewport="desktop"
          primaryDomainUrl={header.shop.primaryDomain.url}
          publicStoreDomain={publicStoreDomain}
        />
      </div>
    </header>
  );
}

export function HeaderMenu({
  menu,
  primaryDomainUrl,
  viewport,
  publicStoreDomain,
}: any) {
  const className = `header-menu-${viewport}`;
  const {close} = useAside();

  const [openMobileDropdown, setOpenMobileDropdown] = useState<string | null>(
    null,
  );
  const [openMobileGrandchildDropdown, setOpenMobileGrandchildDropdown] =
    useState<string | null>(null);
  const [openDesktopDropdown, setOpenDesktopDropdown] = useState<string | null>(
    null,
  );
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isInternalUrl = (url: string) =>
    url.includes('myshopify.com') ||
    url.includes(publicStoreDomain) ||
    url.includes(primaryDomainUrl);

  function normalizeUrl(url: string) {
    try {
      // If internal, get only pathname (strip trailing slash)
      const pathname = isInternalUrl(url)
        ? new URL(url).pathname.replace(/\/$/, '')
        : url;
      return pathname;
    } catch (err) {
      console.error('Invalid URL:', url, err);
      return url;
    }
  }

  const toggleMobileDropdown = (id: string) => {
    setOpenMobileDropdown((prev) => (prev === id ? null : id));
  };

  const handleMouseEnter = (id: string) => {
    if (viewport === 'desktop') {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
        setHoverTimeout(null);
      }
      setOpenDesktopDropdown(id);
    }
  };

  const handleMouseLeave = () => {
    if (viewport === 'desktop') {
      const timeout = setTimeout(() => {
        setOpenDesktopDropdown(null);
      }, 300); // Increased timeout to 300ms for better usability
      setHoverTimeout(timeout);
    }
  };

  // Keep dropdown open when mouse moves to dropdown panel
  const handleDropdownEnter = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
  };

  const handleDropdownLeave = () => {
    if (viewport === 'desktop') {
      const timeout = setTimeout(() => {
        setOpenDesktopDropdown(null);
      }, 300);
      setHoverTimeout(timeout);
    }
  };

  const chunkArray = (array: any[], size: number) =>
    Array.from({length: Math.ceil(array.length / size)}, (_, i) =>
      array.slice(i * size, i * size + size),
    );

  const NEW_IN_IMAGE_MAP: Record<string, string> = {
    Clothing:
      'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/Square_3.jpg?v=1757062470',
    Outerwear:
      'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/Outerwear_3fc0f412-26ae-442d-a96c-7a79b1f9d805.jpg?v=1757343395',
    Beauty:
      'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/Square_4.jpg?v=1757062471',
    Footwear:
      'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/footwear.jpg?v=1757066909',
    Vivo: 'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/Vivo_fc190394-e6c5-49e8-bf35-c15115a9856a.jpg?v=1757340779',
    Lizola:
      'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/Lizola_297f10a8-9829-4eea-aff5-444963a8b348.jpg?v=1757340778',
    'African Yuva':
      'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/African_Yuva_5deae8f2-15a1-4456-88d9-391a7d342035.jpg?v=1757340779',
  };

  const WOMENS_COLLECTION_IMAGE_MAP: Record<string, string> = {
    Beachwear:
      'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/PpdZ775mlg-369545.jpg?v=1723124214&width=800&height=1073&crop=center',
    Bodysuits:
      'https://cdn.shopify.com/s/files/1/0621/5162/2875/products/zola-lace-bodysuit-black-367877.jpg?v=1749646489&width=800&height=1067&crop=center',
    'Corset Tops':
      'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/bgVwwywtdO.jpg?v=1747715604&width=800&height=1067&crop=center',
    'Crop Shirts':
      'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/5A734SIcET-951335.jpg?v=1723123471&width=800&height=1067&crop=center',
    'Fitted Tops':
      'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/D6A1664.jpg?v=1749492772&width=800&height=1067&crop=center',
    'Midriff & Crop Tops':
      'https://cdn.shopify.com/s/files/1/0621/5162/2875/products/zoya-basic-jersey-bandeau-red-896910.jpg?v=1749563081&width=800&height=1067&crop=center',
    'Culottes & Capri Pants':
      'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/IMG_5402.jpg?v=1723810086&width=800&height=1067&crop=center',
    'Denim Bottoms':
      'https://cdn.shopify.com/s/files/1/0621/5162/2875/products/zola-dark-blue-rugged-jeans-no-string-blue-306580.jpg?v=1749612278&width=800&height=1067&crop=center',
    'Full Length Pants':
      'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/Eg1tqf1Jtm.jpg?v=1756360288&width=800&height=1067&crop=center',
    'Jumpsuits & Playsuits':
      'https://cdn.shopify.com/s/files/1/0621/5162/2875/products/xC2eyReEPt-851650.jpg?v=1707901693&width=800&height=1067&crop=center',
    Leggings:
      'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/23RDOCTOBER2024VIVO2649.jpg?v=1749510736&width=800&height=1067&crop=center',
    Loungewear:
      'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/wxEYygMKot.jpg?v=1723629654&width=800&height=1067&crop=center',
    'Loose Tops':
      'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/2021-10-01-Mellanie-Rozy-Carol-Website-shoot-11812-230056.jpg?v=1749504440&width=800&height=1067&crop=center',
    'T-shirts & Tank Tops':
      'https://cdn.shopify.com/s/files/1/0621/5162/2875/products/lamazi-collections-t-shirt-white-928428.jpg?v=1749626728&width=800&height=1067&crop=center',
    'Shirt Tops':
      'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/6483.jpg?v=1741966367&width=800&height=1067&crop=center',
    'Midi & Capri Pants':
      'https://cdn.shopify.com/s/files/1/0621/5162/2875/products/Q8H3Ukr4zz-511766.jpg?v=1707902783&width=800&height=1067&crop=center',
  };

  const BEAUTY_COLLECTION_IMAGE_MAP: Record<string, string> = {
    Makeup:
      'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/makeup.webp?v=1759133203',
    Haircare:
      'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/haircare.webp?v=1759133203',
    Fragrances:
      'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/fragrances.webp?v=1759133202',
    'Nail Treatment':
      'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/nail-treatment.webp?v=1759133203',
  };

  const SHOP_BY_BODY_FIT_IMAGE_MAP: Record<string, string> = {
    'Curvy & Plus size':
      'https://cdn.shopify.com/s/files/1/0621/5162/2875/products/OT385u2iOD-938772.jpg?v=1749659800&width=800&height=1067&crop=center',
    Petite:
      'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/lLfliKxKxq.jpg?v=1724401543&width=800&height=1067&crop=center',
    'Maternity Wear':
      'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/3uLO17Ky7F.jpg?v=1712932200&width=800&height=1067&crop=center',
    Unisex:
      'https://cdn.shopify.com/s/files/1/0621/5162/2875/products/AMuOWPkFxk-282264.jpg?v=1718088115&width=800&height=1067&crop=center',
  };

  const MADE_IN_AFRICA_IMAGE_MAP: Record<string, string> = {
    'Made In Ethiopia':
      'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/bgVwwywtdO.jpg?v=1747715604&width=800&height=1067&crop=center',
    'Made In Kenya':
      'https://cdn.shopify.com/s/files/1/0621/5162/2875/products/african-yuva-umber-palazzo-pants-grey-white-456377-213544.jpg?v=1749632393&width=800&height=984&crop=center',
    'Made In Nigeria':
      'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/TzuwrIDGEQ-659218.jpg?v=1749703577&width=800&height=1067&crop=center',
    'Made In South Africa':
      'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/lvTSuzsLzE.jpg?v=1743756647&width=800&height=1067&crop=center',
  };

  const SHOWCASE_BRANDS_IMAGE_MAP: Record<string, string> = {
    Vivo: 'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/Vivo_fc190394-e6c5-49e8-bf35-c15115a9856a.jpg?v=1757340779',
    Lizola:
      'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/Lizola_297f10a8-9829-4eea-aff5-444963a8b348.jpg?v=1757340778',
    'African Yuva':
      'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/African_Yuva_5deae8f2-15a1-4456-88d9-391a7d342035.jpg?v=1757340779',
    Puma: 'https://cdn.shopify.com/s/files/1/0621/5162/2875/files/PUMA.jpg?v=1779344096',
  };

  const renderAllBrandsLayout = (item: any) => {
    return (
      <div className="w-full grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-8 px-6">
        {item.items.map((child: any) => {
          if (!child.url) return null;
          const childUrl = isInternalUrl(child.url)
            ? new URL(child.url).pathname
            : child.url;
          const hasGrandchildren = child.items && child.items.length > 0;

          // Column 1:
          if (childUrl === '/pages/featured-brands') {
            return (
              <div key={child.id} className="col-span-3">
                {/* <h3 className="font-bold border-b mb-3 pb-2">{child.title}</h3> */}
                <NavLink to={childUrl} prefetch="intent">
                  <h3 className="font-bold border-b mb-3 mt-2 pb-2">
                    FEATURED BRANDS
                  </h3>
                </NavLink>

                {hasGrandchildren && (
                  <ul className="grid grid-cols-2  space-y-2">
                    {child.items.map((grandchild: any) => {
                      if (!grandchild.url) return null;
                      const grandchildUrl = isInternalUrl(grandchild.url)
                        ? new URL(grandchild.url).pathname
                        : grandchild.url;
                      return (
                        <li key={grandchild.id} className="pb-2">
                          <NavLink
                            to={grandchildUrl}
                            className="text-sm text-gray-700 hover:text-blue-600 block"
                            onClick={close}
                            prefetch="intent"
                          >
                            {grandchild.title}
                          </NavLink>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          }

          // Column 2:
          if (childUrl === '/collections/newest-brands') {
            return (
              <div key={child.id} className="col-span-3">
                {/* <h3 className="font-bold border-b mb-3 pb-2">{child.title}</h3> */}
                <NavLink to={childUrl} prefetch="intent">
                  <h3 className="font-bold border-b mb-3 mt-2 pb-2">NEW BRANDS</h3>
                </NavLink>

                {hasGrandchildren && (
                  <ul className="grid grid-cols-2 md:grid-cols-3 space-y-2">
                    {child.items.map((grandchild: any) => {
                      if (!grandchild.url) return null;
                      const grandchildUrl = isInternalUrl(grandchild.url)
                        ? new URL(grandchild.url).pathname
                        : grandchild.url;
                      return (
                        <li
                          key={grandchild.id}
                          className="pb-2 text-sm text-gray-700 hover:text-blue-600 cursor-pointer"
                        >
                          <NavLink to={grandchildUrl} prefetch="intent">
                            {grandchild.title}
                          </NavLink>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          }

          // Column 3:
          if (childUrl === '/pages/all-our-brands') {
            return (
              <div key={child.id} className="col-span-2">
                {/* <h3 className="font-bold border-b mb-3 pb-2">{child.title}</h3> */}
                <NavLink to={childUrl} prefetch="intent">
                  <h3 className="font-bold border-b mb-3 mt-2 pb-2">
                    {child.title}
                  </h3>
                </NavLink>

                {hasGrandchildren && (
                  <ul className="space-y-2">
                    {child.items.map((grandchild: any) => {
                      if (!grandchild.url) return null;
                      const grandchildUrl = isInternalUrl(grandchild.url)
                        ? new URL(grandchild.url).pathname
                        : grandchild.url;
                      return (
                        <li
                          key={grandchild.id}
                          className="pb-2 text-sm text-gray-700 hover:text-blue-600 cursor-pointer"
                        >
                          <NavLink to={grandchildUrl} prefetch="intent">
                            {grandchild.title}
                          </NavLink>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          }

          return null;
        })}
      </div>
    );
  };

  const renderNewInLayout = (item: any) => {
    return (
      <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-8 px-6">
        {item.items.map((child: any) => {
          if (!child.url) return null;
          const childUrl = isInternalUrl(child.url)
            ? new URL(child.url).pathname
            : child.url;
          const hasGrandchildren = child.items && child.items.length > 0;

          // Column 1: New In
          if (childUrl === '/collections/new-inn') {
            return (
              <div key={child.id}>
                <h3 className="font-bold border-b mb-3 mt-2 pb-2">{child.title}</h3>
                {hasGrandchildren && (
                  <ul className="space-y-2">
                    {child.items.map((grandchild: any) => {
                      if (!grandchild.url) return null;
                      const grandchildUrl = isInternalUrl(grandchild.url)
                        ? new URL(grandchild.url).pathname
                        : grandchild.url;
                      return (
                        <li key={grandchild.id} className="pb-2">
                          <NavLink
                            to={grandchildUrl}
                            className="text-sm text-gray-700 hover:text-blue-600 block"
                            onClick={close}
                            prefetch="intent"
                          >
                            {grandchild.title}
                          </NavLink>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          }

          // Column 2: Trending
          if (childUrl === '/collections/trending') {
            return (
              <div key={child.id}>
                <h3 className="font-bold border-b mb-3 mt-2 pb-2">{child.title}</h3>
                {hasGrandchildren && (
                  <ul className="space-y-2">
                    {child.items.map((grandchild: any) => {
                      if (!grandchild.url) return null;
                      const grandchildUrl = isInternalUrl(grandchild.url)
                        ? new URL(grandchild.url).pathname
                        : grandchild.url;
                      return (
                        <li
                          key={grandchild.id}
                          className="pb-2 text-sm text-gray-700 hover:text-blue-600 cursor-pointer"
                        >
                          <NavLink to={grandchildUrl} prefetch="intent">
                            {grandchild.title}
                          </NavLink>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          }

          // Column 3: Top Saved (grid with images from NEW_IN_IMAGE_MAP)
          if (childUrl === '/collections/top-saved') {
            return (
              <div key={child.id}>
                <h3 className="font-bold border-b mb-3 mt-2 pb-2">{child.title}</h3>
                <div className="grid grid-cols-2 gap-2 items-center justify center">
                  {child.items.map((grandchild: any) => {
                    if (!grandchild.url) return null;
                    const grandchildUrl = isInternalUrl(grandchild.url)
                      ? new URL(grandchild.url).pathname
                      : grandchild.url;

                    const imageUrl = NEW_IN_IMAGE_MAP[grandchild.title];

                    return (
                      <a
                        href={grandchildUrl}
                        key={grandchild.id}
                        className="block"
                      >
                        {imageUrl && (
                          <Image
                            src={imageUrl}
                            alt={grandchild.title}
                            sizes="(min-width: 45em) 300px, 100vw"
                            className="rounded-none w-[80%] object-cover"
                          />
                        )}
                        <span className="text-sm block">
                          {grandchild.title}
                        </span>
                      </a>
                    );
                  })}
                </div>
              </div>
            );
          }

          // Column 4: New Edits (large stacked images from NEW_IN_IMAGE_MAP)
          if (childUrl === '/collections/new-edits') {
            return (
              <div key={child.id}>
                <h3 className="font-bold border-b mb-3 mt-2 pb-2">{child.title}</h3>
                <div className="space-y-3">
                  {child.items.map((grandchild: any) => {
                    if (!grandchild.url) return null;
                    const grandchildUrl = isInternalUrl(grandchild.url)
                      ? new URL(grandchild.url).pathname
                      : grandchild.url;

                    const imageUrl = NEW_IN_IMAGE_MAP[grandchild.title];

                    return (
                      <a
                        href={grandchildUrl}
                        key={grandchild.id}
                        className="block"
                      >
                        {imageUrl && (
                          <Image
                            src={imageUrl}
                            alt={grandchild.title}
                            sizes="(min-width: 45em) 300px, 100vw"
                            className="rounded-lg w-full object-cover"
                          />
                        )}
                      </a>
                    );
                  })}
                </div>
              </div>
            );
          }

          return null;
        })}
      </div>
    );
  };

  const renderBeautyCollectionLayout = (item: any) => {
    return (
      <div className="w-full grid grid-cols-1 md:grid-cols-6 gap-8 px-6">
        {item.items.map((child: any) => {
          if (!child.url) return null;
          const childUrl = isInternalUrl(child.url)
            ? new URL(child.url).pathname
            : child.url;
          const hasGrandchildren = child.items && child.items.length > 0;

          // Column 1:
          if (childUrl === '/collections/mens-skincare') {
            return (
              <div key={child.id} className="">
                <h3 className="font-bold border-b mb-3 mt-2 pb-2">SKINCARE</h3>
                {hasGrandchildren && (
                  <ul className="space-y-2">
                    {child.items.map((grandchild: any) => {
                      if (!grandchild.url) return null;
                      const grandchildUrl = isInternalUrl(grandchild.url)
                        ? new URL(grandchild.url).pathname
                        : grandchild.url;
                      return (
                        <li key={grandchild.id} className="pb-2">
                          <NavLink
                            to={grandchildUrl}
                            className="text-sm text-gray-700 hover:text-blue-600 block"
                            onClick={close}
                            prefetch="intent"
                          >
                            {grandchild.title}
                          </NavLink>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          }

          //column2
          if (childUrl === '/collections/top-pick') {
            return (
              <div key={child.id} className="col-span-3">
                {/* <h3 className="font-bold border-b mb-3 pb-2">{child.title}</h3> */}
                <h3 className="font-bold border-b mb-3 mt-2 pb-2">TOP PICKS</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 ">
                  {child.items.map((grandchild: any) => {
                    if (!grandchild.url) return null;
                    const grandchildUrl = isInternalUrl(grandchild.url)
                      ? new URL(grandchild.url).pathname
                      : grandchild.url;

                    const imageUrl =
                      BEAUTY_COLLECTION_IMAGE_MAP[grandchild.title];

                    return (
                      <a
                        href={grandchildUrl}
                        key={grandchild.id}
                        className="block"
                      >
                        {imageUrl && (
                          <Image
                            src={imageUrl}
                            alt={grandchild.title}
                            sizes="(min-width: 45em) 300px, 100vw"
                            className="rounded-none h-48"
                          />
                        )}
                        <span className="text-sm mt-2 block">
                          {grandchild.title}
                        </span>
                      </a>
                    );
                  })}
                </div>
              </div>
            );
          }

          // Column 2:
          // if (childUrl === '/collections/hair') {
          //   return (
          //     <div key={child.id}>
          //       <h3 className="font-bold border-b mb-3 pb-2">HAIR</h3>
          //       {hasGrandchildren && (
          //         <ul className="space-y-2">
          //           {child.items.map((grandchild: any) => {
          //             if (!grandchild.url) return null;
          //             const grandchildUrl = isInternalUrl(grandchild.url)
          //               ? new URL(grandchild.url).pathname
          //               : grandchild.url;
          //             return (
          //               <li
          //                 key={grandchild.id}
          //                 className="pb-2 text-sm text-gray-700 hover:text-blue-600 cursor-pointer"
          //               >
          //                 <NavLink to={grandchildUrl} prefetch="intent">
          //                   {grandchild.title}
          //                 </NavLink>
          //               </li>
          //             );
          //           })}
          //         </ul>
          //       )}

          //     </div>
          //   );
          // }

          // Column 3:
          // if (childUrl === '/collections/fragrance') {
          //   return (
          //     <div key={child.id} className='col-span-2'>

          //       <h3 className="font-bold border-b mb-3 pb-2">FRAGRANCE</h3>
          //       <div className="grid grid-cols-2 md:grid-cols-2 gap-2">
          //         {child.items.map((grandchild: any) => {
          //           if (!grandchild.url) return null;
          //           const grandchildUrl = isInternalUrl(grandchild.url)
          //             ? new URL(grandchild.url).pathname
          //             : grandchild.url;

          //           const imageUrl =
          //             BEAUTY_COLLECTION_IMAGE_MAP[grandchild.title];

          //           return (
          //             <a
          //               href={grandchildUrl}
          //               key={grandchild.id}
          //               className="block"
          //             >
          //               {imageUrl && (
          //                 <img
          //                   src={imageUrl}
          //                   alt={grandchild.title}
          //                   className="rounded-none w-full object-cover"
          //                 />
          //               )}
          //               <p className="text-sm ">
          //                 {grandchild.title}
          //               </p>
          //             </a>
          //           );
          //         })}
          //       </div>
          //     </div>
          //   );
          // }

          // Column 4:
          // if (childUrl === '/collections/womens-bottoms') {
          //   return (
          //     <div key={child.id} className='col-span-2'>

          //       <h3 className="font-bold border-b mb-3 pb-2">BOTTOMS</h3>
          //       <div className="space-y-3 grid grid-cols-2 md:grid-cols-2 gap-2">
          //         {child.items.map((grandchild: any) => {
          //           if (!grandchild.url) return null;
          //           const grandchildUrl = isInternalUrl(grandchild.url)
          //             ? new URL(grandchild.url).pathname
          //             : grandchild.url;

          //           const imageUrl =
          //             WOMENS_COLLECTION_IMAGE_MAP[grandchild.title];

          //           return (
          //             <a
          //               href={grandchildUrl}
          //               key={grandchild.id}
          //               className="block"
          //             >
          //               {imageUrl && (
          //                 <img
          //                   src={imageUrl}
          //                   alt={grandchild.title}
          //                   className="rounded-none w-full object-cover"
          //                 />
          //               )}
          //               <p className="text-sm  ">
          //                 {grandchild.title}
          //               </p>
          //             </a>
          //           );
          //         })}
          //       </div>
          //     </div>
          //   );
          // }
          //     if (childUrl === '/collections/make-up') {
          //   return (
          //     <div key={child.id} className='col-span-2'>

          //       <h3 className="font-bold border-b mb-3 pb-2">MAKEUP</h3>
          //       <div className="grid grid-cols-2 md:grid-cols-2 gap-2">
          //         {child.items.map((grandchild: any) => {
          //           if (!grandchild.url) return null;
          //           const grandchildUrl = isInternalUrl(grandchild.url)
          //             ? new URL(grandchild.url).pathname
          //             : grandchild.url;

          //           const imageUrl =
          //             BEAUTY_COLLECTION_IMAGE_MAP[grandchild.title];

          //           return (
          //             <a
          //               href={grandchildUrl}
          //               key={grandchild.id}
          //               className="block"
          //             >
          //               {imageUrl && (
          //                 <img
          //                   src={imageUrl}
          //                   alt={grandchild.title}
          //                   className="rounded-none w-full object-cover"
          //                 />
          //               )}
          //               <p className="text-sm ">
          //                 {grandchild.title}
          //               </p>
          //             </a>
          //           );
          //         })}
          //       </div>
          //     </div>
          //   );
          // }

          // Column 5:
          if (childUrl === '/collections/tools-accessories') {
            return (
              <div key={child.id}>
                {/* <h3 className="font-bold border-b mb-3 pb-2">{child.title}</h3> */}
                <NavLink
                  to={child.url}
                  className="font-bold border-b mb-3 mt-2 pb-2"
                >
                  TOOLS & ACCESSORIES
                </NavLink>
                <div className="space-y-3 grid grid-cols-1  gap-2">
                  {child.items.map((grandchild: any) => {
                    if (!grandchild.url) return null;
                    const grandchildUrl = isInternalUrl(grandchild.url)
                      ? new URL(grandchild.url).pathname
                      : grandchild.url;

                    const imageUrl =
                      BEAUTY_COLLECTION_IMAGE_MAP[grandchild.title];

                    return (
                      <a
                        href={grandchildUrl}
                        key={grandchild.id}
                        className="block"
                      >
                        {imageUrl && (
                          <Image
                            src={imageUrl}
                            alt={grandchild.title}
                            sizes="(min-width: 45em) 300px, 100vw"
                            className="rounded-none w-full object-cover"
                          />
                        )}
                        <p className="text-sm ">{grandchild.title}</p>
                      </a>
                    );
                  })}
                </div>
              </div>
            );
          }

          // Column 6:
          // if (childUrl === '/collections/nail-treatment') {
          //   return (
          //     <div key={child.id}>
          //       {/* <h3 className="font-bold border-b mb-3 pb-2">{child.title}</h3> */}
          //       <h3 className="font-bold border-b mb-3 pb-2">NAIL TREATMENT</h3>
          //       <div className="space-y-3 grid grid-cols-1  gap-2">
          //         {child.items.map((grandchild: any) => {
          //           if (!grandchild.url) return null;
          //           const grandchildUrl = isInternalUrl(grandchild.url)
          //             ? new URL(grandchild.url).pathname
          //             : grandchild.url;

          //           const imageUrl =
          //             BEAUTY_COLLECTION_IMAGE_MAP[grandchild.title];

          //           return (
          //             <a
          //               href={grandchildUrl}
          //               key={grandchild.id}
          //               className="block"
          //             >
          //               {imageUrl && (
          //                 <img
          //                   src={imageUrl}
          //                   alt={grandchild.title}
          //                   className="rounded-none w-full object-cover"
          //                 />
          //               )}
          //               <p className="text-sm ">
          //                 {grandchild.title}
          //               </p>
          //             </a>
          //           );
          //         })}
          //       </div>
          //     </div>
          //   );
          // }

          return null;
        })}
      </div>
    );
  };

  const renderWomensCollectionLayout = (item: any) => {
    return (
      <div className="w-full grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-8 px-6">
        {item.items.map((child: any) => {
          if (!child.url) return null;
          const childUrl = isInternalUrl(child.url)
            ? new URL(child.url).pathname
            : child.url;
          const hasGrandchildren = child.items && child.items.length > 0;

          // Column 1:
          if (childUrl === '/collections/womens-dresses') {
            return (
              <div key={child.id} className=" ">
                {/* <h3 className="font-bold border-b mb-3 pb-2">{child.title}</h3> */}
                <NavLink to={childUrl} prefetch="intent">
                  <h3 className="font-bold border-b mb-3 mt-2 pb-2">DRESSES</h3>
                </NavLink>

                {hasGrandchildren && (
                  <ul className=" space-y-2">
                    {child.items.map((grandchild: any) => {
                      if (!grandchild.url) return null;
                      const grandchildUrl = isInternalUrl(grandchild.url)
                        ? new URL(grandchild.url).pathname
                        : grandchild.url;
                      return (
                        <li key={grandchild.id} className="pb-2">
                          <NavLink
                            to={grandchildUrl}
                            className="text-sm text-gray-700 hover:text-blue-600 block"
                            onClick={close}
                            prefetch="intent"
                          >
                            {grandchild.title}
                          </NavLink>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          }

          // Column 2:
          if (childUrl === '/collections/womens-outerwear') {
            return (
              <div key={child.id}>
                {/* <h3 className="font-bold border-b mb-3 pb-2">{child.title}</h3> */}
                <NavLink to={childUrl} prefetch="intent">
                  <h3 className="font-bold border-b mb-3 mt-2 pb-2">OUTERWEAR</h3>
                </NavLink>

                {hasGrandchildren && (
                  <ul className="space-y-2">
                    {child.items.map((grandchild: any) => {
                      if (!grandchild.url) return null;
                      const grandchildUrl = isInternalUrl(grandchild.url)
                        ? new URL(grandchild.url).pathname
                        : grandchild.url;
                      return (
                        <li
                          key={grandchild.id}
                          className="pb-2 text-sm text-gray-700 hover:text-blue-600 cursor-pointer"
                        >
                          <NavLink to={grandchildUrl} prefetch="intent">
                            {grandchild.title}
                          </NavLink>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          }

          // Column 3:
          if (childUrl === '/collections/womens-tops-top-categories') {
            return (
              <div key={child.id} className="col-span-2 ">
                {/* <h3 className="font-bold border-b mb-3 pb-2">{child.title}</h3> */}
                <NavLink to={childUrl} prefetch="intent">
                  <h3 className="font-bold border-b mb-3 mt-2 pb-2">TOPS</h3>
                </NavLink>

                {hasGrandchildren && (
                  <ul className="grid grid-cols-2  space-y-2">
                    {child.items.map((grandchild: any) => {
                      if (!grandchild.url) return null;
                      const grandchildUrl = isInternalUrl(grandchild.url)
                        ? new URL(grandchild.url).pathname
                        : grandchild.url;
                      return (
                        <li
                          key={grandchild.id}
                          className="pb-2 text-sm text-gray-700 hover:text-blue-600 cursor-pointer"
                        >
                          <NavLink to={grandchildUrl} prefetch="intent">
                            {grandchild.title}
                          </NavLink>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          }

          // Column 4:
          if (childUrl === '/collections/womens-bottoms') {
            return (
              <div key={child.id} className="col-span-2">
                {/* <h3 className="font-bold border-b mb-3 pb-2">{child.title}</h3> */}
                <NavLink to={childUrl} prefetch="intent">
                  <h3 className="font-bold border-b mb-3 mt-2 pb-2">BOTTOMS</h3>
                </NavLink>

                {hasGrandchildren && (
                  <ul className="grid grid-cols-2 space-y-2">
                    {child.items.map((grandchild: any) => {
                      if (!grandchild.url) return null;
                      const grandchildUrl = isInternalUrl(grandchild.url)
                        ? new URL(grandchild.url).pathname
                        : grandchild.url;
                      return (
                        <li
                          key={grandchild.id}
                          className="pb-2 text-sm text-gray-700 hover:text-blue-600 cursor-pointer"
                        >
                          <NavLink to={grandchildUrl} prefetch="intent">
                            {grandchild.title}
                          </NavLink>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          }

          // Column 5:
          if (childUrl === '/collections/womens-skirts') {
            return (
              <div key={child.id}>
                {/* <h3 className="font-bold border-b mb-3 pb-2">{child.title}</h3> */}

                <NavLink to={childUrl} prefetch="intent">
                  <h3 className="font-bold border-b mb-3 mt-2 pb-2">SKIRTS</h3>
                </NavLink>
                {hasGrandchildren && (
                  <ul className="space-y-2">
                    {child.items.map((grandchild: any) => {
                      if (!grandchild.url) return null;
                      const grandchildUrl = isInternalUrl(grandchild.url)
                        ? new URL(grandchild.url).pathname
                        : grandchild.url;
                      return (
                        <li
                          key={grandchild.id}
                          className="pb-2 text-sm text-gray-700 hover:text-blue-600 cursor-pointer"
                        >
                          <NavLink to={grandchildUrl} prefetch="intent">
                            {grandchild.title}
                          </NavLink>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          }

          // Column 6:
          if (childUrl === '/collections/womens-innerwear') {
            return (
              <div key={child.id}>
                {/* <h3 className="font-bold border-b mb-3 pb-2">{child.title}</h3> */}
                <NavLink to={childUrl} prefetch="intent">
                  <h3 className="font-bold border-b mb-3 mt-2 pb-2">INNERWEAR</h3>
                </NavLink>

                {hasGrandchildren && (
                  <ul className="space-y-2">
                    {child.items.map((grandchild: any) => {
                      if (!grandchild.url) return null;
                      const grandchildUrl = isInternalUrl(grandchild.url)
                        ? new URL(grandchild.url).pathname
                        : grandchild.url;
                      return (
                        <li
                          key={grandchild.id}
                          className="pb-2 text-sm text-gray-700 hover:text-blue-600 cursor-pointer"
                        >
                          <NavLink to={grandchildUrl} prefetch="intent">
                            {grandchild.title}
                          </NavLink>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          }

          return null;
        })}
      </div>
    );
  };

  const renderFootwearLayout = (item: any) => {
    return (
      <div className="w-full grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-8 px-6">
        {item.items.map((child: any) => {
          if (!child.url) return null;
          const childUrl = isInternalUrl(child.url)
            ? new URL(child.url).pathname
            : child.url;
          const hasGrandchildren = child.items && child.items.length > 0;

          // Column 1:
          if (childUrl === '/collections/womens-footwear') {
            return (
              <div key={child.id} className="">
                <NavLink to={childUrl} prefetch="intent">
                  <h3 className="font-bold border-b mb-3 mt-2 pb-2">
                    {child.title}
                  </h3>
                </NavLink>

                {hasGrandchildren && (
                  <ul className="space-y-2">
                    {child.items.map((grandchild: any) => {
                      if (!grandchild.url) return null;
                      const grandchildUrl = isInternalUrl(grandchild.url)
                        ? new URL(grandchild.url).pathname
                        : grandchild.url;
                      return (
                        <li key={grandchild.id} className="pb-2">
                          <NavLink
                            to={grandchildUrl}
                            className="text-sm text-gray-700 hover:text-blue-600 block"
                            onClick={close}
                            prefetch="intent"
                          >
                            {grandchild.title}
                          </NavLink>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          }

          // Column 2:
          if (childUrl === '/collections/mens-footwear') {
            return (
              <div key={child.id}>
                <NavLink to={childUrl} prefetch="intent">
                  <h3 className="font-bold border-b mb-3 mt-2 pb-2">
                    {child.title}
                  </h3>
                </NavLink>
                {/* <h3 className="font-bold border-b mb-3 pb-2">O</h3> */}
                {hasGrandchildren && (
                  <ul className="space-y-2">
                    {child.items.map((grandchild: any) => {
                      if (!grandchild.url) return null;
                      const grandchildUrl = isInternalUrl(grandchild.url)
                        ? new URL(grandchild.url).pathname
                        : grandchild.url;
                      return (
                        <li
                          key={grandchild.id}
                          className="pb-2 text-sm text-gray-700 hover:text-blue-600 cursor-pointer"
                        >
                          <NavLink to={grandchildUrl} prefetch="intent">
                            {grandchild.title}
                          </NavLink>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          }

          return null;
        })}
      </div>
    );
  };

  const renderShopByBodyFitLayout = (item: any) => {
    return (
      <div className="w-full grid grid-cols-2 md:grid-cols-11 gap-4 px-6">
        {item.items.map((child: any) => {
          if (!child.url) return null;
          const childUrl = isInternalUrl(child.url)
            ? new URL(child.url).pathname
            : child.url;
          const hasGrandchildren = child.items && child.items.length > 0;

          // Column 1: New In
          if (childUrl === '/shop/curvy-plus-size') {
            return (
              <div key={child.id} className="md:col-span-2">
                <NavLink to={childUrl} prefetch="intent">
                  <h3 className="font-bold  mb-3 pb-2">{child.title}</h3>
                </NavLink>

                {/* Show image once based on the child title */}
                <div className="mb-3">
                  {SHOP_BY_BODY_FIT_IMAGE_MAP[child.title] && (
                    <a href={childUrl} key={child.id} className="block">
                      <Image
                        src={SHOP_BY_BODY_FIT_IMAGE_MAP[child.title]}
                        alt={child.title}
                        sizes="(min-width: 45em) 300px, 100vw"
                        className="rounded-lg w-fit h-48 md:h-64 object-cover"
                      />
                    </a>
                  )}
                </div>

                {/* Then list grandchildren */}
                {/* <div className="space-y-3">
                  {child.items.map((grandchild: any) => {
                    if (!grandchild.url) return null;
                    const grandchildUrl = isInternalUrl(grandchild.url)
                      ? new URL(grandchild.url).pathname
                      : grandchild.url;

                    return (
                      <a
                        href={grandchildUrl}
                        key={grandchild.id}
                        className="block text-sm line-clamp-1"
                      >
                        {grandchild.title}
                      </a>
                    );
                  })}
                </div> */}
              </div>
            );
          }

          // Column 2:
          if (childUrl === '/collections/petite') {
            return (
              <div key={child.id} className="md:col-span-2">
                <NavLink to={childUrl} prefetch="intent">
                  <h3 className="font-bold mb-3 pb-2">{child.title}</h3>
                </NavLink>

                {/* Show image once based on the child title */}
                <div className="mb-3">
                  {SHOP_BY_BODY_FIT_IMAGE_MAP[child.title] && (
                    <a href={childUrl} key={child.id} className="block">
                      <Image
                        src={SHOP_BY_BODY_FIT_IMAGE_MAP[child.title]}
                        alt={child.title}
                        sizes="(min-width: 45em) 300px, 100vw"
                        className="rounded-lg w-fit h-48 md:h-64 object-cover"
                      />
                    </a>
                  )}
                </div>

                {/* Then list grandchildren */}
                {/* <div className="space-y-3">
                  {child.items.map((grandchild: any) => {
                    if (!grandchild.url) return null;
                    const grandchildUrl = isInternalUrl(grandchild.url)
                      ? new URL(grandchild.url).pathname
                      : grandchild.url;

                    return (
                      <a
                        href={grandchildUrl}
                        key={grandchild.id}
                        className="block text-sm line-clamp-1"
                      >
                        {grandchild.title}
                      </a>
                    );
                  })}
                </div> */}
              </div>
            );
          }

          // Column 3:
          if (childUrl === '/collections/maternity') {
            return (
              <div key={child.id} className="md:col-span-2">
                <NavLink to={childUrl} prefetch="intent">
                  <h3 className="font-bold  mb-3 pb-2">{child.title}</h3>
                </NavLink>

                {/* Show image once based on the child title */}
                <div className="mb-3">
                  {SHOP_BY_BODY_FIT_IMAGE_MAP[child.title] && (
                    <a href={childUrl} key={child.id} className="block">
                      <Image
                        src={SHOP_BY_BODY_FIT_IMAGE_MAP[child.title]}
                        alt={child.title}
                        sizes="(min-width: 45em) 300px, 100vw"
                        className="rounded-lg w-fit h-48 md:h-64 object-cover"
                      />
                    </a>
                  )}
                </div>

                {/* Then list grandchildren */}
                {/* <div className="space-y-3">
                  {child.items.map((grandchild: any) => {
                    if (!grandchild.url) return null;
                    const grandchildUrl = isInternalUrl(grandchild.url)
                      ? new URL(grandchild.url).pathname
                      : grandchild.url;

                    return (
                      <a
                        href={grandchildUrl}
                        key={grandchild.id}
                        className="block text-sm line-clamp-1"
                      >
                        {grandchild.title}
                      </a>
                    );
                  })}
                </div> */}
              </div>
            );
          }

          // Column 4:
          if (childUrl === '/collections/unisex') {
            return (
              <div key={child.id} className="md:col-span-2">
                <NavLink to={childUrl} prefetch="intent">
                  <h3 className="font-bold mb-3 pb-2">{child.title}</h3>
                </NavLink>

                {/* Show image once based on the child title */}
                <div className="mb-3">
                  {SHOP_BY_BODY_FIT_IMAGE_MAP[child.title] && (
                    <a href={childUrl} key={child.id} className="block">
                      <Image
                        src={SHOP_BY_BODY_FIT_IMAGE_MAP[child.title]}
                        alt={child.title}
                        sizes="(min-width: 45em) 300px, 100vw"
                        className="rounded-lg w-fit h-48 md:h-64 object-cover"
                      />
                    </a>
                  )}
                </div>

                {/* Then list grandchildren */}
                {/* <div className="space-y-3">
                  {child.items.map((grandchild: any) => {
                    if (!grandchild.url) return null;
                    const grandchildUrl = isInternalUrl(grandchild.url)
                      ? new URL(grandchild.url).pathname
                      : grandchild.url;

                    return (
                      <a
                        href={grandchildUrl}
                        key={grandchild.id}
                        className="block text-sm line-clamp-1"
                      >
                        {grandchild.title}
                      </a>
                    );
                  })}
                </div> */}
              </div>
            );
          }

          return null;
        })}
      </div>
    );
  };

  const renderMadeInAfricaLayout = (item: any) => {
    return (
      <div className="w-full grid grid-cols-2 md:grid-cols-11 gap-4 px-6">
        {item.items.map((child: any) => {
          if (!child.url) return null;
          const childUrl = isInternalUrl(child.url)
            ? new URL(child.url).pathname
            : child.url;
          const hasGrandchildren = child.items && child.items.length > 0;

          // Column 1: New In
          if (childUrl === '/collections/made-in-ethiopia') {
            return (
              <div key={child.id} className="md:col-span-2">
                <NavLink to={childUrl} prefetch="intent">
                  <h3 className="font-bold  mb-3 pb-2">{child.title}</h3>
                </NavLink>

                {/* Show image once based on the child title */}
                <div className="mb-3">
                  {MADE_IN_AFRICA_IMAGE_MAP[child.title] && (
                    <a href={childUrl} key={child.id} className="block">
                      <Image
                        src={MADE_IN_AFRICA_IMAGE_MAP[child.title]}
                        alt={child.title}
                        sizes="(min-width: 45em) 300px, 100vw"
                        className="rounded-lg w-fit h-48 md:h-64 object-cover"
                      />
                    </a>
                  )}
                </div>
              </div>
            );
          }

          // Column 2:
          if (childUrl === '/collections/made-in-kenya-festival-fits') {
            return (
              <div key={child.id} className="md:col-span-2">
                <NavLink to={childUrl} prefetch="intent">
                  <h3 className="font-bold mb-3 pb-2">{child.title}</h3>
                </NavLink>

                {/* Show image once based on the child title */}
                <div className="mb-3">
                  {MADE_IN_AFRICA_IMAGE_MAP[child.title] && (
                    <a href={childUrl} key={child.id} className="block">
                      <Image
                        src={MADE_IN_AFRICA_IMAGE_MAP[child.title]}
                        alt={child.title}
                        sizes="(min-width: 45em) 300px, 100vw"
                        className="rounded-lg w-fit h-48 md:h-64 object-cover"
                      />
                    </a>
                  )}
                </div>

                {/* Then list grandchildren */}
                {/* <div className="space-y-3">
                  {child.items.map((grandchild: any) => {
                    if (!grandchild.url) return null;
                    const grandchildUrl = isInternalUrl(grandchild.url)
                      ? new URL(grandchild.url).pathname
                      : grandchild.url;

                    return (
                      <a
                        href={grandchildUrl}
                        key={grandchild.id}
                        className="block text-sm line-clamp-1"
                      >
                        {grandchild.title}
                      </a>
                    );
                  })}
                </div> */}
              </div>
            );
          }

          // Column 3:
          if (childUrl === '/collections/made-in-nigeria') {
            return (
              <div key={child.id} className="md:col-span-2">
                <NavLink to={childUrl} prefetch="intent">
                  <h3 className="font-bold  mb-3 pb-2">{child.title}</h3>
                </NavLink>

                {/* Show image once based on the child title */}
                <div className="mb-3">
                  {MADE_IN_AFRICA_IMAGE_MAP[child.title] && (
                    <a href={childUrl} key={child.id} className="block">
                      <Image
                        src={MADE_IN_AFRICA_IMAGE_MAP[child.title]}
                        alt={child.title}
                        sizes="(min-width: 45em) 300px, 100vw"
                        className="rounded-lg w-fit h-48 md:h-64 object-cover"
                      />
                    </a>
                  )}
                </div>

                {/* Then list grandchildren */}
                {/* <div className="space-y-3">
                  {child.items.map((grandchild: any) => {
                    if (!grandchild.url) return null;
                    const grandchildUrl = isInternalUrl(grandchild.url)
                      ? new URL(grandchild.url).pathname
                      : grandchild.url;

                    return (
                      <a
                        href={grandchildUrl}
                        key={grandchild.id}
                        className="block text-sm line-clamp-1"
                      >
                        {grandchild.title}
                      </a>
                    );
                  })}
                </div> */}
              </div>
            );
          }

          // Column 4:
          if (childUrl === '/collections/julz') {
            return (
              <div key={child.id} className="md:col-span-2">
                <NavLink to={childUrl} prefetch="intent">
                  <h3 className="font-bold mb-3 pb-2 line-clamp-1">
                    {child.title}
                  </h3>
                </NavLink>

                {/* Show image once based on the child title */}
                <div className="mb-3">
                  {MADE_IN_AFRICA_IMAGE_MAP[child.title] && (
                    <a href={childUrl} key={child.id} className="block">
                      <Image
                        src={MADE_IN_AFRICA_IMAGE_MAP[child.title]}
                        alt={child.title}
                        sizes="(min-width: 45em) 300px, 100vw"
                        className="rounded-lg w-fit h-48 md:h-64 object-cover"
                      />
                    </a>
                  )}
                </div>

                {/* Then list grandchildren */}
                {/* <div className="space-y-3">
                  {child.items.map((grandchild: any) => {
                    if (!grandchild.url) return null;
                    const grandchildUrl = isInternalUrl(grandchild.url)
                      ? new URL(grandchild.url).pathname
                      : grandchild.url;

                    return (
                      <a
                        href={grandchildUrl}
                        key={grandchild.id}
                        className="block text-sm line-clamp-1"
                      >
                        {grandchild.title}
                      </a>
                    );
                  })}
                </div> */}
              </div>
            );
          }

          return null;
        })}
      </div>
    );
  };

  const renderDiscoverBrandsLayout = (item: any) => {
    return (
      <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-2 px-6">
        {item.items.map((child: any) => {
          if (!child.url) return null;
          const childUrl = isInternalUrl(child.url)
            ? new URL(child.url).pathname
            : child.url;
          const hasGrandchildren = child.items && child.items.length > 0;

          // Column 1:
          if (childUrl === '/shop/vivo') {
            return (
              <div key={child.id}>
                <NavLink to={childUrl} prefetch="intent">
                  <h3 className="font-bold border-b mb-3 mt-2 pb-2">
                    {child.title}
                  </h3>
                </NavLink>

                {/* Show image once based on the child title */}
                <div className="mb-3">
                  {SHOWCASE_BRANDS_IMAGE_MAP[child.title] && (
                    <a href={childUrl} key={child.id} className="block">
                      <Image
                        src={SHOWCASE_BRANDS_IMAGE_MAP[child.title]}
                        alt={child.title}
                        sizes="(min-width: 45em) 300px, 100vw"
                        className="rounded-lg w-full object-cover"
                      />
                    </a>
                  )}
                </div>

                {/* Then list grandchildren */}
                {/* <div className="space-y-3">
                  {child.items.map((grandchild: any) => {
                    if (!grandchild.url) return null;
                    const grandchildUrl = isInternalUrl(grandchild.url)
                      ? new URL(grandchild.url).pathname
                      : grandchild.url;

                    return (
                      <a
                        href={grandchildUrl}
                        key={grandchild.id}
                        className="block text-sm line-clamp-1"
                      >
                        {grandchild.title}
                      </a>
                    );
                  })}
                </div> */}
              </div>
            );
          }

          // Column 2:
          if (childUrl === '/shop/lizola') {
            return (
              <div key={child.id}>
                <NavLink to={childUrl} prefetch="intent">
                  <h3 className="font-bold border-b mb-3 mt-2 pb-2">
                    {child.title}
                  </h3>
                </NavLink>

                {/* Show image once based on the child title */}
                <div className="mb-3">
                  {SHOWCASE_BRANDS_IMAGE_MAP[child.title] && (
                    <a href={childUrl} key={child.id} className="block">
                      <Image
                        src={SHOWCASE_BRANDS_IMAGE_MAP[child.title]}
                        alt={child.title}
                        sizes="(min-width: 45em) 300px, 100vw"
                        className="rounded-lg w-full object-cover"
                      />
                    </a>
                  )}
                </div>

                {/* Then list grandchildren */}
                {/* <div className="space-y-3">
                  {child.items.map((grandchild: any) => {
                    if (!grandchild.url) return null;
                    const grandchildUrl = isInternalUrl(grandchild.url)
                      ? new URL(grandchild.url).pathname
                      : grandchild.url;

                    return (
                      <a
                        href={grandchildUrl}
                        key={grandchild.id}
                        className="block text-sm line-clamp-1"
                      >
                        {grandchild.title}
                      </a>
                    );
                  })}
                </div> */}
              </div>
            );
          }

          // Column 3:
          if (childUrl === '/shop/african-yuva') {
            return (
              <div key={child.id}>
                <NavLink to={childUrl} prefetch="intent">
                  <h3 className="font-bold border-b mb-3 mt-2 pb-2">
                    {child.title}
                  </h3>
                </NavLink>

                {/* Show image once based on the child title */}
                <div className="mb-3">
                  {SHOWCASE_BRANDS_IMAGE_MAP[child.title] && (
                    <a href={childUrl} key={child.id} className="block">
                      <Image
                        src={SHOWCASE_BRANDS_IMAGE_MAP[child.title]}
                        alt={child.title}
                        sizes="(min-width: 45em) 300px, 100vw"
                        className="rounded-lg w-full object-cover"
                      />
                    </a>
                  )}
                </div>

                {/* Then list grandchildren */}
                {/* <div className="space-y-3">
                  {child.items.map((grandchild: any) => {
                    if (!grandchild.url) return null;
                    const grandchildUrl = isInternalUrl(grandchild.url)
                      ? new URL(grandchild.url).pathname
                      : grandchild.url;

                    return (
                      <a
                        href={grandchildUrl}
                        key={grandchild.id}
                        className="block text-sm line-clamp-1"
                      >
                        {grandchild.title}
                      </a>
                    );
                  })}
                </div> */}
              </div>
            );
          }

          // Column 4:
            if (childUrl === '/shop/puma') {
            return (
              <div key={child.id}>
                <NavLink to={childUrl} prefetch="intent">
                  <h3 className="font-bold border-b mb-3 mt-2 pb-2">
                    {child.title}
                  </h3>
                </NavLink>

                {/* Show image once based on the child title */}
                <div className="mb-3">
                  {SHOWCASE_BRANDS_IMAGE_MAP[child.title] && (
                    <a href={childUrl} key={child.id} className="block">
                      <Image
                        src={SHOWCASE_BRANDS_IMAGE_MAP[child.title]}
                        alt={child.title}
                        sizes="(min-width: 45em) 300px, 100vw"
                        className="rounded-lg w-full object-cover"
                      />
                    </a>
                  )}
                </div>

                {/* Then list grandchildren */}
                {/* <div className="space-y-3">
                  {child.items.map((grandchild: any) => {
                    if (!grandchild.url) return null;
                    const grandchildUrl = isInternalUrl(grandchild.url)
                      ? new URL(grandchild.url).pathname
                      : grandchild.url;

                    return (
                      <a
                        href={grandchildUrl}
                        key={grandchild.id}
                        className="block text-sm line-clamp-1"
                      >
                        {grandchild.title}
                      </a>
                    );
                  })}
                </div> */}
              </div>
            );
          }

          

          return null;
        })}
      </div>
    );
  };

  return (
    <nav
      className={`${className} relative md:justify-center max-md:overflow-y-auto  max-md:h-screen `}
      role="navigation"
    >
      {viewport === 'mobile' && (
        <NavLink
          end
          onClick={close}
          prefetch="intent"
          to="/"
          className="header-menu-item"
        >
          Home
        </NavLink>
      )}

      <ul className="flex flex-col lg:flex-row gap-2 lg:gap-4 ">
        {(menu || FALLBACK_HEADER_MENU).items.map((item: any) => {
          if (!item.url) return null;
          const url = isInternalUrl(item.url)
            ? new URL(item.url).pathname
            : item.url;

          // console.log(
          //   "Processing menu item:",
          //   item.title,
          //   "with raw URL:",
          //   item.url,
          //   "→ normalized:",
          //   normalizeUrl(item.url)
          // );

          // console.log('Processing menu item:', item.title, 'with URL:', item.url);
          const hasChildren = item.items && item.items.length > 0;
          const isMobileOpen = openMobileDropdown === item.id;

          // const isNewIn = normalizeUrl(item.url) === '/collections/new-arrivals';
          const isNewIn = item.url.includes('/collections/new-arrivals');
          const isWomensCollection =
            normalizeUrl(item.url) === '/collections/women';
          const isShopByBodyFit =
            normalizeUrl(item.url) === '/collections/shop-by-body-fit';
          const isMadeInAfrica =
            normalizeUrl(item.url) === '/collections/made-in-africa';
          const isDiscoverBrands = normalizeUrl(item.url) === '/pages/shops';
          const isAllBrands =
            normalizeUrl(item.url) === '/pages/all-our-brands';
          const isFootwear =
            normalizeUrl(item.url) === '/collections/raha-fest-footwear';
          const isBeauty = normalizeUrl(item.url) === '/collections/beauty';

          return (
            <li
              key={item.id}
              className={`w-full text-md lg:w-auto ${
                viewport === 'desktop' ? 'group relative' : ''
              }`}
              onMouseEnter={() => handleMouseEnter(item.id)}
              onMouseLeave={handleMouseLeave}
            >
              <div className="flex items-center w-full lg:w-auto">
                <NavLink
                  to={url}
                  end
                  className={`header-menu-item  text-sm  block flex-1 ${
                    url.includes('/collections/sale') || url === '/pages/shops'
                      ? 'font-bold'
                      : ''
                  }`}
                  onClick={() => {
                    close();
                    if (viewport === 'desktop') setOpenDesktopDropdown(null);
                  }}
                  prefetch="intent"
                  style={(props) => {
                    const baseStyle = activeLinkStyle(props);
                    if (url.includes('/collections/sale')) {
                      return {
                        ...baseStyle,
                        color: 'white',
                        backgroundColor: '#C20000',
                        fontWeight: 'bold',
                        padding: '4px 8px',
                        borderRadius: '4px',
                      };
                    }
                    if (url === '/pages/shops') {
                      return {
                        ...baseStyle,
                        fontWeight: 'bold',
                      };
                    }
                    return baseStyle;
                  }}
                >
                  {item.title}
                </NavLink>
                {hasChildren && viewport === 'mobile' && (
                  <button
                    onClick={() => toggleMobileDropdown(item.id)}
                    className="ml-2 px-2 py-1 text-xs  rounded focus:outline-none flex items-center justify-center"
                    aria-label={
                      isMobileOpen ? 'Hide sub-menu' : 'Show sub-menu'
                    }
                  >
                    <span>{isMobileOpen ? '▲' : '▼'}</span>
                  </button>
                )}
              </div>

              {/* Mobile dropdown */}
              {hasChildren && viewport === 'mobile' && (
                <div
                  className={`transition-all duration-300 ease-out transform origin-top ${
                    isMobileOpen ? 'block' : 'hidden'
                  }`}
                  style={{maxHeight: '100vh', overflowY: 'auto'}}
                >
                  <div className="pb-40">
                    {isNewIn ? (
                      <div className="pl-2">{renderNewInLayout(item)}</div>
                    ) : isWomensCollection ? (
                      <div className="pl-2">
                        {renderWomensCollectionLayout(item)}
                      </div>
                    ) : isShopByBodyFit ? (
                      <div className="pl-2">
                        {renderShopByBodyFitLayout(item)}
                      </div>
                    ) : isMadeInAfrica ? (
                      <div className="pl-2">
                        {renderMadeInAfricaLayout(item)}
                      </div>
                    ) : isDiscoverBrands ? (
                      <div className="pl-2">
                        {renderDiscoverBrandsLayout(item)}
                      </div>
                    ) : isFootwear ? (
                      <div className="pl-2">{renderFootwearLayout(item)}</div>
                    ) : isBeauty ? (
                      <div className="pl-2">
                        {renderBeautyCollectionLayout(item)}
                      </div>
                    ) : isAllBrands ? (
                      <div className="pl-2">{renderAllBrandsLayout(item)}</div>
                    ) : (
                      <div className="pl-4 pt-2 space-y-1">
                        {item.items.map((child: any) => {
                          if (!child.url) return null;
                          const childUrl = isInternalUrl(child.url)
                            ? new URL(child.url).pathname
                            : child.url;

                          const hasGrandchildren =
                            child.items && child.items.length > 0;
                          const isGrandchildOpen =
                            openMobileGrandchildDropdown === child.id;

                          return (
                            <div key={child.id} className="mb-1">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex-1">
                                  <NavLink
                                    to={childUrl}
                                    className="block p-1 text-sm font-semibold"
                                    onClick={close}
                                    prefetch="intent"
                                  >
                                    {child.title}
                                  </NavLink>
                                </div>
                                {hasGrandchildren && (
                                  <button
                                    className="ml-2 px-2 py-1 text-xs bg-gray-100 rounded focus:outline-none"
                                    style={{
                                      minWidth: '32px',
                                      minHeight: '32px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                    }}
                                    onClick={() =>
                                      setOpenMobileGrandchildDropdown(
                                        isGrandchildOpen ? null : child.id,
                                      )
                                    }
                                    aria-label={
                                      isGrandchildOpen
                                        ? 'Hide sub-menu'
                                        : 'Show sub-menu'
                                    }
                                  >
                                    {isGrandchildOpen ? '▲' : '▼'}
                                  </button>
                                )}
                              </div>
                              {hasGrandchildren && isGrandchildOpen && (
                                <div className="ml-3 border-l pl-2 space-y-1">
                                  {child.items.map((grandchild: any) => {
                                    if (!grandchild.url) return null;
                                    const grandchildUrl = isInternalUrl(
                                      grandchild.url,
                                    )
                                      ? new URL(grandchild.url).pathname
                                      : grandchild.url;
                                    return (
                                      <NavLink
                                        key={grandchild.id}
                                        to={grandchildUrl}
                                        className="block text-xs p-1 text-gray-600"
                                        onClick={close}
                                        prefetch="intent"
                                      >
                                        {grandchild.title}
                                      </NavLink>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {/* Desktop mega dropdown */}
      {viewport === 'desktop' &&
        (menu || FALLBACK_HEADER_MENU).items.map((item: any) => {
          if (!item.url) return null;
          const hasChildren = item.items && item.items.length > 0;

          // const isNewIn = normalizeUrl(item.url) === '/collections/new-arrivals';
          const isNewIn = item.url.includes('/collections/new-arrivals');
          const isWomensCollection =
            normalizeUrl(item.url) === '/collections/women';
          const isShopByBodyFit =
            normalizeUrl(item.url) === '/collections/shop-by-body-fit';
          const isMadeInAfrica =
            normalizeUrl(item.url) === '/collections/made-in-africa';
          const isDiscoverBrands = normalizeUrl(item.url) === '/pages/shops';
          const isAllBrands =
            normalizeUrl(item.url) === '/pages/all-our-brands';
          const isFootwear =
            normalizeUrl(item.url) === '/collections/raha-fest-footwear';
          const isBeauty = normalizeUrl(item.url) === '/collections/beauty';

          return hasChildren ? (
            <div
              key={`dropdown-${item.id}`}
              className={`transition-all w-full duration-300 ease-out transform origin-top -mx-2 bg-white  shadow-[0_4px_12px_rgba(0,0,0,0.15)]
              ${
                openDesktopDropdown === item.id
                  ? 'absolute left-1/2 top-full -translate-x-1/2 opacity-100 scale-y-100 z-20 pointer-events-auto'
                  : 'absolute left-1/2 top-full -translate-x-1/2 opacity-0 scale-y-95 pointer-events-none'
              }`}
              style={{
                height: '50vh',
                overflowY: 'auto',
              }}
              onMouseEnter={handleDropdownEnter}
              onMouseLeave={handleDropdownLeave}
              ref={dropdownRef}
            >
              {/* Add a small invisible buffer at the top to prevent accidental mouseout */}
              <div
                className="absolute top-0 left-0 w-full h-2 -translate-y-full z-10"
                onMouseEnter={handleDropdownEnter}
              ></div>

              {isNewIn ? (
                renderNewInLayout(item)
              ) : isWomensCollection ? (
                renderWomensCollectionLayout(item)
              ) : isShopByBodyFit ? (
                renderShopByBodyFitLayout(item)
              ) : isMadeInAfrica ? (
                renderMadeInAfricaLayout(item)
              ) : isDiscoverBrands ? (
                renderDiscoverBrandsLayout(item)
              ) : isFootwear ? (
                renderFootwearLayout(item)
              ) : isBeauty ? (
                renderBeautyCollectionLayout(item)
              ) : isAllBrands ? (
                renderAllBrandsLayout(item)
              ) : item.items.some(
                  (child: any) => child.items && child.items.length > 0,
                ) ? (
                <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8 px-6">
                  {item.items.map((child: any) => {
                    if (!child.url) return null;
                    const childUrl = isInternalUrl(child.url)
                      ? new URL(child.url).pathname
                      : child.url;
                    const hasGrandchildren =
                      child.items && child.items.length > 0;

                    return (
                      <div key={child.id}>
                        <NavLink
                          to={childUrl}
                          className="font-semibold text-sm block mb-2 mt-2 hover:text-blue-600"
                          onClick={() => {
                            close();
                            if (viewport === 'desktop')
                              setOpenDesktopDropdown(null);
                          }}
                          prefetch="intent"
                        >
                          {child.title}
                        </NavLink>
                        {hasGrandchildren && (
                          <div className="space-y-1">
                            {chunkArray(child.items, 7).map(
                              (group: any[], colIndex: number) => (
                                <ul key={colIndex} className="space-y-1">
                                  {group.map((grandchild: any) => {
                                    if (!grandchild.url) return null;
                                    const grandchildUrl = isInternalUrl(
                                      grandchild.url,
                                    )
                                      ? new URL(grandchild.url).pathname
                                      : grandchild.url;

                                    return (
                                      <li key={grandchild.id}>
                                        <NavLink
                                          to={grandchildUrl}
                                          className="block text-sm text-gray-600 hover:text-blue-600  rounded px-2 py-1"
                                          onClick={() => {
                                            close();
                                            if (viewport === 'desktop')
                                              setOpenDesktopDropdown(null);
                                          }}
                                          prefetch="intent"
                                        >
                                          {grandchild.title}
                                        </NavLink>
                                      </li>
                                    );
                                  })}
                                </ul>
                              ),
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                // No grandchildren → chunk into 7 per column
                <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8 px-6">
                  {chunkArray(item.items, 7).map((group, colIndex) => (
                    <ul key={colIndex} className="space-y-2">
                      {group.map((child: any) => {
                        if (!child.url) return null;
                        const childUrl = isInternalUrl(child.url)
                          ? new URL(child.url).pathname
                          : child.url;

                        return (
                          <li key={child.id}>
                            <NavLink
                              to={childUrl}
                              className="block text-base text-gray-800 hover:text-blue-600  rounded px-3 py-2"
                              onClick={close}
                              prefetch="intent"
                            >
                              {child.title}
                            </NavLink>
                          </li>
                        );
                      })}
                    </ul>
                  ))}
                </div>
              )}

              {/* If grandchildren exist → multi-column grid */}
              {/* {item.items.some(
                (child: any) => child.items && child.items.length > 0,
              ) ? (
                <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8 p-6">
                  {item.items.map((child: any) => {
                    if (!child.url) return null;
                    const childUrl = isInternalUrl(child.url)
                      ? new URL(child.url).pathname
                      : child.url;
                    const hasGrandchildren =
                      child.items && child.items.length > 0;

                    return (
                      <div key={child.id}>
                        <NavLink
                          to={childUrl}
                          className="font-semibold text-sm block mb-2 hover:text-blue-600"
                          onClick={() => {
                            close();
                            if (viewport === 'desktop') setOpenDesktopDropdown(null);
                          }}
                          prefetch="intent"
                        >
                          {child.title}
                        </NavLink>
                        {hasGrandchildren && (
                          <div className="space-y-1">
                            {chunkArray(child.items, 7).map(
                              (group: any[], colIndex: number) => (
                                <ul key={colIndex} className="space-y-1">
                                  {group.map((grandchild: any) => {
                                    if (!grandchild.url) return null;
                                    const grandchildUrl = isInternalUrl(
                                      grandchild.url,
                                    )
                                      ? new URL(grandchild.url).pathname
                                      : grandchild.url;

                                    return (
                                      <li key={grandchild.id}>
                                        <NavLink
                                          to={grandchildUrl}
                                          className="block text-sm text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded px-2 py-1"
                                          onClick={() => {
                                            close();
                                            if (viewport === 'desktop') setOpenDesktopDropdown(null);
                                          }}
                                          prefetch="intent"
                                        >
                                          {grandchild.title}
                                        </NavLink>
                                      </li>
                                    );
                                  })}
                                </ul>
                              ),
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                // No grandchildren → chunk into 7 per column
                <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8 p-6">
                  {chunkArray(item.items, 7).map((group, colIndex) => (
                    <ul key={colIndex} className="space-y-2">
                      {group.map((child: any) => {
                        if (!child.url) return null;
                        const childUrl = isInternalUrl(child.url)
                          ? new URL(child.url).pathname
                          : child.url;

                        return (
                          <li key={child.id}>
                            <NavLink
                              to={childUrl}
                              className="block text-base text-gray-800 hover:text-blue-600 hover:bg-gray-50 rounded px-3 py-2"
                              onClick={close}
                              prefetch="intent"
                            >
                              {child.title}
                            </NavLink>
                          </li>
                        );
                      })}
                    </ul>
                  ))}
                </div>
              )} */}
            </div>
          ) : null;
        })}
    </nav>
  );
}

function HeaderCtas({
  isLoggedIn,
  cart,
}: Pick<HeaderProps, 'isLoggedIn' | 'cart'>) {
  const {wishlist} = useWishlist();
  return (
    <nav
      className="header-ctas flex items-center gap-2 pl-2 md:pl-0"
      role="navigation"
    >
      {/* <SearchToggle /> */}
      <NavLink prefetch="intent" to="/account" style={activeLinkStyle}>
        <Suspense fallback="Sign in">
          <Await resolve={isLoggedIn} errorElement="Sign in">
            {(isLoggedIn) =>
              isLoggedIn ? (
                <FaUserCircle size={20} />
              ) : (
                <FaRegUserCircle size={20} />
              )
            }
          </Await>
        </Suspense>
      </NavLink>
      {/* Wishlist Icon */}
      <NavLink to="/wishlist" aria-label="Wishlist" className="relative">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="#C20000"
          viewBox="0 0 24 24"
          width="20"
          height="20"
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
        {wishlist.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#C20000] text-white text-xs font-bold px-1 rounded-full">
            {wishlist.length}
          </span>
        )}
      </NavLink>
      <CartToggle cart={cart} />
      <HeaderMenuMobileToggle />
    </nav>
  );
}

function HeaderMenuMobileToggle() {
  const {open} = useAside();
  return (
    <button
      className="header-menu-mobile-toggle reset"
      onClick={() => open('mobile')}
    >
      <h3>
        <Menu size={28} />
      </h3>
    </button>
  );
}

function SearchToggle() {
  const {open} = useAside();

  return (
    <>
      {/* Mobile: Show toggle button */}
      {/* <button 
        className="reset lg:hidden" 
        onClick={() => open('search')}
      >
        Search
      </button> */}

      {/* mobile search input */}
      <div className="flex  ml-2 overflow-hidden lg:hidden">
        <SearchForm action="/search" className="w-full">
          {({inputRef}) => (
            <div className="flex items-center">
              <input
                ref={inputRef}
                type="search"
                name="q"
                placeholder="Search products..."
                className="w-full py-1 border border-gray-300 rounded-l text-sm focus:outline-none focus:border-blue-500"
              />
              {/* <button
          type="submit"
          className="px-2 py-1 text-white rounded-r text-sm hover:bg-blue-600 focus:outline-none"
        >
          🔍
        </button> */}
            </div>
          )}
        </SearchForm>
      </div>

      {/* Desktop: Show direct search input */}
      <div className="hidden lg:block">
        <SearchForm action="/search">
          {({inputRef}) => (
            <div className="flex items-center w-[500px]">
              <input
                ref={inputRef}
                type="search"
                name="q"
                placeholder="Search products..."
                className="px-3 py-1 w-full flex border border-gray-300 rounded-l text-sm focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="px-3 py-1 cursor-pointer text-white rounded-r text-sm hover:bg-white-300 hover:rounded-full focus:outline-none"
              >
                <Search color="black" size={20} className="hover:black" />
              </button>
            </div>
          )}
        </SearchForm>
      </div>
    </>
  );
}

function CartBadge({count}: {count: number | null}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();

  return (
    <a
      href="/cart"
      onClick={(e) => {
        e.preventDefault();
        open('cart');
        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: window.location.href || '',
        } as CartViewPayload);
      }}
      className="flex items-center gap-1"
    >
      {count && count > 0 ? (
        <FaShoppingCart size={20} />
      ) : (
        <ShoppingCart size={20} />
      )}
      {count === null ? (
        <span>&nbsp;</span>
      ) : (
        <span className="text-sm">{count}</span>
      )}
    </a>
  );
}

function CartToggle({cart}: Pick<HeaderProps, 'cart'>) {
  return (
    <Suspense fallback={<CartBadge count={null} />}>
      <Await resolve={cart}>
        <CartBanner />
      </Await>
    </Suspense>
  );
}

function CartBanner() {
  const originalCart = useAsyncValue() as CartApiQueryFragment | null;
  const cart = useOptimisticCart(originalCart);
  return <CartBadge count={cart?.totalQuantity ?? 0} />;
}

const FALLBACK_HEADER_MENU = {
  id: 'gid://shopify/Menu/199655587896',
  items: [
    {
      id: 'gid://shopify/MenuItem/461609500728',
      resourceId: null,
      tags: [],
      title: 'Collections',
      type: 'HTTP',
      url: '/collections',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609533496',
      resourceId: null,
      tags: [],
      title: 'Blog',
      type: 'HTTP',
      url: '/blogs/journal',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609566264',
      resourceId: null,
      tags: [],
      title: 'Policies',
      type: 'HTTP',
      url: '/policies',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609599032',
      resourceId: 'gid://shopify/Page/92591030328',
      tags: [],
      title: 'About',
      type: 'PAGE',
      url: '/pages/about',
      items: [],
    },
  ],
};

function activeLinkStyle({
  isActive,
  isPending,
}: {
  isActive: boolean;
  isPending: boolean;
}) {
  return {
    fontWeight: isActive ? 'bold' : undefined,
    color: isPending ? 'grey' : 'black',
  };
}