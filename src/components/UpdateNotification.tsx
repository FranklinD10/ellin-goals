import { useEffect } from 'react';
import { showNotification } from '@mantine/notifications';
import { IconRefresh } from '@tabler/icons-react';

export function UpdateNotification() {
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
                  color: 'blue',
                  icon: <IconRefresh size={16} />,
                  autoClose: false,
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
  }, []);

  return null;
}
