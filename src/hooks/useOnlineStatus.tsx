import React from 'react';
import { IconWifi, IconWifiOff } from '@tabler/icons-react';

interface OnlineStatusResult {
  isOnline: boolean;
  icon: React.ReactNode;
}

// Change to default export
export default function useOnlineStatus(): OnlineStatusResult {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isOnline,
    icon: isOnline ? <IconWifi size={16} /> : <IconWifiOff size={16} />
  };
};
