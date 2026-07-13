import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CssBaseline,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  ReceiptLong as ReceiptIcon,
  Payments as PaymentsIcon,
} from '@mui/icons-material';

const drawerWidth = 240;

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Clientes', icon: <PeopleIcon />, path: '/clientes' },
    { text: 'Ventas', icon: <ReceiptIcon />, path: '/ventas' },
    { text: 'Pagos', icon: <PaymentsIcon />, path: '/pagos' },
  ];

  // Helper to determine active route
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path.startsWith('/clientes')) return 'Clientes';
    if (path.startsWith('/ventas')) return 'Ventas';
    if (path.startsWith('/pagos')) return 'Pagos';
    return 'Dashboard';
  };

  const currentTab = getActiveTab();

  const drawer = (
    <div>
      <Toolbar sx={{ justifyContent: 'center', py: 2 }}>
        <Typography 
          variant="h6" 
          noWrap 
          component="div" 
          sx={{ 
            fontWeight: 800, 
            color: 'primary.main', 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            letterSpacing: '0.5px'
          }}
        >
          <PaymentsIcon sx={{ fontSize: '28px' }} /> CARTERAPRO
        </Typography>
      </Toolbar>
      <Divider />
      <List sx={{ px: 1.5, pt: 2 }}>
        {menuItems.map((item) => {
          const isActive = currentTab === item.text;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.8 }}>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  setMobileOpen(false);
                }}
                sx={{
                  borderRadius: '10px',
                  bgcolor: isActive ? 'primary.main' : 'transparent',
                  color: isActive ? 'primary.contrastText' : 'text.secondary',
                  '&:hover': {
                    bgcolor: isActive ? 'primary.main' : 'action.hover',
                    transform: 'translateX(4px)',
                  },
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  px: 2,
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    color: isActive ? 'primary.contrastText' : 'text.secondary', 
                    minWidth: 38 
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={
                    <Typography sx={{ fontWeight: isActive ? 700 : 500, fontSize: '0.95rem' }}>
                      {item.text}
                    </Typography>
                  } 
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700, fontSize: '1.25rem' }}>
            {currentTab === 'Dashboard' ? 'Resumen General' : currentTab}
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth, 
              borderRight: '1px solid', 
              borderColor: 'divider' 
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          p: { xs: 2, sm: 3 }, 
          width: { sm: `calc(100% - ${drawerWidth}px)` }, 
          mt: '64px',
          overflowX: 'hidden'
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default MainLayout;
