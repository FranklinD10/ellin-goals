import { useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import RefreshIcon from '@mui/icons-material/Refresh';

export function UpdateNotification() {
  const { showNotification } = useNotification();

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                showNotification({
                  title: 'Update Available',
                  message: 'A new version is available. Click here to update.',
                  color: 'info',
                  autoHideDuration: null,
                  onClick: () => {
                    newWorker.postMessage({ type: 'SKIP_WAITING' });
                    window.location.reload();
                  }
                });
              }
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
