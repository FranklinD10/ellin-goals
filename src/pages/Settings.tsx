import { Paper, Stack, FormControl, Typography, ToggleButtonGroup, ToggleButton, IconButton, Box, Tooltip } from '@mui/material';
import { useTheme } from '../contexts/ThemeContext';
import { DarkMode, LightMode, Palette } from '@mui/icons-material';
import { memo } from 'react';
import UpdatesPaper from '../components/UpdatesPaper';
import { themes } from '../theme/mui-theme';
import { PageTransition } from '../components/PageTransition';

interface ColorButtonProps {
  color: string;
  label: string;
  onClick: () => void;
  isSelected: boolean;
}

const ThemeButton = memo(({ color, label, onClick, isSelected }: ColorButtonProps) => (
  <Tooltip title={label} placement="bottom">
    <IconButton
      onClick={onClick}
      sx={{
        backgroundColor: color,
        width: 48,
        height: 48,
        border: theme => isSelected ? `3px solid ${theme.palette.primary.main}` : '3px solid transparent',
        transform: isSelected ? 'scale(1.1)' : 'scale(1)',
        transition: 'all 0.2s ease',
        '&:hover': {
          backgroundColor: color,
          transform: 'scale(1.1)',
        },
        '&:active': {
          transform: 'scale(0.95)',
        },
        '@media (max-width: 768px)': {
          width: 56,
          height: 56,
        }
      }}
    />
  </Tooltip>
));

ThemeButton.displayName = 'ThemeButton';

export default function Settings() {
  const { mode, toggleColorMode, setThemeColor, isSelected } = useTheme();

  return (
    <PageTransition>
      <Box sx={{ maxWidth: 800, mx: 'auto', p: 2, pb: 'calc(env(safe-area-inset-bottom) + 80px)' }}>
        <Stack spacing={3}>
          <Box pt={1}>
            <Typography variant="h5" component="h2">Settings</Typography>
          </Box>

          <Paper sx={{ p: 3 }}>
            <Stack spacing={3}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <IconButton 
                    size="large" 
                    color="primary"
                    sx={{ 
                      bgcolor: theme => theme.palette.action.hover,
                      borderRadius: 2
                    }}
                  >
                    {mode === 'dark' ? <DarkMode /> : <LightMode />}
                  </IconButton>
                  <div>
                    <Typography variant="subtitle1" fontWeight={500}>Theme Mode</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Adjust the appearance of the app
                    </Typography>
                  </div>
                </Stack>

                <FormControl>
                  <ToggleButtonGroup
                    value={mode}
                    exclusive
                    onChange={(_, value) => value && toggleColorMode(value)}
                    aria-label="theme mode"
                  >
                    <ToggleButton value="light">Light</ToggleButton>
                    <ToggleButton value="dark">Dark</ToggleButton>
                  </ToggleButtonGroup>
                </FormControl>
              </Stack>

              <Stack spacing={2}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <IconButton 
                    size="large"
                    color="primary"
                    sx={{ 
                      bgcolor: theme => theme.palette.action.hover,
                      borderRadius: 2
                    }}
                  >
                    <Palette />
                  </IconButton>
                  <div>
                    <Typography variant="subtitle1" fontWeight={500}>Theme Color</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Choose your preferred accent color
                    </Typography>
                  </div>
                </Stack>
                
                <Stack direction="row" spacing={1.5} sx={{ pl: 6.5 }}>
                  {(Object.entries(themes)).map(([key, { main, label }]) => (
                    <ThemeButton
                      key={key}
                      color={main}
                      label={label}
                      onClick={() => setThemeColor(key as any)}
                      isSelected={isSelected(key as any)}
                    />
                  ))}
                </Stack>
              </Stack>
            </Stack>
          </Paper>

          <UpdatesPaper />
        </Stack>
      </Box>
    </PageTransition>
  );
}
