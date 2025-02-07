import { MantineProvider, ColorSchemeProvider, ColorScheme, MantineTheme, MantineThemeOverride, LoadingOverlay } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { UserProvider, useUser } from './contexts/UserContext';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Manage from './pages/Manage';
import HealthCheck from './pages/HealthCheck';
import { getUserSettings, saveUserSettings } from './lib/firestore';
import { UserSettings } from './types';

const getTheme = (colorScheme: ColorScheme): MantineThemeOverride => ({
  colorScheme,
  colors: {
    primary: ['#FF4B4B', '#FF4B4B', '#FF4B4B', '#FF4B4B', '#FF4B4B', '#FF4B4B', '#FF4B4B', '#FF4B4B', '#FF4B4B', '#FF4B4B'] as const,
    gray: colorScheme === 'dark' 
      ? ['#C1C2C5', '#A6A7AB', '#909296', '#5C5F66', '#373A40', '#2C2E33', '#25262B', '#1A1B1E', '#141517', '#101113']
      : ['#F8F9FA', '#F1F3F5', '#E9ECEF', '#DEE2E6', '#CED4DA', '#ADB5BD', '#868E96', '#495057', '#343A40', '#212529']
  },
  primaryColor: 'primary',
  globalStyles: (theme: MantineTheme) => ({
    body: {
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
      maxWidth: '430px',
      margin: '0 auto',
    },
  }),
  components: {
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
    },
    Notification: {
      styles: {
        root: {
          '&::before': { display: 'none' }
        }
      }
    }
  },
  radius: {
    sm: '6px',
    md: '10px',
    lg: '12px',
    xl: '16px'
  },
  shadows: {
    sm: '0 1px 3px rgba(0,0,0,0.1)',
    md: '0 4px 6px rgba(0,0,0,0.07)',
    lg: '0 10px 15px rgba(0,0,0,0.07)'
  }
});

export default function App() {
  const [colorScheme, setColorScheme] = useState<ColorScheme>('light');
  const { userData, currentUser } = useUser();

  useEffect(() => {
    if (userData?.settings?.theme) {
      setColorScheme(userData.settings.theme);
    }
  }, [userData]);

  const toggleColorScheme = async (value?: ColorScheme) => {
    const newTheme = value || (colorScheme === 'dark' ? 'light' : 'dark');
    setColorScheme(newTheme);
    
    const settings: UserSettings = {
      theme: newTheme,
      notifications: userData?.settings?.notifications ?? true
    };
    
    await saveUserSettings(currentUser, settings);
  };

  return (
    <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
      <MantineProvider theme={getTheme(colorScheme)} withGlobalStyles withNormalizeCSS>
        <Notifications position="top-right" zIndex={2000} />
        <AuthProvider>
          <UserProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="manage" element={<Manage />} />
                  <Route path="health" element={<HealthCheck />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </UserProvider>
        </AuthProvider>
      </MantineProvider>
    </ColorSchemeProvider>
  );
}
