import { createContext, useContext, useState, ReactNode } from 'react';
import { Snackbar, Alert, AlertTitle, AlertColor } from '@mui/material';
import { useTheme } from './ThemeContext';

interface NotificationOptions {
  title?: string;
  message: string;
  color?: AlertColor;
  autoHideDuration?: number;
}

interface NotificationContextType {
  showNotification: (options: NotificationOptions) => void;
}

export const NotificationContext = createContext<NotificationContextType>({
  showNotification: () => {},
});

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notification, setNotification] = useState<NotificationOptions | null>(null);
  const [open, setOpen] = useState(false);
  const { theme } = useTheme();

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
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{
          '& .MuiSnackbar-root': {
            top: 'env(safe-area-inset-top)',
          },
          '& .MuiAlert-root': {
            mt: 'env(safe-area-inset-top)',
            ml: 'env(safe-area-inset-left)',
            mr: 'env(safe-area-inset-right)',
            bgcolor: 'background.paper',
            width: 'auto',
            maxWidth: 'calc(100vw - env(safe-area-inset-left) - env(safe-area-inset-right) - 32px)',
          }
        }}
      >
        <Alert
          elevation={6}
          variant="filled"
          onClose={handleClose}
          severity={notification?.color || 'success'}
          sx={{ 
            width: '100%',
            color: (theme) => theme.palette.mode === 'light' ? theme.palette.text.primary : undefined,
            backgroundColor: (theme) => theme.palette.mode === 'light' ? theme.palette.background.paper : undefined,
          }}
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