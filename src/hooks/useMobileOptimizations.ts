import { useEffect, useState } from 'react';
import { isMobile } from 'react-device-detect';

export interface MobileOptimizations {
  shouldDisableHover: boolean;
  useLargerTouchTargets: boolean;
  useNativeScrolling: boolean;
}

export const useMobileOptimizations = (): MobileOptimizations => {
  const [optimizations, setOptimizations] = useState<MobileOptimizations>({
    shouldDisableHover: isMobile,
    useLargerTouchTargets: isMobile,
    useNativeScrolling: isMobile
  });

  useEffect(() => {
    if (isMobile) {
      // Add mobile-specific meta tags
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute('content', 
          'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
        );
      }

      // Add CSS class to body for mobile-specific styles
      document.body.classList.add('is-mobile');

      // Disable double-tap zoom
      document.documentElement.style.touchAction = 'manipulation';
    }

    return () => {
      if (isMobile) {
        document.body.classList.remove('is-mobile');
      }
    };
  }, []);

  return optimizations;
};