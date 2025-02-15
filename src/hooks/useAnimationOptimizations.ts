import { useEffect } from 'react';
import { isMobile } from 'react-device-detect';

export const useAnimationOptimizations = () => {
  useEffect(() => {
    if (isMobile) {
      // Add optimization class to body
      document.body.classList.add('optimize-animations');

      // Add CSS variables for reduced motion if user prefers it
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
      const updateMotionPreference = (e: MediaQueryListEvent | MediaQueryList) => {
        document.documentElement.style.setProperty(
          '--transition-duration',
          e.matches ? '0s' : '0.2s'
        );
      };

      updateMotionPreference(prefersReducedMotion);
      prefersReducedMotion.addEventListener('change', updateMotionPreference);

      return () => {
        document.body.classList.remove('optimize-animations');
        prefersReducedMotion.removeEventListener('change', updateMotionPreference);
      };
    }
  }, []);

  return {
    shouldUseHardwareAcceleration: isMobile,
    reducedMotionEnabled: window.matchMedia('(prefers-reduced-motion: reduce)').matches
  };
};