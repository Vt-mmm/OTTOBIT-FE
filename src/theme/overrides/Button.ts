import { alpha, Theme } from '@mui/material/styles';
import { customShadows } from '../customShadows';

// ----------------------------------------------------------------------

export default function Button(theme: Theme) {
  return {
    MuiButton: {
      styleOverrides: {
        root: {
          '&:hover': {
            boxShadow: 'none',
          },
        },
        sizeLarge: {
          height: 48,
        },
        containedInherit: {
          color: theme.palette.grey[800],
          boxShadow: customShadows.z8,
          '&:hover': {
            backgroundColor: theme.palette.grey[400],
          },
        },        containedPrimary: {
          boxShadow: '0px 8px 16px -4px rgba(35, 36, 29, 0.25)',
          backgroundColor: '#49467E',
          color: theme.palette.common.white,
          borderRadius: 77,
          fontWeight: 500,
          fontSize: 16,
          padding: '8px 16px',
          '&:hover': {
            backgroundColor: '#3e3a69',
            boxShadow: '0px 6px 12px -3px rgba(35, 36, 29, 0.3)',
          },
        },
        containedSecondary: {
          boxShadow: customShadows.secondary,
        },
        outlinedInherit: {
          border: `1px solid ${alpha(theme.palette.grey[500], 0.32)}`,
          '&:hover': {
            backgroundColor: theme.palette.action.hover,
          },
        },
        textInherit: {
          '&:hover': {
            backgroundColor: theme.palette.action.hover,
          },
        },
      },
    },
  };
}
