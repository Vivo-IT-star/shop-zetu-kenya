import {Analytics, getShopAnalytics, useNonce} from '@shopify/hydrogen';
import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import '@n8n/chat/style.css';
import './styles/chat.css';
import {createChat} from '@n8n/chat';
import {Bot} from 'lucide-react';

import {
  Outlet,
  useRouteError,
  isRouteErrorResponse,
  type ShouldRevalidateFunction,
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
  useNavigate
} from 'react-router';

import favicon from '~/assets/vivo-favicon.png';
import {FOOTER_QUERY, HEADER_QUERY} from '~/lib/fragments';
import {SHOPZETU_HEADER_MENU} from '~/lib/shopzetuMenu';
import resetStyles from '~/styles/reset.css?url';
import appStyles from '~/styles/app.css?url';
import tailwindCss from './styles/tailwind.css?url';
import {PageLayout} from './components/PageLayout';
import {CartUpsellProductsProvider} from './lib/contexts/CartUpsellProductsContext';
import AnnouncementBar from './components/AnnouncementBar';
import TopNavLinks from './components/TopNavLinks';
import {KlaviyoPopupTrigger} from './components/KlaviyoPopupTrigger';
import {VivoProductsProvider} from './lib/contexts/VivoProductsContext';
import {LizolaProductsProvider} from './lib/contexts/LizolaProductsContext';
import {AfricanYuvaProductsProvider} from './lib/contexts/AfricanYuvaProductsContext';
import {PumaProductsProvider} from './lib/contexts/PumaProductsContext';
import KlaviyoPopup, {useKlaviyoPopup} from './components/KlaviyoPopup';
import {NavigationFix} from './components/NavigationFix';
import {useState, useEffect} from 'react';
import {MetaPixel} from './components/MetaPixel';
import {WishlistProvider} from './lib/contexts/WishlistContext';
import {useAnalytics} from './hooks/useAnalytics';
import ChatWidget from './components/chatWidget';
import {PinkProductsProvider} from './lib/contexts/ThinkPinkProductsContext';
import {ShopByBodyFitProductsProvider} from './lib/contexts/ShopByBodyFitProductsContext';
import WhatsAppBlackNovemberChannelPopup, {
  useWhatsAppBlackNovemberPopup,
} from './components/WhatsappBlackNovemberPopup';
import BlackNovemberTimer from './components/CountDownTimer';
import {useJudgeMe} from './hooks/useJudgeMe';

/**
 * This is important to avoid re-fetching root queries on sub-navigations
 */

// export const shouldRevalidate: ShouldRevalidateFunction = ({
//   formMethod,
//   currentUrl,
//   nextUrl,
// }) => {
//   // revalidate when a mutation is performed e.g add to cart, login...
//   if (formMethod && formMethod !== 'GET') return true;

//   // revalidate when manually revalidating via useRevalidator
//   if (currentUrl.toString() === nextUrl.toString()) return true;

//   // Revalidate when navigating TO collections or shop routes to ensure fresh data
//   if (
//     nextUrl.pathname.includes('/collections/') ||
//     nextUrl.pathname.includes('/shop/')
//   ) {
//     console.log('Forcing revalidation for collection/shop route:', {
//       from: currentUrl.pathname,
//       to: nextUrl.pathname,
//     });
//     return true;
//   }

//   // Revalidate when navigating FROM shop routes to ensure clean state
//   if (currentUrl.pathname.includes('/shop/')) {
//     console.log('Forcing revalidation when leaving shop route:', {
//       from: currentUrl.pathname,
//       to: nextUrl.pathname,
//     });
//     return true;
//   }

//   // Default behavior for other routes
//   return false;
// };

/**
 * The main and reset stylesheets are added in the Layout component
 * to prevent a bug in development HMR updates.
 *
 * This avoids the "failed to execute 'insertBefore' on 'Node'" error
 * that occurs after editing and navigating to another page.
 *
 * It's a temporary fix until the issue is resolved.
 * https://github.com/remix-run/remix/issues/9242
 *
 *
 */

declare global {
  interface Window {
    __n8nChatLoaded?: boolean;
  }
}

export function links() {
  return [
    {
      rel: 'preconnect',
      href: 'https://cdn.shopify.com',
    },
    {
      rel: 'preconnect',
      href: 'https://shop.app',
    },
    {rel: 'icon', type: 'image/png', href: favicon},
  ];
}

