import { CssBaseline, Snackbar, Alert } from '@mui/material';
import { useState, useEffect } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { UpdateNotification } from './components/UpdateNotification';
import { ErrorBoundary } from './components/ErrorBoundary';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Manage from './pages/Manage';
import HealthCheck from './pages/HealthCheck';
import Settings from './pages/Settings';
import { audioManager } from './utils/audio';

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
  const [isInitialLoaderVisible, setIsInitialLoaderVisible] = useState(true);

  useEffect(() => {
    // Handle initial loader
    const loader = document.getElementById('initial-loader');
    if (loader && isInitialLoaderVisible) {
      loader.classList.add('fade-out');
      setTimeout(() => {
        loader.remove();
        setIsInitialLoaderVisible(false);
      }, 300);
    }
  }, [isInitialLoaderVisible]);

  useEffect(() => {
    // Initialize audio system
    audioManager.initialize().catch(console.error);
  }, []);

  useEffect(() => {
    const cleanup = () => {
      localStorage.setItem('lastSyncTime', Date.now().toString());
    };

    window.addEventListener('beforeunload', cleanup);
    return () => window.removeEventListener('beforeunload', cleanup);
  }, []);

  if (isInitialLoaderVisible) {
    return null;
  }

  return (
    <>
      <CssBaseline />
      <UpdateNotification />
      <RouterProvider router={router} />
    </>
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
