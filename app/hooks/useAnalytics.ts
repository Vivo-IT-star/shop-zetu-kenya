// app/hooks/useAnalytics.ts
import { useEffect } from 'react';

// Minimal type definitions to avoid conflicts
interface CustomerPrivacy {
  getRegion?(): string;
  shouldShowBanner?(): boolean;
  marketingAllowed?(): boolean;
  analyticsAllowed?(): boolean;
}

interface ShopifyWindow {
  Shopify?: {
    customerPrivacy?: CustomerPrivacy;
  };
}

// Extend the Window interface
declare global {
  interface Window extends ShopifyWindow {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
    _fbq?: any;
  }

  var dataLayer: any[];
}

export function useAnalytics() {
  useEffect(() => {
    const initGA4 = () => {
      if (!window.gtag) {
        // Load GA4 script
        const script = document.createElement('script');
        script.src = 'https://www.googletagmanager.com/gtag/js?id=G-YZTKBXME3T';
        script.async = true;
        document.head.appendChild(script);

        // Initialize gtag
        window.dataLayer = window.dataLayer || [];
        window.gtag = function() { 
          window.dataLayer.push(arguments); 
        };
        window.gtag('js', new Date());
        
        // Configure with Hydrogen identifier
        window.gtag('config', 'G-YZTKBXME3T', {
          storefront_type: 'hydrogen',
          domain: 'shopzetu.com'
        });
      }
    };


    const initMetaPixel = () => {
      if (typeof window === 'undefined') return;
    if (window.fbq) return;
    (function (f, b, e, v) {
      let n: any, t: HTMLScriptElement, s: Element;
      if ((f as any).fbq) return;
      n = function (...args: any[]) {
        n.callMethod
          ? n.callMethod.apply(n, args)
          : n.queue.push(args);
      };
      (f as any).fbq = n;
      if (!(f as any)._fbq) (f as any)._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e) as HTMLScriptElement;
      t.async = true;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode!.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    if (typeof window.fbq === 'function') {
      (window.fbq as (...args: any[]) => void)('init', '154258486023010');
      (window.fbq as (...args: any[]) => void)('track', 'PageView');
    }
    };

    // Use optional chaining to safely access Shopify methods
    const region = window.Shopify?.customerPrivacy?.getRegion?.();
    const shouldShow = window.Shopify?.customerPrivacy?.shouldShowBanner?.();
    
    if (!shouldShow) {
      // No consent required - initialize immediately
      console.log('No consent required, initializing GA4');
      initGA4();
      initMetaPixel();
    } else {
      // Consent required - wait for consent
      document.addEventListener("visitorConsentCollected", (event: any) => {
        if (event.detail?.analyticsAllowed) {
          initGA4();
        }
         if (event.detail?.marketingAllowed) {
          initMetaPixel();
        }
      });
    }
  }, []);
}