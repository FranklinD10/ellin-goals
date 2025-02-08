import { ColorScheme } from '@mantine/core';

declare global {
  var toggleColorScheme: (value?: ColorScheme) => Promise<void>;
}

export {};
