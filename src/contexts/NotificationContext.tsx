import { createContext, useContext, useState, ReactNode } from 'react';
import { Snackbar, Alert, AlertTitle, AlertColor } from '@mui/material';

interface NotificationOptions {
  title?: string;
  message: string;
  color?: AlertColor;
  autoHideDuration?: number;
}

interface NotificationContextType {
  showNotification: (options: NotificationOptions) => void;
}

const NotificationContext = createContext<NotificationContextType>({
  showNotification: () => {},
});

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notification, setNotification] = useState<NotificationOptions | null>(null);
  const [open, setOpen] = useState(false);

  const showNotification = (options: NotificationOptions) => {
    setNotification(options);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={notification?.autoHideDuration || 4000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{
          // Add padding for iOS safe area at the top
          paddingTop: 'env(safe-area-inset-top)',
          '& .MuiAlert-root': {
            marginTop: 'env(safe-area-inset-top)' // Ensure first notification respects safe area
          }
        }}
      >
        <Alert
          onClose={handleClose}
          severity={notification?.color || 'success'}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification?.title && (
            <AlertTitle>{notification.title}</AlertTitle>
          )}
          {notification?.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
}

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};