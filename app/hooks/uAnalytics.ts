// app/hooks/[useAnalytics.ts](http://useAnalytics.ts)
import { useEffect } from 'react';

// Simplified version for regions without consent requirements
export function useAnalytics() {
  useEffect(() => {
    const region = window.Shopify?.customerPrivacy?.getRegion();
    const shouldShow = window.Shopify?.customerPrivacy?.shouldShowBanner();
    
    if (!shouldShow) {
      // No consent required in this region - initialize immediately
      console.log('No consent required, initializing analytics');
      // Your analytics code here
    } else {
      // Consent required - wait for consent events
      document.addEventListener("visitorConsentCollected", (event) => {
        if (event.detail.analyticsAllowed) {
          // Your analytics code here
        }
      });
    }
  }, []);
}


