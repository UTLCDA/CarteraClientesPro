import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Button,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  List,
  Divider,
} from '@mui/material';
import {
  People as PeopleIcon,
  AccountBalanceWallet as WalletIcon,
  PendingActions as PendingIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  Payments as PaymentsIcon,
} from '@mui/icons-material';
import { useDashboardResumen } from '../hooks/useQueries';
import { formatCurrency, formatDate } from '../utils/format';

const Dashboard: React.FC = () => {
  const { data, isLoading, error } = useDashboardResumen();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress size={50} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Error al cargar los datos del dashboard. Por favor, intente de nuevo.
      </Alert>
    );
  }

  if (!data) return null;

  const kpis = [
    {
      title: 'Clientes Activos',
      value: data.totalClientesActivos,
      icon: <PeopleIcon sx={{ color: '#6366f1' }} />,
      bgColor: 'rgba(99, 102, 241, 0.08)',
      color: '#6366f1',
    },
    {
      title: 'Total Vendido',
      value: formatCurrency(data.totalVendido),
      icon: <TrendingUpIcon sx={{ color: '#0ea5e9' }} />,
      bgColor: 'rgba(14, 165, 233, 0.08)',
      color: '#0ea5e9',
    },
    {
      title: 'Total Cobrado',
      value: formatCurrency(data.totalPagado),
      icon: <PaymentsIcon sx={{ color: '#10b981' }} />,
      bgColor: 'rgba(16, 185, 129, 0.08)',
      color: '#10b981',
    },
    {
      title: 'Saldo Pendiente',
      value: formatCurrency(data.saldoTotalPendiente),
      icon: <WalletIcon sx={{ color: '#f59e0b' }} />,
      bgColor: 'rgba(245, 158, 11, 0.08)',
      color: '#f59e0b',
    },
    {
      title: 'Ventas Pendientes',
      value: data.cantidadVentasPendientes,
      icon: <PendingIcon sx={{ color: '#8b5cf6' }} />,
      bgColor: 'rgba(139, 92, 246, 0.08)',
      color: '#8b5cf6',
    },
    {
      title: 'Ventas Vencidas',
      value: data.cantidadVentasVencidas,
      icon: <WarningIcon sx={{ color: '#ef4444' }} />,
      bgColor: 'rgba(239, 68, 68, 0.08)',
      color: '#ef4444',
    },
  ];

  const getStatusChip = (estatus: string) => {
    switch (estatus.toUpperCase()) {
      case 'PAGADO':
        return <Chip label="Pagado" size="small" sx={{ bgcolor: 'rgba(16, 185, 129, 0.12)', color: '#10b981', fontWeight: 700 }} />;
      case 'CANCELADO':
        return <Chip label="Cancelado" size="small" sx={{ bgcolor: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', fontWeight: 700 }} />;
      default:
        return <Chip label="Pendiente" size="small" sx={{ bgcolor: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', fontWeight: 700 }} />;
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* KPIs Grid using CSS Grid Box */}
      <Box 
        sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, 
          gap: 3, 
          mb: 4 
        }}
      >
        {kpis.map((kpi) => (
          <Card 
            key={kpi.title}
            sx={{ 
              borderRadius: '16px', 
              border: '1px solid', 
              borderColor: 'divider',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.01)',
              '&:hover': {
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3 }}>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {kpi.title}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>
                  {kpi.value}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: kpi.bgColor, width: 52, height: 52 }}>
                {kpi.icon}
              </Avatar>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Middle Grid: Last Sales & Top Debt Clients */}
      <Box 
        sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', lg: '8fr 4fr' }, 
          gap: 3, 
          mb: 4 
        }}
      >
        {/* Last Sales */}
        <Paper 
          sx={{ 
            p: 3, 
            borderRadius: '16px', 
            border: '1px solid', 
            borderColor: 'divider',
            boxShadow: 'none'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Últimas Ventas a Crédito
            </Typography>
            <Button size="small" variant="text" onClick={() => navigate('/ventas')}>
              Ver todas
            </Button>
          </Box>
          {data.ultimasVentas.length === 0 ? (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">No hay ventas registradas.</Typography>
            </Box>
          ) : (
            <TableContainer sx={{ maxHeight: 350 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Cliente</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Producto</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Fecha</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">Monto</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="center">Estatus</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.ultimasVentas.map((venta) => (
                    <TableRow 
                      key={venta.ventaId}
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/ventas/${venta.ventaId}`)}
                    >
                      <TableCell sx={{ fontWeight: 500 }}>{venta.nombreCliente}</TableCell>
                      <TableCell>{venta.descripcionProducto}</TableCell>
                      <TableCell>{formatDate(venta.fechaInicioDeuda)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>{formatCurrency(venta.montoTotal)}</TableCell>
                      <TableCell align="center">{getStatusChip(venta.estatus)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>

        {/* Top Debt Clients */}
        <Paper 
          sx={{ 
            p: 3, 
            borderRadius: '16px', 
            border: '1px solid', 
            borderColor: 'divider',
            boxShadow: 'none',
            height: '100%'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Mayor Saldo Pendiente
            </Typography>
            <Button size="small" variant="text" onClick={() => navigate('/clientes')}>
              Ver todos
            </Button>
          </Box>
          {data.clientesMayorSaldo.length === 0 ? (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">No hay clientes con saldos pendientes.</Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {data.clientesMayorSaldo.map((cliente, index) => (
                <Box key={cliente.clienteId}>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      py: 1.5,
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: 'action.hover',
                        borderRadius: '8px',
                        px: 1,
                        mx: -1
                      },
                      transition: 'all 0.2s',
                    }}
                    onClick={() => navigate(`/clientes/${cliente.clienteId}`)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ bgcolor: 'rgba(99, 102, 241, 0.08)', color: 'primary.main', fontWeight: 700, fontSize: '0.85rem', width: 36, height: 36 }}>
                        {cliente.nombre.substring(0, 1)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {`${cliente.nombre} ${cliente.apellidoPaterno || ''}`.trim()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {cliente.telefono || 'Sin teléfono'}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'error.main' }}>
                      {formatCurrency(cliente.saldoTotalPendiente)}
                    </Typography>
                  </Box>
                  {index < data.clientesMayorSaldo.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          )}
        </Paper>
      </Box>

      {/* Bottom Grid: Recent Payments */}
      <Paper 
        sx={{ 
          p: 3, 
          borderRadius: '16px', 
          border: '1px solid', 
          borderColor: 'divider',
          boxShadow: 'none'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Abonos y Pagos Recientes
          </Typography>
          <Button size="small" variant="text" onClick={() => navigate('/pagos')}>
            Ver historial completo
          </Button>
        </Box>
        {data.pagosRecientes.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">No hay abonos registrados.</Typography>
          </Box>
        ) : (
          <TableContainer sx={{ maxHeight: 350 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Cliente</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Producto (Venta)</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Fecha Pago</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Forma Pago</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Referencia</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">Monto Abonado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.pagosRecientes.map((pago) => (
                  <TableRow key={pago.pagoId} hover>
                    <TableCell sx={{ fontWeight: 500 }}>{pago.nombreCliente}</TableCell>
                    <TableCell>{pago.descripcionProducto}</TableCell>
                    <TableCell>{formatDate(pago.fechaPago)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={pago.formaPago || 'No esp.'} 
                        size="small" 
                        sx={{ 
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          bgcolor: 'rgba(99, 102, 241, 0.08)',
                          color: 'primary.main'
                        }} 
                      />
                    </TableCell>
                    <TableCell>{pago.referencia || '-'}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: 'success.main' }}>
                      + {formatCurrency(pago.montoPago)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
};

export default Dashboard;
