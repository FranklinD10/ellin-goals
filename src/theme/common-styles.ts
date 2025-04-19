import { SxProps } from '@mui/material';

export const commonShadows = {
  sm: '0 1px 3px rgba(0,0,0,0.12)',
  md: '0 4px 6px rgba(0,0,0,0.1)',
  lg: '0 10px 15px rgba(0,0,0,0.1)'
};

export const commonSpacing = {
  page: { p: 2, mb: 'calc(56px + env(safe-area-inset-bottom))' },
  card: { p: 2 },
  stack: { spacing: 2 }
} satisfies Record<string, SxProps>;

export const commonLayouts = {
  centerFlex: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  fullHeight: {
    minHeight: '100vh',
    height: '-webkit-fill-available'
  }
} satisfies Record<string, SxProps>;

export const safeAreaInsets = {
  top: 'env(safe-area-inset-top)',
  bottom: 'env(safe-area-inset-bottom)',
  left: 'env(safe-area-inset-left)',
  right: 'env(safe-area-inset-right)'
};
