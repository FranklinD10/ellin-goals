import { AppBar, Box, Container, IconButton, Typography, Stack, useTheme as useMuiTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { Outlet, Link, useLocation } from 'react-router-dom';
import UserSwitcher from './UserSwitcher';
import useOnlineStatus from '../hooks/useOnlineStatus';
import { useTheme } from '../contexts/ThemeContext';
import { themes } from '../utils/theme-constants';
import React, { ReactNode } from 'react';
import { isMobile, isTablet } from 'react-device-detect';
import { useNavigationGestures } from '../hooks/useNavigationGestures';

interface LayoutProps {
  children?: ReactNode;
}

const AppContainer = styled(Container)(({ theme }) => ({
  padding: 16,
  paddingTop: `calc(env(safe-area-inset-top) + ${theme.spacing(2)})`,
  paddingBottom: `calc(env(safe-area-inset-bottom) + ${theme.spacing(7.5)})`,
  margin: '0 auto',
  maxWidth: 800,
  WebkitOverflowScrolling: 'touch',
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  position: 'relative',
  '@supports (-webkit-touch-callout: none)': {
    // iOS-specific fix for momentum scrolling
    height: '-webkit-fill-available',
  },
}));

const ResponsiveContainer = styled('div')({
  maxWidth: isMobile ? '100%' : isTablet ? '768px' : '1200px',
  margin: '0 auto',
  padding: isMobile ? '8px' : '16px',
});

const BottomNavigation = styled(Box)(({ theme }) => ({
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: theme.palette.background.paper,
  borderTop: `1px solid ${theme.palette.divider}`,
  zIndex: 1200,
  height: 56,
  paddingBottom: 'env(safe-area-inset-bottom)',
  '& .MuiTypography-caption': {
    marginTop: '4px'  // Space between icon and text
  },
  '@supports (-webkit-touch-callout: none)': {
    // iOS-specific fix for bottom navigation
    height: 'calc(56px + env(safe-area-inset-bottom))',
  },
}));

const ContentContainer = styled(ResponsiveContainer)({
  paddingBottom: 'calc(56px + env(safe-area-inset-bottom))', // Just nav height + safe area
  WebkitOverflowScrolling: 'touch',
  position: 'relative',
  zIndex: 1
});

const SwipeableContainer = styled(ContentContainer)({
  touchAction: 'pan-y',
  position: 'relative',
  height: '100%',
});

const NavLinkStyled = styled(Link, {
  shouldForwardProp: (prop) => prop !== 'active' && prop !== 'color',
})<{ active: boolean; color: string }>(({ active, color, theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textDecoration: 'none',
  color: active ? color : theme.palette.text.secondary,
  flex: 1,
  padding: '8px 0',
  height: '100%',
  '& .MuiTypography-h6': {
    marginBottom: '2px'  // Space between icon and text
  },
  '& .MuiTypography-caption': {
    marginBottom: '4px'  // Space between text and bottom
  }
}));

function NavLink({ to, icon, label }: { to: string; icon: string; label: string }) {
  const location = useLocation();
  const { themeColor } = useTheme();
  const isActive = location.pathname === to;
  
  return (
    <NavLinkStyled
      to={to}
      active={isActive}
      color={themes[themeColor].color}
    >
      <Typography variant="h6">{icon}</Typography>
      <Typography variant="caption">{label}</Typography>
    </NavLinkStyled>
  );
}

const ConfettiCanvas = styled('canvas')({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
  zIndex: 100,
});

export default function Layout({ children }: LayoutProps) {
  const { colorScheme, toggleColorScheme } = useTheme();
  const muiTheme = useMuiTheme();
  const isOnline = useOnlineStatus();
  const gestureHandlers = useNavigationGestures();

  // Update CSS variables when theme changes
  React.useEffect(() => {
    document.documentElement.style.setProperty(
      '--safe-area-top-color',
      muiTheme.palette.background.paper
    );
    document.documentElement.style.setProperty(
      '--safe-area-bottom-color',
      muiTheme.palette.background.paper
    );
  }, [muiTheme.palette.background.paper]);

  const handleToggleColorScheme = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    toggleColorScheme();
  };

  return (
    <Box sx={{ 
      bgcolor: 'background.default',
      minHeight: '100vh',
      minHeight: '-webkit-fill-available',
      display: 'flex',
      flexDirection: 'column',
      paddingTop: `calc(64px + env(safe-area-inset-top))`,
      '@supports (-webkit-touch-callout: none)': {
        // iOS-specific padding adjustments
        paddingTop: `calc(64px + env(safe-area-inset-top))`,
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
      }
    }}>
      <AppBar 
        position="fixed"
        elevation={0}
        sx={{ 
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
          top: 0,
          left: 0,
          right: 0,
          pt: 'env(safe-area-inset-top)',
          pl: 'env(safe-area-inset-left)',
          pr: 'env(safe-area-inset-right)',
          height: 'auto',
          '@supports (-webkit-touch-callout: none)': {
            height: 'calc(64px + env(safe-area-inset-top))',
          }
        }}
      >
        <Container maxWidth={false} sx={{ px: 2, height: 64 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ height: '100%', maxWidth: 800, mx: 'auto' }}
          >
            <Typography 
              variant="h6" 
              fontWeight={700} 
              sx={{ 
                flexShrink: 0,
                color: 'text.primary' // Ensure text is visible in both modes
              }}
            >
              ElLin Goals
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              {!isOnline && (
                <Typography variant="body2" color="warning.main">Offline Mode</Typography>
              )}
              <IconButton
                onClick={handleToggleColorScheme}
                sx={{ 
                  color: 'text.primary', // Ensure icon is visible in both modes
                  border: 1,
                  borderColor: 'divider'
                }}
                size="large"
              >
                {colorScheme === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
              <UserSwitcher />
            </Stack>
          </Stack>
        </Container>
      </AppBar>

      <ConfettiCanvas id="confetti-canvas" />
      <SwipeableContainer {...gestureHandlers}>
        {children}
        <Outlet />
      </SwipeableContainer>
      
      <BottomNavigation>
        <Stack
          direction="row"
          justifyContent="center"
          alignItems="center"
          sx={{ 
            width: '100%', 
            height: '100%',
            pb: 'env(safe-area-inset-bottom)'
          }}
        >
          <NavLink to="/" icon="📊" label="Today" />
          <NavLink to="/manage" icon="🎯" label="Habits" />
          <NavLink to="/analytics" icon="📈" label="Stats" />
          <NavLink to="/settings" icon="⚙️" label="Settings" />
        </Stack>
      </BottomNavigation>
    </Box>
  );
}
