import {Suspense, useEffect} from 'react';
import {Await, NavLink, useAsyncValue, useNavigate} from 'react-router';
import {
  type CartViewPayload,
  useAnalytics,
  useOptimisticCart,
} from '@shopify/hydrogen';
import type {HeaderQuery, CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {useState} from 'react';
import {SearchForm} from '~/components/SearchForm';
import { ShoppingCart } from 'lucide-react';
import { FaShoppingCart } from "react-icons/fa";

interface HeaderProps {
  header: HeaderQuery;
  cart: Promise<CartApiQueryFragment | null>;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
}

type Viewport = 'desktop' | 'mobile';

const GET_MENUS_QUERY = `
  query GetMenus {
    menus(first: 10) {
      edges {
        node {
          id
          handle
          items {
            ...MenuItemFragment
            items {
              ...MenuItemFragment
              items {
                ...MenuItemFragment
                items {
                  ...MenuItemFragment
                }
              }
            }
          }
        }
      }
    }
  }

  fragment MenuItemFragment on MenuItem {
    title
    url
    id
  }
`;

async function fetchMenus() {
  try {
    const response = await fetch('https://sz-admin-api.vercel.app/menus');
    if (!response.ok) {
      throw new Error('Failed to fetch menus');
    }
    const data = await response.json() as { menus: any };
    return data.menus;
  } catch (error) {
    console.error('Error fetching menus:', error);
    return null;
  }
}

export function Header({
  header,
  isLoggedIn,
  cart,
  publicStoreDomain,
}: HeaderProps) {
  const {shop, menu} = header;
  console.log("Shop:", shop);
  console.log("New Menu:", menu); // has upto 4 nested items level
  const [menuData, setMenuData] = useState(null);
  const navigate = useNavigate();

  // Fetch menu data on component mount
  useEffect(() => {
    const getMenuData = async () => {
      const menus = await fetchMenus();
      if (menus) {
        // Find the main menu
        const mainMenu = menus.find((menu: { handle: string; }) => menu.handle === 'main-menu');
        setMenuData(mainMenu);
      }
    };
    
    getMenuData();
  }, []);

  const handleLogoClick = () => {
    try {
      navigate('/');
    } catch (error) {
      // Fallback to window.location if navigate fails
      window.location.href = '/';
    }
  };
 return (
    <header className="flex flex-col lg:px-4 lg:-mx-2 sticky top-20 z-12 lg:sticky lg:top-15 bg-white">
      <div className="flex items-center justify-between px-2 py-2">
        <div
          onClick={handleLogoClick}
          className="cursor-pointer"
          style={{fontWeight: 'bold', color: 'black'}}
        >
         <img src="https://cdn.shopify.com/s/files/1/0621/5162/2875/files/logo.webp?v=1749638290" alt="Logo" className="h-12 lg:h-20 w-auto" />
        </div>
        {/* <HeaderCtas isLoggedIn={isLoggedIn} cart={cart} /> */}
      </div>

      <div className="my-2 -ml-2">
        <HeaderMenu
          menu={menuData}
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

  const [openMobileDropdown, setOpenMobileDropdown] = useState<string | null>(null);
  // For toggling grandchildren under each child in mobile
  const [openMobileGrandchildDropdown, setOpenMobileGrandchildDropdown] = useState<string | null>(null);
  const [openDesktopDropdown, setOpenDesktopDropdown] = useState<string | null>(
    null,
  );
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

  const isInternalUrl = (url: string) =>
    url.includes('myshopify.com') ||
    url.includes(publicStoreDomain) ||
    url.includes(primaryDomainUrl);

  const toggleMobileDropdown = (id: string) => {
    setOpenMobileDropdown((prev) => (prev === id ? null : id));
  };


  // RAW Dump
  useEffect(() => {
  if (!menu) return;

  console.log(`\n🔍 RAW MENU DATA for ${viewport}:`, JSON.stringify(menu, null, 2));
}, [viewport, menu]);


// Inside HeaderMenu
useEffect(() => {
  if (!menu) return;

  const logStructure = (viewportLabel: string) => {
    console.log(`\n🌐 ${viewportLabel} Menu Structure:`);

  // Helper: split into chunks of 7
  const chunkArray = (array: any[], size: number) =>
    Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
      array.slice(i * size, i * size + size)
    );

  const traverseMenu = (menuItem: any, level = 0) => {
    const indent = '  '.repeat(level);
    console.log(`${indent}- ${menuItem.title} (ID: ${menuItem.id}, URL: ${menuItem.url})`);

    if (menuItem.items && menuItem.items.length > 0) {
      menuItem.items.forEach((child: any) => traverseMenu(child, level + 1));
    }
  };

  // Log for desktop
  if (viewport === 'desktop') {
    (menu || FALLBACK_HEADER_MENU).items.forEach((item: any) => {
      if (!item.url) return;
      traverseMenu(item);
    });
  } else {
    // Log for mobile (collapsed view)
    (menu || FALLBACK_HEADER_MENU).items.forEach((item: any) => {
      if (!item.url) return;
      console.log(`${item.id}: ${item.title} (${item.items?.length || 0} sub-items)`);
    });
  }
};

  logStructure(viewport);
}, [menu, viewport]);

// Helper: split into chunks of 7
const chunkArray = (array: any[], size: number) =>
  Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
    array.slice(i * size, i * size + size)
  );

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
    }, 150);
    setHoverTimeout(timeout);
  }
};

  return (
    <nav className={`${className} relative`} role="navigation">
      {/* Mobile nav first item */}
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

      {/* Top level menu */}
      <ul className="flex flex-col lg:flex-row gap-2 lg:gap-4">
        {(menu || FALLBACK_HEADER_MENU).items.map((item: any) => {
          if (!item.url) return null;
          const url = isInternalUrl(item.url)
            ? new URL(item.url).pathname
            : item.url;
          const hasChildren = item.items && item.items.length > 0;
          const isMobileOpen = openMobileDropdown === item.id;

          return (
            <li
              key={item.id}
              className={`w-full lg:w-auto ${
                viewport === 'desktop' ? 'group' : ''
              }`}
              onMouseEnter={() => handleMouseEnter(item.id)}
              onMouseLeave={handleMouseLeave}
            >
              <div className="flex items-center w-full lg:w-auto">
                <NavLink
                  to={url}
                  end
                  className="header-menu-item block flex-1"
                  onClick={close}
                  prefetch="intent"
                >
                  {item.title}
                </NavLink>
                {hasChildren && viewport === 'mobile' && (
                  <button
                    onClick={() => toggleMobileDropdown(item.id)}
                    className="ml-2 px-2 py-1 text-xs bg-gray-100 rounded focus:outline-none flex items-center justify-center"
                    aria-label={isMobileOpen ? 'Hide sub-menu' : 'Show sub-menu'}
                  >
                    <span>{isMobileOpen ? '▲' : '▼'}</span>
                  </button>
                )}
              </div>
              {/* Mobile dropdown */}

              {/* Mobile dropdown */}

{hasChildren && viewport === 'mobile' && (
  <div
    className={`transition-all duration-300 ease-out transform origin-top ${
      isMobileOpen ? 'block' : 'hidden'
    }`}
    style={{ maxHeight: '80vh', overflowY: 'auto' }}
  >
    <div className="pl-4 pt-2 space-y-1">
      {item.items.map((child: any) => {
        if (!child.url) return null;
        const childUrl = isInternalUrl(child.url)
          ? new URL(child.url).pathname
          : child.url;

        const hasGrandchildren = child.items && child.items.length > 0;
        const isGrandchildOpen = openMobileGrandchildDropdown === child.id;

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
                  style={{ minWidth: '32px', minHeight: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  onClick={() => setOpenMobileGrandchildDropdown(isGrandchildOpen ? null : child.id)}
                  aria-label={isGrandchildOpen ? 'Hide sub-menu' : 'Show sub-menu'}
                >
                  {isGrandchildOpen ? '▲' : '▼'}
                </button>
              )}
            </div>
            {hasGrandchildren && isGrandchildOpen && (
              <div className="ml-3 border-l pl-2 space-y-1">
                {child.items.map((grandchild: any) => {
                  if (!grandchild.url) return null;
                  const grandchildUrl = isInternalUrl(grandchild.url)
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
  </div>
)}

            </li>
          );
        })}
      </ul>

      {/* 🔹 Desktop mega dropdown */}
      {viewport === 'desktop' &&
        (menu || FALLBACK_HEADER_MENU).items.map((item: any) => {
          if (!item.url) return null;
          const hasChildren = item.items && item.items.length > 0;

          return hasChildren ? (
            <div
              key={`dropdown-${item.id}`}
              className={`transition-all duration-300 ease-out transform origin-top bg-white w-screen border-t border-gray-200 shadow-xl
              ${
                openDesktopDropdown === item.id
                  ? 'absolute left-1/2 top-full -translate-x-1/2 max-w-8xl w-full opacity-100 scale-y-100 z-20'
                  : 'absolute left-1/2 top-full -translate-x-1/2 max-w-8xl w-full opacity-0 scale-y-95 pointer-events-none'
              }`}
              style={{
                height: '60vh',
                overflowY: 'auto',
              }}
              onMouseEnter={() => handleMouseEnter(item.id)}
              onMouseLeave={handleMouseLeave}
            >
              {/* If grandchildren exist → multi-column grid */}
              {item.items.some(
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
                          onClick={close}
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
                                          onClick={close}
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
              )}
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
  return (
    <nav className="header-ctas " role="navigation">
      
      <SearchToggle />
      <NavLink prefetch="intent" to="/account" style={activeLinkStyle}>
        <Suspense fallback="Sign in">
          <Await resolve={isLoggedIn} errorElement="Sign in">
            {(isLoggedIn) => (isLoggedIn ? 'Account' : 'Sign in')}
          </Await>
        </Suspense>
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
      <h3>☰</h3>
    </button>
  );
}

function SearchToggle() {
  const {open} = useAside();
  
  return (
    <>
      {/* Mobile: Show toggle button */}
      <button 
        className="reset lg:hidden" 
        onClick={() => open('search')}
      >
        Search
      </button>
      
      {/* Desktop: Show direct search input */}
      <div className="hidden lg:block">
        <SearchForm action="/search">
          {({inputRef}) => (
            <div className="flex items-center">
              <input
                ref={inputRef}
                type="search"
                name="q"
                placeholder="Search products..."
                className="px-3 py-1 border border-gray-300 rounded-l text-sm focus:outline-none focus:border-blue-500"
                style={{ width: '200px' }}
              />
              <button 
                type="submit"
                className="px-3 py-1 text-white rounded-r text-sm hover:bg-blue-600 focus:outline-none"
              >
                🔍
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
      {count && count > 0 ? <FaShoppingCart /> : <ShoppingCart />}
      {count === null ? <span>&nbsp;</span> : <span className="text-sm">{count}</span>}
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