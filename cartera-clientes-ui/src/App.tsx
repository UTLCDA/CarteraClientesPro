import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import AppRoutes from './routes/AppRoutes';
import MainLayout from './layouts/MainLayout';

// Initialize React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

// Configure premium MUI theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#4f46e5', // indigo
      light: '#e0e7ff',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#0ea5e9', // sky blue
    },
    success: {
      main: '#10b981', // emerald green
    },
    warning: {
      main: '#f59e0b', // amber
    },
    error: {
      main: '#ef4444', // rose red
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a',
      secondary: '#64748b',
    },
  },
  typography: {
    fontFamily: [
      'Outfit',
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      'sans-serif',
    ].join(','),
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          textTransform: 'none',
          fontWeight: 700,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: '#f1f5f9',
          padding: '12px 16px',
        },
        head: {
          backgroundColor: '#f8fafc',
          color: '#64748b',
          fontWeight: 700,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: 'small',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '10px',
          },
        },
      },
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <Router>
          <MainLayout>
            <AppRoutes />
          </MainLayout>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
