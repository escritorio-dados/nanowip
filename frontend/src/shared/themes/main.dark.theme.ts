import { createTheme } from '@mui/material';
import { orange, grey, blue, green } from '@mui/material/colors';

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: orange[500],
    },
    secondary: {
      main: blue[600],
    },
    success: {
      main: green[500],
    },
    divider: grey[300],
    text: {
      primary: '#fff',
      secondary: grey[500],
    },
    background: {
      default: '#121212',
      paper: grey[900],
    },
    backgoundAlt: grey[800],
  },
});
