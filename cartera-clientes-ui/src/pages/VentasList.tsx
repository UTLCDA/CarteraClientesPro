import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  TextField,
  MenuItem,
  IconButton,
  Tooltip,
  Chip,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Payments as PaymentsIcon,
  FilterAltOff as ClearFiltersIcon,
  ReceiptLong as SaleIcon,
} from '@mui/icons-material';
import { useVentas, useClientes } from '../hooks/useQueries';
import { formatCurrency, formatDate } from '../utils/format';

const VentasList: React.FC = () => {
  const navigate = useNavigate();

  // Filter States
  const [clienteId, setClienteId] = useState<string>('');
  const [estatus, setEstatus] = useState<string>('');
  const [fechaInicio, setFechaInicio] = useState<string>('');
  const [fechaFin, setFechaFin] = useState<string>('');
  const [productoText, setProductoText] = useState<string>('');

  // Fetch Clients for the filter dropdown
  const { data: clientes } = useClientes();

  // Fetch Ventas with current filters
  const {
    data: ventas,
    isLoading,
    error
  } = useVentas({
    clienteId: clienteId || undefined,
    estatus: estatus || undefined,
    fechaInicio: fechaInicio || undefined,
    fechaFin: fechaFin || undefined,
    productoText: productoText || undefined,
  });

  const handleClearFilters = () => {
    setClienteId('');
    setEstatus('');
    setFechaInicio('');
    setFechaFin('');
    setProductoText('');
  };

  const getStatusChip = (status: string) => {
    switch (status.toUpperCase()) {
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
      {/* Top Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          Ventas a Crédito
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/ventas/nueva')}
          sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700 }}
        >
          Registrar Venta
        </Button>
      </Box>

      {/* Filters Box using CSS Grid Box */}
      <Paper sx={{ p: 3, borderRadius: '16px', border: '1px solid', borderColor: 'divider', boxShadow: 'none', mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Filtros de Búsqueda
        </Typography>
        <Box 
          sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '3fr 3fr 2fr 1.5fr 1.5fr 1fr' }, 
            gap: 2, 
            alignItems: 'center' 
          }}
        >
          <Box>
            <TextField
              label="Buscar por Producto / Cliente"
              variant="outlined"
              size="small"
              fullWidth
              value={productoText}
              onChange={(e) => setProductoText(e.target.value)}
            />
          </Box>

          <Box>
            <TextField
              select
              label="Filtrar por Cliente"
              variant="outlined"
              size="small"
              fullWidth
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
            >
              <MenuItem value="">Todos los clientes</MenuItem>
              {clientes?.map((c) => (
                <MenuItem key={c.clienteId} value={c.clienteId}>
                  {`${c.nombre} ${c.apellidoPaterno || ''}`.trim()}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Box>
            <TextField
              select
              label="Estatus"
              variant="outlined"
              size="small"
              fullWidth
              value={estatus}
              onChange={(e) => setEstatus(e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="PENDIENTE">Pendientes</MenuItem>
              <MenuItem value="PAGADO">Pagados</MenuItem>
              <MenuItem value="CANCELADO">Cancelados</MenuItem>
            </TextField>
          </Box>

          <Box>
            <TextField
              label="Fecha Inicio"
              type="date"
              variant="outlined"
              size="small"
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
            />
          </Box>

          <Box>
            <TextField
              label="Fecha Fin"
              type="date"
              variant="outlined"
              size="small"
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
            />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
            <Tooltip title="Limpiar Filtros">
              <IconButton onClick={handleClearFilters} color="primary" sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '8px' }}>
                <ClearFiltersIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Paper>

      {/* Ventas Table */}
      <Paper sx={{ p: 3, borderRadius: '16px', border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">Error al cargar las ventas a crédito.</Alert>
        ) : !ventas || ventas.length === 0 ? (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <SaleIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No se encontraron ventas
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ajusta los filtros o registra una nueva venta a crédito.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Folio</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Cliente</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Producto</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Fecha Deuda</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">Monto Total</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">Total Pagado</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">Saldo Pendiente</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">Estatus</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ventas.map((venta) => (
                  <TableRow key={venta.ventaId} hover>
                    <TableCell sx={{ fontWeight: 700 }}>#{venta.ventaId}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{venta.nombreCliente}</TableCell>
                    <TableCell>{venta.descripcionProducto}</TableCell>
                    <TableCell>{formatDate(venta.fechaInicioDeuda)}</TableCell>
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

export default VentasList;
