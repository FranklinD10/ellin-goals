import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { useTheme as useMuiTheme } from '@mui/material/styles';
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

const PageContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  height: '-webkit-fill-available',
  width: '100%',
  backgroundColor: theme.palette.background.default,
  position: 'relative',
}));

const ContentContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  width: '100%',
  maxWidth: isMobile ? '100%' : '800px',
  margin: '0 auto',
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),  paddingBottom: 'calc(76px + env(safe-area-inset-bottom))',
  paddingTop: 'calc(72px + env(safe-area-inset-top))',
  '@supports (-webkit-touch-callout: none)': {
    paddingBottom: 'calc(76px + env(safe-area-inset-bottom))',
    paddingTop: 'calc(72px + env(safe-area-inset-top))',
    minHeight: '-webkit-fill-available',
  },
}));

const AppHeader = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderBottom: `1px solid ${theme.palette.divider}`,
  boxShadow: 'none',
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  paddingTop: 'env(safe-area-inset-top)',
  zIndex: 1200,
  height: 'auto',
  '@supports (-webkit-touch-callout: none)': {
    height: 'calc(64px + env(safe-area-inset-top))',
  },
}));

const BottomNav = styled(Box)(({ theme }) => ({
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: theme.palette.background.paper,
  borderTop: `1px solid ${theme.palette.divider}`,
  paddingBottom: 'env(safe-area-inset-bottom)',
  paddingLeft: 'env(safe-area-inset-left)',
  paddingRight: 'env(safe-area-inset-right)',
  zIndex: 1200,
}));

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
  padding: '12px 0',
  '& .MuiTypography-h6': {
    marginBottom: '2px'
  },
  '& .MuiTypography-caption': {
    marginBottom: '4px'
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

export default function Layout({ children }: LayoutProps) {
  const { colorScheme, toggleColorScheme } = useTheme();
  const muiTheme = useMuiTheme();
  const isOnline = useOnlineStatus();
  const gestureHandlers = useNavigationGestures();

  return (
    <PageContainer>
      <canvas
        id="confetti-canvas"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1000
        }}
      />
      <AppHeader>
        <Container maxWidth={false}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ height: 64 }}
          >
            <Typography variant="h6" fontWeight={700} color="text.primary">
              ElLin Goals
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              {!isOnline && (
                <Typography variant="body2" color="warning.main">
                  Offline Mode
                </Typography>
              )}
              <IconButton
                onClick={() => toggleColorScheme()}
                sx={{ 
                  border: 1,
                  borderColor: 'divider',
                  color: 'text.primary'
                }}
                size="large"
              >
                {colorScheme === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
              <UserSwitcher />
            </Stack>
          </Stack>
        </Container>
      </AppHeader>

      <ContentContainer {...gestureHandlers}>
        {children}
        <Outlet />
      </ContentContainer>

      <BottomNav>
        <Stack
          direction="row"
          justifyContent="space-around"
          alignItems="center"
          sx={{ height: 56 }}
        >
          <NavLink to="/" icon="📊" label="Today" />
          <NavLink to="/manage" icon="🎯" label="Habits" />
          <NavLink to="/analytics" icon="📈" label="Stats" />
          <NavLink to="/settings" icon="⚙️" label="Settings" />
        </Stack>
      </BottomNav>
    </PageContainer>
  );
}
