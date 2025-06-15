import { useState, useEffect } from 'react';
import { MOBILE_BREAKPOINTS } from '@site-tour-tools/shared';

export const useResponsive = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowSize.width < MOBILE_BREAKPOINTS.MD;
  const isTablet = windowSize.width >= MOBILE_BREAKPOINTS.MD && windowSize.width < MOBILE_BREAKPOINTS.LG;
  const isDesktop = windowSize.width >= MOBILE_BREAKPOINTS.LG;
  const isSmallScreen = windowSize.width < MOBILE_BREAKPOINTS.SM;

  return {
    windowSize,
    isMobile,
    isTablet,
    isDesktop,
    isSmallScreen,
    breakpoints: MOBILE_BREAKPOINTS,
  };
};