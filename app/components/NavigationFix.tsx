import { useEffect } from 'react';
import { useLocation } from 'react-router';

/**
 * Navigation Fix Component
 * 
 * This component monitors route changes and forces page reloads
 * when navigating to collection routes to fix hydration issues.
 */
export function NavigationFix() {
  const location = useLocation();

  useEffect(() => {
    // Check if we're on a collection route
    if (location.pathname.includes('/collections/')) {
      console.log('Collection route detected, checking for navigation issues...');
      
      // Small delay to allow React Router to attempt normal navigation
      const timer = setTimeout(() => {
        // If we're still having issues, this would be detected by collection component
        console.log('Navigation fix monitoring collection route:', location.pathname);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  // Add global click handler to intercept collection links
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const link = target.closest('a[href*="/collections/"]');
      
      if (link && link instanceof HTMLAnchorElement) {
        const href = link.getAttribute('href');
        const currentPath = window.location.pathname;
        
        // Only intercept if we're on a shop page and clicking a collection link
        if (currentPath.includes('/shop/') && href?.includes('/collections/')) {
          console.log('Intercepting collection navigation from shop page:', {
            from: currentPath,
            to: href
          });
          event.preventDefault();
          window.location.href = href;
        }
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return null; // This component doesn't render anything
}
