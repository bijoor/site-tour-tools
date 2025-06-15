import { useState, useEffect } from 'react';

interface TouchCapabilities {
  isTouchDevice: boolean;
  hasCoarsePointer: boolean;
  hasHoverCapability: boolean;
  maxTouchPoints: number;
}

export const useMobileDetection = (): TouchCapabilities => {
  const [touchCapabilities, setTouchCapabilities] = useState<TouchCapabilities>(() => {
    if (typeof window === 'undefined') {
      return {
        isTouchDevice: false,
        hasCoarsePointer: false,
        hasHoverCapability: true,
        maxTouchPoints: 0,
      };
    }

    return {
      isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      hasCoarsePointer: window.matchMedia('(pointer: coarse)').matches,
      hasHoverCapability: window.matchMedia('(hover: hover)').matches,
      maxTouchPoints: navigator.maxTouchPoints || 0,
    };
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateCapabilities = () => {
      setTouchCapabilities({
        isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        hasCoarsePointer: window.matchMedia('(pointer: coarse)').matches,
        hasHoverCapability: window.matchMedia('(hover: hover)').matches,
        maxTouchPoints: navigator.maxTouchPoints || 0,
      });
    };

    // Listen for changes in media queries
    const coarsePointerQuery = window.matchMedia('(pointer: coarse)');
    const hoverQuery = window.matchMedia('(hover: hover)');

    coarsePointerQuery.addEventListener('change', updateCapabilities);
    hoverQuery.addEventListener('change', updateCapabilities);

    return () => {
      coarsePointerQuery.removeEventListener('change', updateCapabilities);
      hoverQuery.removeEventListener('change', updateCapabilities);
    };
  }, []);

  return touchCapabilities;
};