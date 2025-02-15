import { Box, AppBar, Toolbar, Typography, IconButton, Container, useTheme, styled } from '@mui/material';
import { DarkMode, LightMode } from '@mui/icons-material';
import { Outlet, Link, useLocation } from 'react-router-dom';
import UserSwitcher from './UserSwitcher';
import useOnlineStatus from '../hooks/useOnlineStatus';
import { useTheme as useAppTheme } from '../contexts/ThemeContext';
import { themes } from '../theme/mui-theme';
import { isMobile, isTablet } from 'react-device-detect';
import { useNavigationGestures } from '../hooks/useNavigationGestures';

interface LayoutProps {
  children?: React.ReactNode;
}

const ConfettiCanvas = styled('canvas')`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 100;
`;

const BottomNav = styled(Box)(({ theme }) => ({
  paddingBottom: 'env(safe-area-inset-bottom)',
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: theme.palette.background.paper,
  borderTop: `1px solid ${theme.palette.divider}`,
  zIndex: 100,
  display: 'flex',
  justifyContent: 'center',
}));

const ResponsiveContainer = styled(Container)(({ theme }) => ({
  maxWidth: isMobile ? '100%' : isTablet ? '768px' : '1200px',
  margin: '0 auto',
  padding: isMobile ? theme.spacing(1) : theme.spacing(2),
}));

const SwipeableContent = styled(Box)`
  touch-action: pan-y;
  position: relative;
  height: 100%;
  padding-top: calc(64px + env(safe-area-inset-top));
  padding-bottom: calc(env(safe-area-inset-bottom) + 80px);
`;

function NavLink({ to, icon, label }: { to: string; icon: string; label: string }) {
  const location = useLocation();
  const { themeColor } = useAppTheme();
  const theme = useTheme();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textDecoration: 'none',
        color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
        flex: 1,
        padding: '8px 0',
      }}
    >
      <Typography variant="h6" component="span">{icon}</Typography>
      <Typography variant="caption">{label}</Typography>
    </Link>
  );
}

export default function Layout({ children }: LayoutProps) {
  const { mode, toggleColorMode } = useAppTheme();
  const theme = useTheme();
  const isOnline = useOnlineStatus();
  const gestureHandlers = useNavigationGestures();

  return (
    <Box>
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{
          bgcolor: 'background.paper',
          borderBottom: `1px solid ${theme.palette.divider}`,
          paddingTop: 'env(safe-area-inset-top)',
        }}
      >
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
            ElLin Goals
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {!isOnline && (
              <Typography variant="body2" color="warning.main">
                Offline Mode
              </Typography>
            )}
            <IconButton
              onClick={() => toggleColorMode()}
              color="inherit"
              edge="end"
            >
              {mode === 'dark' ? <LightMode /> : <DarkMode />}
            </IconButton>
            <UserSwitcher />
          </Box>
        </Toolbar>
      </AppBar>

      <ConfettiCanvas id="confetti-canvas" />
      
      <SwipeableContent {...gestureHandlers}>
        <ResponsiveContainer>
          {children}
          <Outlet />
        </ResponsiveContainer>
      </SwipeableContent>

      <BottomNav>
        <Container maxWidth="sm" disableGutters>
          <Box sx={{ display: 'flex', width: '100%' }}>
            <NavLink to="/" icon="📊" label="Today" />
            <NavLink to="/analytics" icon="📈" label="Stats" />
            <NavLink to="/manage" icon="🎯" label="Habits" />
            <NavLink to="/settings" icon="⚙️" label="Settings" />
          </Box>
        </Container>
      </BottomNav>
    </Box>
  );
}
