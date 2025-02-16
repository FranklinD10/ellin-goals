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

const NotificationContext = createContext<NotificationContextType>({
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
        autoHideDuration={notification?.autoHideDuration || 4000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{
          paddingTop: 'env(safe-area-inset-top)',
          '& .MuiAlert-root': {
            marginTop: 'env(safe-area-inset-top)',
          }
        }}
      >
        <Alert
          onClose={handleClose}
          severity={notification?.color || 'success'}
          variant="filled"
          sx={{
            width: '100%',
            '&.MuiAlert-standardSuccess, &.MuiAlert-filledSuccess': {
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
            },
            '& .MuiAlert-icon': {
              color: 'inherit'
            }
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