export async function loader(args: LoaderFunctionArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  const {storefront, env} = args.context;

  return {
    ...deferredData,
    ...criticalData,
    publicStoreDomain: env.PUBLIC_STORE_DOMAIN,
    shop: getShopAnalytics({
      storefront,
      publicStorefrontId: env.PUBLIC_STOREFRONT_ID,
    }),
    consent: {
      checkoutDomain: env.PUBLIC_CHECKOUT_DOMAIN,
      storefrontAccessToken: env.PUBLIC_STOREFRONT_API_TOKEN,
      withPrivacyBanner: true,
      // localize the privacy banner
      country: args.context.storefront.i18n.country,
      language: args.context.storefront.i18n.language,
    },
  };
}

export type RootLoader = typeof loader;

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context}: LoaderFunctionArgs) {
  const {storefront} = context;

  const [header] = await Promise.all([
    storefront.query(HEADER_QUERY, {
      cache: storefront.CacheLong(),
      variables: {
        headerMenuHandle: 'main-menu-dup', // Adjust to your header menu handle
      },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  // Preview override: render Shopzetu's captured navigation for the header,
  // independent of this store's own admin menus. Live store is unaffected.
  if (header) {
    (header as any).menu = SHOPZETU_HEADER_MENU;
  }

  return {header};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: LoaderFunctionArgs) {
  const {storefront, customerAccount, cart} = context;

  // defer the footer query (below the fold)
  const footer = storefront
    .query(FOOTER_QUERY, {
      cache: storefront.CacheLong(),
      variables: {
        footerMenuHandle: 'footer', // Adjust to your footer menu handle
      },
    })
    .catch((error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });
  return {
    cart: cart.get(),
    isLoggedIn: customerAccount.isLoggedIn(),
    footer,
  };
}

export function Layout({children}: {children?: React.ReactNode}) {
  const nonce = useNonce();
  const data = useRouteLoaderData<RootLoader>('root');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const win = window as any;
    if (win.clarity) return;

    win.clarity = win.clarity || function () {
      (win.clarity.q = win.clarity.q || []).push(arguments);
    };

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.clarity.ms/tag/sr3t3pysqf';

    const firstScript = document.getElementsByTagName('script')[0];
    firstScript?.parentNode?.insertBefore(script, firstScript);
  }, []);

  // Use the interval-based popup hook instead of manual state
  const {isOpen: showNewsletterPopup, closePopup: closeNewsletterPopup} =
    useKlaviyoPopup(
      '2-weeks', // Change this to: 'immediately', '1-hour', '24-hours', '2-weeks', '1-month', 'never'
      'zetu-popup', // Custom storage key for your shop
    );

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="stylesheet" href={tailwindCss}></link>
        <link rel="stylesheet" href={resetStyles}></link>
        <link rel="stylesheet" href={appStyles}></link>
        {/* <link rel="stylesheet" href="https://cdn.judge.me/assets/judgeme.css" /> */}

         <Meta />
        <Links />
        {/* ...existing code... */}
      </head>
      <body className="overflow-x-hidden mx-auto">
        {data ? (
          <WishlistProvider>
            <Analytics.Provider
              cart={data.cart}
              shop={data.shop}
              consent={data.consent}
            >
              {/* <BlackNovemberTimer /> */}
              <TopNavLinks />
              {/* <AnnouncementBar /> */}

              <CartUpsellProductsProvider>
                <VivoProductsProvider>
                  <LizolaProductsProvider>
                    <AfricanYuvaProductsProvider>
                      <PinkProductsProvider>
                        <ShopByBodyFitProductsProvider>
                          <PumaProductsProvider>
                            <PageLayout {...data}>
                                {children}
                            </PageLayout>
                          </PumaProductsProvider>
                        </ShopByBodyFitProductsProvider>
                      </PinkProductsProvider>
                    </AfricanYuvaProductsProvider>
                  </LizolaProductsProvider>
                </VivoProductsProvider>
              </CartUpsellProductsProvider>

              {/* <KlaviyoPopupTrigger /> */}
            </Analytics.Provider>
          </WishlistProvider>
        ) : (
          children
        )}

        {/* Judge.me config */}
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `
      window.jdgm = window.jdgm || {};
      jdgm.SHOP_DOMAIN = 'shop-zetu-kenya.myshopify.com';
      jdgm.PLATFORM = 'shopify';
      jdgm.PUBLIC_TOKEN = 'nOw370FZEhqxJQZjOiPbfouqLC4';
    `,
          }}
        />

        {/* Judge.me core */}
        <script
          nonce={nonce}
          data-cfasync="false"
          async
          src="https://cdnwidget.judge.me/widget_preloader.js"
        />

        {/* ✅ All Reviews Page logic (CORRECT FILE) */}
        {/* <script
          nonce={nonce}
          async
          src="https://cdnwidget.judge.me/widget/arp.js"
        /> */}

        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />

        {/* Screenshot Popup for mobile/desktop */}
        {/* <ScreenshotPopup /> */}

        {/* Klaviyo Newsletter Popup */}
        {/* <KlaviyoPopup
          isOpen={showNewsletterPopup}
          onClose={closeNewsletterPopup}
          logoUrl="https://via.placeholder.com/80x80/6366F1/FFFFFF?text=✨"
          interval="1-month"
          storageKey="zetu-popup"
        /> */}

        <MetaPixel />

        {/* // Whatsapp Widget */}
        <a
          href="https://wa.me/254748419357"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-18 lg:bottom-16 right-2 md:right-4 z-40 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center"
          aria-label="Chat with us on WhatsApp"
        >
          <svg
            className="w-6 h-6 fill-current"
            viewBox="0 0 32 32"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M16.001 2.667c-7.364 0-13.334 5.97-13.334 13.333 0 2.353.617 4.652 1.786 6.671l-1.881 5.481a1.34 1.34 0 0 0 1.685 1.685l5.48-1.881a13.252 13.252 0 0 0 6.665 1.78h.001c7.364 0 13.334-5.97 13.334-13.333s-5.97-13.334-13.336-13.334zm0 24c-1.962 0-3.889-.507-5.592-1.468l-.398-.229-3.253 1.116 1.121-3.261-.245-.408a10.648 10.648 0 0 1-1.626-5.723c0-5.889 4.798-10.667 10.667-10.667 5.891 0 10.668 4.778 10.668 10.667 0 5.87-4.79 10.667-10.668 10.667zm5.334-7.463c-.293-.147-1.736-.859-2.006-.957-.27-.099-.466-.147-.663.148-.196.293-.761.957-.934 1.152-.172.196-.343.221-.636.074-.293-.148-1.237-.456-2.358-1.454-.872-.778-1.46-1.738-1.63-2.031-.17-.293-.019-.451.13-.598.134-.132.295-.343.442-.514.148-.172.196-.295.295-.49.099-.196.049-.37-.024-.517-.074-.148-.663-1.6-.91-2.192-.239-.573-.48-.495-.663-.504l-.566-.01c-.196 0-.514.074-.783.37-.27.293-1.03 1.008-1.03 2.456 0 1.448 1.054 2.849 1.201 3.045.148.196 2.077 3.174 5.038 4.453.704.303 1.252.484 1.68.618.706.225 1.348.193 1.854.117.566-.084 1.736-.71 1.981-1.396.245-.686.245-1.273.172-1.396-.073-.123-.267-.196-.56-.343z" />
          </svg>
        </a>

        {/* <script
          id="gorgias-chat-widget-install-v3"
          src="https://config.gorgias.chat/bundle-loader/01GYCC51FS463JXAYAG9M38PMS"
        ></script>

        <script
          src="https://bundle.5gtb.com/loader.js?g_cvt_id=ac61b9f0-224b-46ff-94fa-30acfa20ef3d"
          async
        ></script> */}

        {/* <elevenlabs-convai agent-id="agent_01jxsgxprfegt8rwksggkxj2t3"></elevenlabs-convai><script src="https://unpkg.com/@elevenlabs/convai-widget-embed" async type="text/javascript"></script> */}
        {/* <TopNavLinks /> */}
      </body>
    </html>
  );
}

