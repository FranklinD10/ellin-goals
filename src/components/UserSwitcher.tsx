import { Menu, UnstyledButton, Group, Avatar, Text } from '@mantine/core';
import { IconChevronDown } from '@tabler/icons-react';
import { useUser } from '../contexts/UserContext';

export default function UserSwitcher() {
  const { currentUser, setCurrentUser } = useUser();

  const userDetails = {
    El: { color: 'pink', avatar: '👩' },
    Lin: { color: 'blue', avatar: '👨' }
  };

  return (
    <Menu shadow="md" width={200} position="bottom-end">
      <Menu.Target>
        <UnstyledButton
          sx={(theme) => ({
            display: 'flex',
            alignItems: 'center',
            padding: theme.spacing.xs,
            borderRadius: theme.radius.md,
            border: `1px solid ${
              theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]
            }`,
            '&:hover': {
              backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[0]
            }
          })}
        >
          <Group spacing="xs">
            <Avatar size={24} radius="xl">
              {userDetails[currentUser].avatar}
            </Avatar>
            <Text size="sm" weight={500}>
              {currentUser}
            </Text>
            <IconChevronDown size={16} />
          </Group>
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown>
        {Object.entries(userDetails).map(([user, details]) => (
          <Menu.Item
            key={user}
            icon={<Text>{details.avatar}</Text>}
            onClick={() => setCurrentUser(user as 'El' | 'Lin')}
            sx={{ fontWeight: currentUser === user ? 600 : 400 }}
          >
            {user}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}
