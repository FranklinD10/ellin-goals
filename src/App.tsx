import { MantineProvider, ColorSchemeProvider, ColorScheme, MantineThemeOverride, LoadingOverlay, MantineTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { useState, useMemo } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { UpdateNotification } from './components/UpdateNotification';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Manage from './pages/Manage';
import HealthCheck from './pages/HealthCheck';
import Settings from './pages/Settings';
import { audioManager } from './utils/audio';
import { ThemeColorType } from './types/user';

const themes = {
  red: { color: '#FF4B4B', label: 'Red' },
  pink: { color: '#FF69B4', label: 'Pink' },
  purple: { color: '#9C27B0', label: 'Purple' },
  blue: { color: '#2196F3', label: 'Blue' },
  green: { color: '#4CAF50', label: 'Green' },
  yellow: { color: '#FFC107', label: 'Yellow' },
} as const;

const themeColors: Record<string, [string, string, string, string, string, string, string, string, string, string]> = {
  red: new Array(10).fill('#FF4B4B') as [string, string, string, string, string, string, string, string, string, string],
  pink: new Array(10).fill('#FF69B4') as [string, string, string, string, string, string, string, string, string, string],
  purple: new Array(10).fill('#9C27B0') as [string, string, string, string, string, string, string, string, string, string],
  blue: new Array(10).fill('#2196F3') as [string, string, string, string, string, string, string, string, string, string],
  green: new Array(10).fill('#4CAF50') as [string, string, string, string, string, string, string, string, string, string],
  yellow: new Array(10).fill('#FFC107') as [string, string, string, string, string, string, string, string, string, string]
};

const getThemeColors = (color: string): [string, string, string, string, string, string, string, string, string, string] => {
  const baseColor = themes[color as ThemeColorType].color;
  return [
    baseColor,
    baseColor,
    baseColor,
    baseColor,
    baseColor,
    baseColor,
    baseColor,
    baseColor,
    baseColor,
    baseColor,
  ];
};

// Create router with future flags
const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "analytics", element: <Analytics /> },
      { path: "manage", element: <Manage /> },
      { path: "health", element: <HealthCheck /> },
      { path: "settings", element: <Settings /> }
    ],
  }
], {
  future: {
    v7_relativeSplatPath: true
  }
});

function AppContent() {
  const { colorScheme, themeColor, toggleColorScheme } = useTheme();
  const [isInitialLoaderVisible, setIsInitialLoaderVisible] = useState(true);

  useEffect(() => {
    // Handle initial loader
    const loader = document.getElementById('initial-loader');
    if (loader && isInitialLoaderVisible) {
      // Add fade-out class to trigger transition
      loader.classList.add('fade-out');
      
      // Remove loader after transition
      setTimeout(() => {
        loader.remove();
        setIsInitialLoaderVisible(false);
      }, 300);
    }

    // Update theme color CSS variable
    document.documentElement.style.setProperty('--theme-color', themes[themeColor].color);
  }, [themeColor, isInitialLoaderVisible]);

  const theme = useMemo(() => ({
    colorScheme,
    colors: {
      primary: getThemeColors(themeColor),
      gray: Array(10).fill('').map((_, i) => 
        colorScheme === 'dark' 
          ? ['#C1C2C5', '#A6A7AB', '#909296', '#5C5F66', '#373A40', '#2C2E33', '#25262B', '#1A1B1E', '#141517', '#101113'][i]
          : ['#F8F9FA', '#F1F3F5', '#E9ECEF', '#DEE2E6', '#CED4DA', '#ADB5BD', '#868E96', '#495057', '#343A40', '#212529'][i]
      ) as [string, string, string, string, string, string, string, string, string, string]
    },
    primaryColor: 'primary',
    components: {
      LoadingOverlay: {
        defaultProps: {
          loaderProps: {
            color: themes[themeColor].color,
            size: 'xl',
            variant: 'oval'
          }
        }
      },
      Card: {
        defaultProps: {
          p: 'md',
          radius: 'md',
        }
      },
      Button: {
        defaultProps: {
          size: 'lg',
          radius: 'md',
        }
      }
    }
  }), [colorScheme, themeColor]);

  useEffect(() => {
    // Initialize audio system
    audioManager.initialize().catch(console.error);
    
    // Remove initial loader
    const loader = document.getElementById('initial-loader');
    if (loader) {
      loader.style.opacity = '0';
      loader.style.transition = 'opacity 0.3s ease-out';
      setTimeout(() => loader.remove(), 300);
    }
  }, []);

  useEffect(() => {
    const cleanup = () => {
      // Ensure any pending syncs are processed before unload
      localStorage.setItem('lastSyncTime', Date.now().toString());
    };

    window.addEventListener('beforeunload', cleanup);
    return () => window.removeEventListener('beforeunload', cleanup);
  }, []);

  return (
    <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
      <MantineProvider 
        theme={theme} 
        withGlobalStyles 
        withNormalizeCSS
      >
        {!isInitialLoaderVisible && (
          <>
            <Notifications position="top-right" zIndex={2000} />
            <UpdateNotification /> {/* Make sure this is included */}
            <RouterProvider router={router} />
          </>
        )}
      </MantineProvider>
    </ColorSchemeProvider>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <UserProvider>
          <ThemeProvider>
            <AppContent />
          </ThemeProvider>
        </UserProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
