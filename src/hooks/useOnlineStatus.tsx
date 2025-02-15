import { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import WifiIcon from '@mui/icons-material/Wifi';
import WifiOffIcon from '@mui/icons-material/WifiOff';

const useOnlineStatus = (): boolean => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const { showNotification } = useNotification();

  useEffect(() => {
    const createNotification = (isOnline: boolean) => ({
      title: isOnline ? 'Connected' : 'Offline',
      message: isOnline ? 'Back online' : 'Working in offline mode',
      color: isOnline ? 'success' : 'warning'
    });

    const handleOnline = () => {
      setIsOnline(true);
      showNotification(createNotification(true));
    };

    const handleOffline = () => {
      setIsOnline(false);
      showNotification(createNotification(false));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showNotification]);

  return isOnline;
};

export default useOnlineStatus;
