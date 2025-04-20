import { useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import RefreshIcon from '@mui/icons-material/Refresh';

export function UpdateNotification() {
  const { showNotification } = useNotification();

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const handleUpdate = (registration: ServiceWorkerRegistration) => {
        const newWorker = registration.installing || registration.waiting;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              const notification = showNotification({
                title: 'Update Available',
                message: 'A new version is available. Click here to update.',
                color: 'info',
                autoHideDuration: undefined,
                action: {
                  label: 'Update Now',
                  icon: RefreshIcon,
                  onClick: () => {
                    newWorker.postMessage({ type: 'SKIP_WAITING' });
                  }
                }
              });

              // Auto-update after 1 hour if user hasn't responded
              setTimeout(() => {
                newWorker.postMessage({ type: 'SKIP_WAITING' });
              }, 60 * 60 * 1000);
            }
          });
        }
      };

      // Check for updates when the app becomes online
      window.addEventListener('online', async () => {
        const registration = await navigator.serviceWorker.ready;
        registration.update();
      });      // Initial setup
      navigator.serviceWorker.ready.then(registration => {
        // Check if there's already a waiting worker
        if (registration.waiting) {
          handleUpdate(registration);
        }

        registration.addEventListener('updatefound', () => {
          handleUpdate(registration);
        });

        // Handle update failures
        window.addEventListener('unhandledrejection', (event) => {
          if (event.reason?.toString().includes('ServiceWorker')) {
            showNotification({
              title: 'Update Error',
              message: 'Failed to update the app. Please refresh the page to try again.',
              color: 'error',
              autoHideDuration: 10000,
            });
          }
        });
      });

      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }
  }, [showNotification]);

  return null;
}