export default function App() {
  const {isOpen, closePopup} = useWhatsAppBlackNovemberPopup('2-weeks');
  // useEffect(() => {
  //   if (typeof window !== 'undefined') {
  //     import('@n8n/chat').then(({createChat}) => {
  //       createChat({
  //         webhookUrl:
  //           'https://automate.shopzetu.com/webhook/86e6d16b-024a-4682-bf34-08e82c135a82/chat',
  //         initialMessages: [
  //           'I can help you with product discovery, order inquiries, quick FAQs on refunds, exchanges, and delivery timelines, vendor onboarding inquiries, and so much more anytime 24/7!',
  //           'How can I assist you today?',
  //         ],
  //         i18n: {
  //           en: {
  //             title: 'Hi there! 👋 I am Zetu AI',
  //             subtitle:'',
  //             footer: '',
  //             getStarted: 'New Conversation',
  //             inputPlaceholder: 'Type your question..',
  //             closeButtonTooltip: '',
  //           },
  //         },
  //       });
  //     });
  //   }
  // }, []);

  // useEffect(() => {
  //   if (typeof window !== 'undefined' && !window.__n8nChatLoaded) {
  //     window.__n8nChatLoaded = true;
  //     import('@n8n/chat').then(({ createChat }) => {
  //       createChat({
  //         webhookUrl: 'https://automate.shopzetu.com/webhook/3fe81dd6-65d2-4bbb-b793-e28b85cf000a/chat',
  //         showWelcomeScreen: true, // enables the welcome screen
  //         theme: {
  //           button: {
  //             backgroundColor: '#a3e635', // lime-400
  //             iconColor: '#000000', // fallback if no icon
  //             iconUrl: '/public/ai-icon.png', // 👈 your custom AI icon
  //           },
  //         },
  //         initialMessages: [

  //           "So how can I assist you today?"
  //         ],
  //         i18n: {
  //           en: {
  //             title: "Hi there! 👋 I am Zetu AI",
  //             subtitle: "I can help you with product discovery, order inquiries, refunds & exchanges, vendor onboarding, and so much more!",
  //             footer: "",
  //             getStarted: "New Conversation",
  //             inputPlaceholder: "Type your question...",
  //             closeButtonTooltip: ''
  //           },
  //         },
  //       });
  //     });
  //   }
  // }, []);

  // useEffect(() => {
  //   if (typeof window !== 'undefined' && !(window as any).__n8nChatLoaded) {
  //     (window as any).__n8nChatLoaded = true;

  //     import('@n8n/chat').then(({ createChat }) => {
  //       createChat({
  //         webhookUrl: 'https://automate.shopzetu.com/webhook/84cf13d8-0b9c-45ba-9bca-00b824aaa19d/chat',
  //         theme: {
  //           chatWindow: {
  //             width: '400px',
  //             height: '600px',
  //             backgroundColor: '#000000', // black
  //           },
  //           button: {
  //             backgroundColor: '#a3e635', // lime-400
  //             iconColor: '#000000', // black icon
  //           },
  //         },
  //         i18n: {
  //           en: {
  //             title: 'Zetu Assistant',
  //             subtitle: 'How can we help?',
  //             footer: 'Powered by Futurizz-Tech',
  //             getStarted: 'Start Chat',
  //             inputPlaceholder: 'Type your message...',
  //             closeButtonTooltip: 'Close chat', // ✅ required
  //           },
  //         },
  //       });
  //     });
  //   }
  // }, []);

  useAnalytics();
  // useJudgeMe();

  return (
    <>
      {/* <NavigationFix /> */}
      {/* ChatWidget hidden — it called Shopzetu's automation backend, not a Vivo endpoint. */}
      {/* <ChatWidget /> */}
      {/* <WhatsAppBlackNovemberChannelPopup
        isOpen={isOpen}
        onClose={closePopup}
        imageUrl="https://cdn.shopify.com/s/files/1/0621/5162/2875/files/Email_Pop_Up.jpg?v=1761573306"
        channelUrl="https://whatsapp.com/channel/0029Va13eCo2phHLHCbvxs2D"
      /> */}

      {/* <WhatsAppBlackNovemberChannelPopup
        isOpen={isOpen}
        onClose={closePopup}
        imageUrl="https://cdn.shopify.com/s/files/1/0621/5162/2875/files/whatsapp-popup.jpg?v=1775810454"
        channelUrl="https://wa.me/254705408426"
      />  */}

      <Outlet />
    </>
  );
}

// export function ErrorBoundary() {
//   const error = useRouteError();
//   let errorMessage = 'Unknown error';
//   let errorStatus = 500;

//   if (isRouteErrorResponse(error)) {
//     errorMessage = error?.data?.message ?? error.data;
//     errorStatus = error.status;
//   } else if (error instanceof Error) {
//     errorMessage = error.message;
//   }

//   return (
//     <div className="flex flex-col justify-center items-center mt-48">
//       <h1>Oops</h1>
//       <h2>{errorStatus} Resource Not Found</h2>
//       <div>
//         <ul>
//           <li>Check your internet connection</li>
//           <li>Check URL mismatch</li>
//           <li>Else Item/Page no longer exists</li>
//         </ul>
//       </div>

//       {errorMessage && (
//         <fieldset>
//           <pre>{errorMessage}</pre>
//         </fieldset>
//       )}
//     </div>
//   );
// }


export function ErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/", { replace: true });
  }, [navigate]);

//   useEffect(() => {
//   if (isRouteErrorResponse(error) && error.status === 404) {
//     navigate("/", { replace: true });
//   }
// }, [error, navigate]);

  return null; // nothing renders because we immediately redirect
}