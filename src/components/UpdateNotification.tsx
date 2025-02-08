import { useEffect } from 'react';
import { showNotification } from '@mantine/notifications';
import { IconRefresh } from '@tabler/icons-react';

export function UpdateNotification() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        showNotification({
          title: 'Update Available',
          message: 'A new version is available. Reload to update.',
          color: 'blue',
          icon: <IconRefresh size={16} />,
          autoClose: false,
          onClick: () => window.location.reload()
        });
      });
    }
  }, []);

  return null;
}
