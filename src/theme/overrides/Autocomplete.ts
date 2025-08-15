import { customShadows } from '../customShadows';

// ----------------------------------------------------------------------

export default function Autocomplete() {
  return {
    MuiAutocomplete: {
      styleOverrides: {
        paper: {
          boxShadow: customShadows.z20,
        },
      },
    },
  };
}