import {useEffect} from 'react';

declare global {
  interface Window {
    _klOnsite?: { push: (args: any[]) => void };
  }
}

export function KlaviyoPopupTrigger() {
  useEffect(() => {
    const openForm = () => {
      if (typeof window !== 'undefined' && window._klOnsite) {
        window._klOnsite.push(['openForm', 'Szc3YW']);
      }
    };

    // Wait a bit to ensure script is loaded
    const timer = setTimeout(openForm, 1000);

    return () => clearTimeout(timer);
  }, []);

  return null;
}
