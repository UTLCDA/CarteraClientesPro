import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
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
  Divider,
  CircularProgress,
  Alert,
  Chip,
  Avatar,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Payments as PaymentsIcon,
  Visibility as ViewIcon,
  ReceiptLong as SaleIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useClienteResumen, useVentasByCliente } from '../hooks/useQueries';
import { formatCurrency, formatDate } from '../utils/format';

const ClienteDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const clienteId = parseInt(id || '0');

  const { data: resumen, isLoading: isLoadingResumen, error: resumenError } = useClienteResumen(clienteId);
  const { data: ventas, isLoading: isLoadingVentas, error: ventasError } = useVentasByCliente(clienteId);

  if (isLoadingResumen || isLoadingVentas) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress size={50} />
      </Box>
    );
  }

  if (resumenError || ventasError || !resumen) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Error al cargar los detalles del cliente.
      </Alert>
    );
  }

  const { cliente } = resumen;

  const kpis = [
    {
      title: 'Total Vendido',
      value: formatCurrency(resumen.totalVendido),
      color: '#0ea5e9',
      bgColor: 'rgba(14, 165, 233, 0.08)',
    },
    {
      title: 'Total Pagado',
      value: formatCurrency(resumen.totalPagado),
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.08)',
    },
    {
      title: 'Saldo Pendiente',
      value: formatCurrency(resumen.saldoTotalPendiente),
      color: resumen.saldoTotalPendiente > 0 ? '#ef4444' : '#10b981',
      bgColor: resumen.saldoTotalPendiente > 0 ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
    },
    {
      title: 'Ventas Pendientes',
      value: resumen.cantidadVentasPendientes,
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.08)',
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
    <Box>
      {/* Top Header Navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/clientes')}
            sx={{ mr: 2, textTransform: 'none', fontWeight: 700 }}
          >
            Clientes
          </Button>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Detalle del Cliente
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/clientes/editar/${cliente.clienteId}`)}
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700 }}
          >
            Editar Datos
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate(`/ventas/nueva?clienteId=${cliente.clienteId}`)}
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700 }}
          >
            Nueva Venta
          </Button>
        </Box>
      </Box>

      {/* Main Content Grid using CSS Grid Box */}
      <Box 
        sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', md: '4fr 8fr' }, 
          gap: 3, 
          mb: 4 
        }}
      >
        {/* Client general info card */}
        <Paper
          sx={{
            p: 4,
            borderRadius: '16px',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <Avatar
            sx={{
              width: 72,
              height: 72,
              bgcolor: 'rgba(99, 102, 241, 0.08)',
              color: 'primary.main',
              fontSize: '1.75rem',
              fontWeight: 800,
              mb: 2,
            }}
          >
            {cliente.nombre.substring(0, 1)}
          </Avatar>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
            {`${cliente.nombre} ${cliente.apellidoPaterno || ''} ${cliente.apellidoMaterno || ''}`.trim()}
          </Typography>
          <Chip
            label={cliente.activo ? 'Cliente Activo' : 'Cliente Inactivo'}
            size="small"
            sx={{
              mb: 3,
              fontWeight: 700,
              bgcolor: cliente.activo ? 'rgba(16, 185, 129, 0.12)' : 'rgba(148, 163, 184, 0.12)',
              color: cliente.activo ? '#10b981' : '#64748b',
            }}
          />

          <Divider sx={{ width: '100%', mb: 3 }} />

          <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2, textAlign: 'left' }}>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                Teléfono
              </Typography>
              <Typography variant="body2" color="text.primary">
                {cliente.telefono || 'No especificado'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                Correo Electrónico
              </Typography>
              <Typography variant="body2" color="text.primary" sx={{ wordBreak: 'break-all' }}>
                {cliente.correo || 'No especificado'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                Dirección
              </Typography>
              <Typography variant="body2" color="text.primary">
                {cliente.direccion || 'No especificada'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                Fecha de Registro
              </Typography>
              <Typography variant="body2" color="text.primary">
                {formatDate(cliente.fechaRegistro)}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* KPIs grid */}
        <Box 
          sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, 
            gap: 3 
          }}
        >
          {kpis.map((kpi) => (
            <Card
              key={kpi.title}
              sx={{
                borderRadius: '16px',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: 'none',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <CardContent sx={{ p: 3, width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
                    {kpi.title}
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: kpi.color }}>
                    {kpi.value}
                  </Typography>
                </Box>
                <Box sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: kpi.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <PaymentsIcon sx={{ color: kpi.color }} />
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>

      {/* Associated Sales Table */}
      <Paper sx={{ p: 4, borderRadius: '16px', border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
          Historial de Ventas a Crédito
        </Typography>

        {!ventas || ventas.length === 0 ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <SaleIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 600 }}>
              No se han registrado ventas
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Crea una venta a crédito para registrar una deuda inicial sobre este cliente.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate(`/ventas/nueva?clienteId=${cliente.clienteId}`)}
              sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700 }}
            >
              Registrar Primera Venta
            </Button>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Folio/ID</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Producto</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Fecha Compra</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Límite de Pago</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">Total</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">Abonado</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">Pendiente</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">Estatus</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ventas.map((venta) => (
                  <TableRow key={venta.ventaId} hover>
                    <TableCell sx={{ fontWeight: 700 }}>#{venta.ventaId}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{venta.descripcionProducto}</TableCell>
                    <TableCell>{formatDate(venta.fechaInicioDeuda)}</TableCell>
                    <TableCell>{venta.fechaLimitePago ? formatDate(venta.fechaLimitePago) : 'N/A'}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>{formatCurrency(venta.montoTotal)}</TableCell>
                    <TableCell align="right" sx={{ color: 'success.main', fontWeight: 600 }}>{formatCurrency(venta.totalPagado)}</TableCell>
                    <TableCell align="right" sx={{ color: venta.saldoPendiente > 0 ? 'error.main' : 'text.primary', fontWeight: 700 }}>
                      {formatCurrency(venta.saldoPendiente)}
                    </TableCell>
                    <TableCell align="center">{getStatusChip(venta.estatus)}</TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        <Tooltip title="Ver detalle de venta">
                          <IconButton color="primary" onClick={() => navigate(`/ventas/${venta.ventaId}`)}>
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        {venta.estatus === 'PENDIENTE' && venta.saldoPendiente > 0 && (
                          <Tooltip title="Registrar Pago">
                            <IconButton color="success" onClick={() => navigate(`/pagos/nuevo?ventaId=${venta.ventaId}`)}>
                              <PaymentsIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
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

export default ClienteDetailPage;
