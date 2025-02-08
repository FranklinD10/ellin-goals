import { Center, Loader, Stack, Text } from '@mantine/core';
import { useTheme } from '../contexts/ThemeContext';

interface ThemedLoaderProps {
  text?: string;
}

export function ThemedLoader({ text }: ThemedLoaderProps) {
  const { themeColor } = useTheme();
  
  return (
    <Center style={{ height: '100%', minHeight: 200 }}>
      <Stack align="center" spacing="sm">
        <Loader color={themeColor} size="xl" variant="oval" />
        {text && <Text size="sm" color="dimmed">{text}</Text>}
      </Stack>
    </Center>
  );
}
