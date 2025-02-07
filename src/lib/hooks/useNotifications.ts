/// <reference lib="dom" />
import { useCallback } from 'react';

export const useNotifications = () => {
  const requestPermission = useCallback(async () => {
    if (!('Notification' in globalThis)) {
      return false;
    }
    
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, []);

  const sendNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (Notification && Notification.permission === 'granted') {
      new Notification(title, options);
    }
  }, []);

  return { requestPermission, sendNotification };
};
