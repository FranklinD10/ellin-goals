import { AppShell, Header, Group, Text, Container, Box, ActionIcon, useMantineColorScheme } from '@mantine/core';
import { IconMoonStars, IconSun } from '@tabler/icons-react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import UserSwitcher from './UserSwitcher';

function NavLink({ to, icon, label }: { to: string; icon: string; label: string }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textDecoration: 'none',
        color: isActive ? '#FF4B4B' : '#666',
        flex: 1,
        padding: '8px 0'
      }}
    >
      <Text size="xl">{icon}</Text>
      <Text size="xs">{label}</Text>
    </Link>
  );
}

export default function Layout() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  return (
    <AppShell
      padding={0}
      header={
        <Header height={60} p="md" sx={{ position: 'fixed', top: 0, width: '100%' }}>
          <Container size="sm" px="xs">
            <Group position="apart">
              <Text size="lg" weight={700}>ElLin Goals</Text>
              <Group>
                <ActionIcon
                  variant="outline"
                  color={colorScheme === 'dark' ? 'yellow' : 'blue'}
                  onClick={() => toggleColorScheme()}
                  title="Toggle color scheme"
                >
                  {colorScheme === 'dark' ? <IconSun size={18} /> : <IconMoonStars size={18} />}
                </ActionIcon>
                <UserSwitcher />
              </Group>
            </Group>
          </Container>
        </Header>
      }
    >
      <Container size="sm" px="xs" mt={60} mb={60} style={{ minHeight: 'calc(100vh - 120px)' }}>
        <Outlet />
      </Container>

      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: 60,
          backgroundColor: 'white',
          borderTop: '1px solid #eee',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          padding: '0 16px',
          zIndex: 100
        }}
      >
        <NavLink to="/" icon="📊" label="Today" />
        <NavLink to="/analytics" icon="📈" label="Stats" />
        <NavLink to="/manage" icon="🎯" label="Habits" />
      </Box>
    </AppShell>
  );
}
