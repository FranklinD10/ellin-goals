import { useEffect } from 'react';
import { isMobile } from 'react-device-detect';
import { useTheme } from '../contexts/ThemeContext';

export const useMobileTheme = () => {
  const { themeColor, colorScheme } = useTheme();

  useEffect(() => {
    if (isMobile) {
      // Update status bar color for iOS
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', 
          colorScheme === 'dark' ? '#1A1B1E' : '#ffffff'
        );
      }

      // Update iOS status bar style
      const metaStatusBar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
      if (metaStatusBar) {
        metaStatusBar.setAttribute('content', 
          colorScheme === 'dark' ? 'black-translucent' : 'default'
        );
      }
    }
  }, [colorScheme]);

  return { themeColor, colorScheme };
};