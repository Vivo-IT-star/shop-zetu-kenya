import {HydratedRouter} from 'react-router/dom';
import {startTransition, StrictMode} from 'react';
import {hydrateRoot} from 'react-dom/client';

// Initialize analytics only after consent is given
// function initializeAnalytics() {
//   if (window.Shopify?.customerPrivacy?.analyticsProcessingAllowed()) {
//     // Your analytics initialization code here (GA4, etc.)
//     console.log('Analytics initialized with consent');
//   }
// }


// Listen for consent changes
// document.addEventListener("visitorConsentCollected", (event) => {
//   if (event.detail.analyticsAllowed) {
//     initializeAnalytics();
//   }
// });

// Check initial consent state
// document.addEventListener('DOMContentLoaded', () => {
//   if (window.Shopify?.customerPrivacy?.shouldShowBanner?.() === false) {
//     // Banner not needed, check if analytics is already allowed
//     initializeAnalytics();
//   }
// });

if (!window.location.origin.includes('webcache.googleusercontent.com')) {
  startTransition(() => {
    hydrateRoot(
      document,
      <StrictMode>
        <HydratedRouter />
      </StrictMode>,
    );
  });
}
