type ColorScheme = 'light' | 'dark';

declare global {
  var toggleColorScheme: (value?: ColorScheme) => Promise<void>;
}

export {};
