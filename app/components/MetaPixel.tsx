import { useEffect } from 'react';

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    _fbq?: any;
  }
}

export function MetaPixel() {
  useEffect(() => {
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
  }, []);
  return null;
}