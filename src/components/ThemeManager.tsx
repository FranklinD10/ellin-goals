import { useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useUser } from '../contexts/UserContext';

interface ThemeManagerProps {
  children: React.ReactNode;
}

export default function ThemeManager({ children }: ThemeManagerProps) {
  const { userData } = useUser();
  const { toggleColorScheme, setThemeColor } = useTheme();

  useEffect(() => {
    if (userData?.settings) {
      toggleColorScheme(userData.settings.theme);
      setThemeColor(userData.settings.themeColor);
    }
  }, [userData, toggleColorScheme, setThemeColor]);

  return <>{children}</>;
}
