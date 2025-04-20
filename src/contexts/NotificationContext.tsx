import { createContext, useContext, useState, ReactNode } from 'react';
import { Snackbar, Alert, AlertTitle, AlertColor, Button } from '@mui/material';
import { useTheme } from './ThemeContext';

interface NotificationOptions {
  title?: string;
  message: string;
  color?: AlertColor;
  autoHideDuration?: number;
  action?: {
    label: string;
    icon?: React.ComponentType;
    onClick: () => void;
  };
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
  const [notificationQueue, setNotificationQueue] = useState<NotificationOptions[]>([]);
  const { theme } = useTheme();

  const showNotification = (options: NotificationOptions) => {
    if (!open) {
      setNotification(options);
      setOpen(true);
    } else {
      setNotificationQueue(prev => [...prev, options]);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      if (notificationQueue.length > 0) {
        const nextNotification = notificationQueue[0];
        setNotificationQueue(prev => prev.slice(1));
        setNotification(nextNotification);
        setOpen(true);
      }
    }, 150); // Small delay between notifications
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
          severity={notification?.color || 'success'}          sx={{ 
            width: '100%',
            color: (theme) => theme.palette.mode === 'light' ? theme.palette.getContrastText(theme.palette.background.paper) : '#fff',
            backgroundColor: (theme) => {
              const color = notification?.color || 'success';
              return theme.palette.mode === 'light' ? theme.palette[color].light : theme.palette[color].main;
            },
          }}
          action={
            notification?.action ? (
              <Button
                color="inherit"
                size="small"
                startIcon={notification.action.icon ? <notification.action.icon /> : null}
                onClick={() => {
                  notification.action?.onClick();
                  handleClose();
                }}
              >
                {notification.action.label}
              </Button>
            ) : undefined
          }
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