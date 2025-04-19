import { Box, Paper, Stack, Typography, ToggleButtonGroup, ToggleButton, IconButton, Tooltip, Divider, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTheme } from '../contexts/ThemeContext';
import PaletteIcon from '@mui/icons-material/Palette';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import InfoIcon from '@mui/icons-material/Info';
import { memo } from 'react';
import UpdatesPaper from '../components/UpdatesPaper';
import { PageTransition } from '../components/PageTransition';
import { themes } from '../utils/theme-constants';
import { ThemeColorType } from '../types/user';

const TouchFriendlyIconButton = styled(IconButton)(({ theme }) => ({
  minWidth: 48,
  minHeight: 48,
  [theme.breakpoints.down('sm')]: {
    minWidth: 56,
    minHeight: 56,
  },
}));

interface ColorButtonProps {
  selected?: boolean;
  customColor?: string;
  color?: string;
}

const ColorButton = styled(TouchFriendlyIconButton, {
  shouldForwardProp: (prop) => prop !== 'selected' && prop !== 'customColor',
})<ColorButtonProps>(({ theme, selected, customColor }) => ({
  backgroundColor: customColor,
  border: selected ? `3px solid ${theme.palette.primary.main}` : '3px solid transparent',
  transform: selected ? 'scale(1.1)' : 'scale(1)',
  transition: 'all 0.2s ease',
  width: 48,
  height: 48,
  padding: 0,
  '&:active': {
    transform: 'scale(0.95)',
  },
  '&:hover': {
    backgroundColor: customColor,
    transform: 'scale(1.1)',
  },
}));

const SettingsContainer = styled(Box)(({ theme }) => ({
  maxWidth: 800,
  margin: '0 auto',
  padding: 16,
  paddingTop: 'env(safe-area-inset-top)',
  paddingBottom: 'calc(env(safe-area-inset-bottom) + 80px)',
}));

interface ThemeButtonProps {
  color: string;
  label: string;
  onClick: () => void;
  selected: boolean;
}

const ThemeButton = memo(({ color, label, onClick, selected }: ThemeButtonProps) => (
  <Tooltip title={label} placement="bottom">
    <Box>
      <ColorButton
        size="large"
        customColor={color}
        onClick={onClick}
        selected={selected}
      />
    </Box>
  </Tooltip>
));

ThemeButton.displayName = 'ThemeButton';

export default function Settings() {
  const { colorScheme, toggleColorScheme, setThemeColor, isSelected } = useTheme();

  return (
    <PageTransition>
      <SettingsContainer>
        <Stack spacing={3}>
          <Box pt={2}>
            <Typography variant="h5">Settings</Typography>
          </Box>

          <Paper sx={{ p: 3 }}>
            <Stack spacing={3}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Stack direction="row" spacing={2} alignItems="center">
                  <TouchFriendlyIconButton size="large" color="primary">
                    {colorScheme === 'dark' ? <DarkModeIcon /> : <LightModeIcon />}
                  </TouchFriendlyIconButton>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={500}>Theme Mode</Typography>
                    <Typography variant="body2" color="text.secondary">Adjust the appearance of the app</Typography>
                  </Box>
                </Stack>
                <ToggleButtonGroup
                  value={colorScheme}
                  exclusive
                  onChange={(_, value) => value && toggleColorScheme(value)}
                  size="large"
                >
                  <ToggleButton value="light">Light</ToggleButton>
                  <ToggleButton value="dark">Dark</ToggleButton>
                </ToggleButtonGroup>
              </Stack>

              <Box sx={{ height: 1, bgcolor: 'divider' }} />

              <Stack spacing={2}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <TouchFriendlyIconButton size="large" color="primary">
                    <PaletteIcon />
                  </TouchFriendlyIconButton>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={500}>Theme Color</Typography>
                    <Typography variant="body2" color="text.secondary">Choose your preferred accent color</Typography>
                  </Box>
                </Stack>
                
                <Box pl={6.5}>
                  <Grid container spacing={1.5} sx={{ maxWidth: 500 }}>
                    {Object.entries(themes).map(([key, { color, label }]) => (
                      <Grid item key={key}>
                        <ThemeButton
                          color={color}
                          label={label}
                          onClick={() => setThemeColor(key as ThemeColorType)}
                          selected={isSelected(key as ThemeColorType)}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Stack>
            </Stack>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Stack direction="row" spacing={2} alignItems="center">
                <IconButton size="large" color="primary">
                  <InfoIcon />
                </IconButton>
                <Box>
                  <Typography variant="subtitle1" fontWeight={500}>About</Typography>
                  <Typography variant="body2" color="text.secondary">App information</Typography>
                </Box>
              </Stack>

              <Divider />

              <Stack spacing={1} pl={6.5}>
                <Typography variant="body2">
                  Created by Franklin with 💖
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Version {import.meta.env.VITE_APP_VERSION || '2.5.0'}
                </Typography>
              </Stack>
            </Stack>
          </Paper>

          <UpdatesPaper />
        </Stack>
      </SettingsContainer>
    </PageTransition>
  );
}
