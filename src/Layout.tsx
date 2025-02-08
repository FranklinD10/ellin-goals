import { ActionIcon } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { IconSun, IconMoonStars } from '@tabler/icons-react';

// ...existing imports...

export default function Layout() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  
  // ...existing code...
  
  return (
    <ActionIcon
      variant="outline"
      color={colorScheme === 'dark' ? 'yellow' : 'blue'}
      onClick={() => toggleColorScheme()}
      title="Toggle color scheme"
    >
      {colorScheme === 'dark' ? <IconSun size={18} /> : <IconMoonStars size={18} />}
    </ActionIcon>
  );
  
  // ...rest of the code...
}
