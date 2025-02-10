import { AppShell, Header, Group, Text, Container, Box, ActionIcon, useMantineColorScheme, useMantineTheme } from '@mantine/core';
import { IconMoonStars, IconSun } from '@tabler/icons-react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import UserSwitcher from './UserSwitcher';
import styled from 'styled-components';
import useOnlineStatus from '../hooks/useOnlineStatus';
import { useTheme } from '../contexts/ThemeContext';
import { themes } from '../utils/theme-constants';
import React, { ReactNode } from 'react';

interface LayoutProps {
  children?: ReactNode;
}

// Modify the AppContainer styled component to remove extra top padding
const AppContainer = styled(Container)`
  /* Remove extra top padding to match other pages */
  padding: 0;
  padding-bottom: calc(env(safe-area-inset-bottom) + 60px);
  -webkit-overflow-scrolling: touch;
  overflow-y: auto;
  height: 100%;
  position: relative;
`;

function NavLink({ to, icon, label }: { to: string; icon: string; label: string }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  const { themeColor } = useTheme();
  return (
    <Link
      to={to}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textDecoration: 'none',
        color: isActive ? themes[themeColor].color : '#666',
        flex: 1,
        padding: '8px 0'
      }}
    >
      <Text size="xl">{icon}</Text>
      <Text size="xs">{label}</Text>
    </Link>
  );
}

const ConfettiCanvas = styled.canvas`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 100;
`;

export default function Layout({ children }: LayoutProps) {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const theme = useMantineTheme();
  const isOnline = useOnlineStatus();

  const handleToggleColorScheme = () => {
    toggleColorScheme();
  };

  return (
    <AppShell
      header={
        <Header 
          height={60} 
          p="md" 
          sx={{ 
            position: 'fixed',
            marginTop: 'env(safe-area-inset-top)',
            top: 0,
            width: '100%',
            backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
            borderBottom: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[2]}`
          }}
        >
          <Container 
            size="sm" 
            px="xs"
            sx={{ height: '100%' }}
          >
            <Group position="apart" align="center" sx={{ height: '100%' }}>
              <Text size="lg" weight={700}>ElLin Goals</Text>
              <Group spacing="sm" align="center">
                {!isOnline && (
                  <Text size="sm" color="yellow">Offline Mode</Text>
                )}
                <ActionIcon
                  variant="outline"
                  color={colorScheme === 'dark' ? 'yellow' : 'blue'}
                  onClick={handleToggleColorScheme}
                  title="Toggle color scheme"
                  size="md"
                >
                  {colorScheme === 'dark' ? <IconSun size={18} /> : <IconMoonStars size={18} />}
                </ActionIcon>
                <UserSwitcher />
              </Group>
            </Group>
          </Container>
        </Header>
      }
      styles={(theme) => ({
        main: {
          backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0]
        }
      })}
    >
      <ConfettiCanvas id="confetti-canvas" />
      <AppContainer size="sm" px="xs" sx={{ minHeight: 'calc(100vh - env(safe-area-inset-bottom))' }}>
        {children}
        <Outlet />
      </AppContainer>
      <Box
        sx={(theme) => ({
          paddingBottom: 'env(safe-area-inset-bottom)',
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
          borderTop: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[2]}`,
          zIndex: 100,
          textAlign: 'center'
        })}
      >
        <Group spacing={0} position="center" sx={{ width: '100%' }}>
          <NavLink to="/" icon="📊" label="Today" />
          <NavLink to="/analytics" icon="📈" label="Stats" />
          <NavLink to="/manage" icon="🎯" label="Habits" />
          <NavLink to="/settings" icon="⚙️" label="Settings" />
        </Group>
        <Text size="xs" color="dimmed" align="center" py={4}>
          Created by Franklin with 💖
        </Text>
      </Box>
    </AppShell>
  );
}
