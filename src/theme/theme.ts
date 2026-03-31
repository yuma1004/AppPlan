import { createTheme } from '@mui/material/styles';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#1e1e1e', // VS Code-like background
      paper: '#252526',   // Slightly lighter for panels
    },
    primary: {
      main: '#61dafb', // Technical blue
      light: '#9ff0ff',
      dark: '#00a8c8',
    },
    secondary: {
      main: '#ce9178', // String-like orange
    },
    text: {
      primary: '#d4d4d4',
      secondary: '#a0a0a0',
    },
    divider: '#3c3c3c',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h6: {
      fontWeight: 600,
    },
    subtitle1: {
      fontWeight: 500,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: '#424242 #1e1e1e',
          '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
            backgroundColor: '#1e1e1e',
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
            borderRadius: 8,
            backgroundColor: '#424242',
            minHeight: 24,
            border: '2px solid #1e1e1e',
          },
          '&::-webkit-scrollbar-thumb:focus, & *::-webkit-scrollbar-thumb:focus': {
            backgroundColor: '#4f4f4f',
          },
          '&::-webkit-scrollbar-thumb:active, & *::-webkit-scrollbar-thumb:active': {
            backgroundColor: '#4f4f4f',
          },
          '&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover': {
            backgroundColor: '#4f4f4f',
          },
          '&::-webkit-scrollbar-corner, & *::-webkit-scrollbar-corner': {
            backgroundColor: '#1e1e1e',
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          marginBottom: 4,
          '&.Mui-selected': {
            backgroundColor: 'rgba(97, 218, 251, 0.12)',
            borderLeft: '3px solid #61dafb',
            '&:hover': {
              backgroundColor: 'rgba(97, 218, 251, 0.2)',
            }
          },
        },
      },
    },
  },
});

export default darkTheme;
