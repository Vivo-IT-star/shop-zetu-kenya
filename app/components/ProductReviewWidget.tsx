import {useEffect} from 'react';

export default function ProductReviewsWidget({handle}: {handle: string}) {
  useEffect(() => {
    // Create container for widget
    const container = document.createElement('div');
    container.className = 'jdgm-widget jdgm-product-reviews';
    container.setAttribute('data-product-handle', handle);
    container.setAttribute('data-shop-domain', 'shop-zetu-kenya.myshopify.com');
    container.setAttribute('data-api-token', 'dfedvgSe8k5yx0-DjK6POyjNyxY');
    document.getElementById('jdgm-root')?.appendChild(container);

    // Load Judge.me JS
    if (!document.querySelector('script[src*="judgeme.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://cdn.judge.me/assets/judgeme.js';
      script.async = true;
      script.onload = () => {
        (window as any).JudgeMeInit?.();
      };
      document.body.appendChild(script);
    } else {
      (window as any).JudgeMeInit?.();
    }
  }, [handle]);

  return <div id="jdgm-root"></div>;
}
