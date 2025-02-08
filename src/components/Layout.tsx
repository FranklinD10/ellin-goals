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
      <canvas
        id="confetti-canvas"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 100
        }}
      />
      <Container size="sm" px="xs" mt={60} mb={60} style={{ minHeight: 'calc(100vh - 120px)' }}>
        <Outlet />
      </Container>

      <Box
        sx={(theme) => ({
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
          borderTop: `1px solid ${
            theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[2]
          }`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        })}
      >
        <Group spacing={0} position="center" sx={{ width: '100%' }}>
          <NavLink to="/" icon="📊" label="Today" />
          <NavLink to="/analytics" icon="📈" label="Stats" />
          <NavLink to="/manage" icon="🎯" label="Habits" />
        </Group>
        <Text size="xs" color="dimmed" py={4}>
          Created by Franklin with 💖
        </Text>
      </Box>
    </AppShell>
  );
}
