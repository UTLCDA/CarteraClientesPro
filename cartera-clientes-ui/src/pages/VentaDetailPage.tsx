import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Paper,
  Divider,
  CircularProgress,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Tabs,
  Tab,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Payments as PaymentsIcon,
  Cancel as CancelIcon,
  Settings as AdjustIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import {
  useVenta,
  usePagosByVenta,
  useMovimientosByVenta,
  useCancelarVenta,
  useRegistrarAjuste,
} from '../hooks/useQueries';
import { formatCurrency, formatDate } from '../utils/format';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const CustomTabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const VentaDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const ventaId = parseInt(id || '0');

  // Query state
  const { data: venta, isLoading: isLoadingVenta, error: ventaError } = useVenta(ventaId);
  const { data: pagos, isLoading: isLoadingPagos } = usePagosByVenta(ventaId);
  const { data: movimientos, isLoading: isLoadingMovimientos } = useMovimientosByVenta(ventaId);

  // Mutations
  const cancelarVentaMutation = useCancelarVenta(ventaId);
  const registrarAjusteMutation = useRegistrarAjuste();

  // Component UI States
  const [tabValue, setTabValue] = useState(0);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [ajusteOpen, setAjusteOpen] = useState(false);

  // Adjustment Form States
  const [ajusteMonto, setAjusteMonto] = useState('');
  const [ajusteDesc, setAjusteDesc] = useState('');
  const [ajusteError, setAjusteError] = useState('');

  if (isLoadingVenta) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress size={50} />
      </Box>
    );
  }

  if (ventaError || !venta) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Error al cargar los detalles de la venta.
      </Alert>
    );
  }

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCancelSale = async () => {
    try {
      await cancelarVentaMutation.mutateAsync();
      setCancelOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRegistrarAjusteSubmit = async () => {
    setAjusteError('');

    const monto = parseFloat(ajusteMonto);
    if (isNaN(monto) || monto <= 0) {
      setAjusteError('El monto del ajuste debe ser mayor a cero.');
      return;
    }

    if (!ajusteDesc.trim()) {
      setAjusteError('La descripción del ajuste es obligatoria.');
      return;
    }

    try {
      await registrarAjusteMutation.mutateAsync({
        ventaId: venta.ventaId,
        monto,
        descripcion: ajusteDesc,
      });
      setAjusteOpen(false);
      setAjusteMonto('');
      setAjusteDesc('');
    } catch (err: any) {
      setAjusteError(err?.response?.data?.mensaje || 'Error al registrar el ajuste.');
    }
  };

  const getStatusChip = (estatus: string) => {
    switch (estatus.toUpperCase()) {
      case 'PAGADO':
        return <Chip label="PAGADO" color="success" sx={{ fontWeight: 800 }} />;
      case 'CANCELADO':
        return <Chip label="CANCELADO" color="error" sx={{ fontWeight: 800 }} />;
      default:
        return <Chip label="PENDIENTE" color="warning" sx={{ fontWeight: 800 }} />;
    }
  };

  const isVencida =
    venta.estatus === 'PENDIENTE' &&
    venta.fechaLimitePago &&
    new Date(venta.fechaLimitePago) < new Date();

  return (
    <Box>
      {/* Top Navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{ mr: 2, textTransform: 'none', fontWeight: 700 }}
          >
            Volver
          </Button>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Detalle de Venta #{venta.ventaId}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          {venta.estatus === 'PENDIENTE' && (
            <>
              <Button
                variant="outlined"
                color="error"
                startIcon={<CancelIcon />}
                onClick={() => setCancelOpen(true)}
                sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700 }}
              >
                Cancelar Venta
              </Button>
              <Button
                variant="outlined"
                startIcon={<AdjustIcon />}
                onClick={() => setAjusteOpen(true)}
                sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700 }}
              >
                Registrar Ajuste
              </Button>
              {venta.saldoPendiente > 0 && (
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<PaymentsIcon />}
                  onClick={() => navigate(`/pagos/nuevo?ventaId=${venta.ventaId}`)}
                  sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700 }}
                >
                  Registrar Pago
                </Button>
              )}
            </>
          )}
        </Box>
      </Box>

      {isVencida && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '12px', fontWeight: 600 }}>
          Esta venta a crédito se encuentra vencida. Ha sobrepasado la fecha límite de pago.
        </Alert>
      )}

      {/* Sale general metadata details using CSS Grid Box */}
      <Paper sx={{ p: 4, borderRadius: '16px', border: '1px solid', borderColor: 'divider', boxShadow: 'none', mb: 4 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3.5 }}>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
              Cliente
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ fontWeight: 700, color: 'primary.main', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
              onClick={() => navigate(`/clientes/${venta.clienteId}`)}
            >
              {venta.nombreCliente}
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
              Producto Vendido
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {venta.descripcionProducto}
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
              Cantidad × Precio
            </Typography>
            <Typography variant="body1">
              {venta.cantidad} pzas. × {formatCurrency(venta.precioUnitario)}
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
              Estatus
            </Typography>
            <Box sx={{ mt: 0.5 }}>{getStatusChip(venta.estatus)}</Box>
          </Box>

          <Box sx={{ gridColumn: 'span 12' }}>
            <Divider />
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
              Monto Total
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {formatCurrency(venta.montoTotal)}
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
              Total Cobrado
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'success.main' }}>
              {formatCurrency(venta.totalPagado)}
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
              Saldo Pendiente
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: venta.saldoPendiente > 0 ? 'error.main' : 'success.main' }}>
              {formatCurrency(venta.saldoPendiente)}
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
              Fecha Inicio / Límite
            </Typography>
            <Typography variant="body1">
              {formatDate(venta.fechaInicioDeuda)} {venta.fechaLimitePago ? `al ${formatDate(venta.fechaLimitePago)}` : ' (Sin límite)'}
            </Typography>
          </Box>

          {venta.observaciones && (
            <>
              <Box sx={{ gridColumn: 'span 12' }}>
                <Divider />
              </Box>
              <Box sx={{ gridColumn: 'span 12' }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                  Observaciones
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {venta.observaciones}
                </Typography>
              </Box>
            </>
          )}
        </Box>
      </Paper>

      {/* Tabs section for payments and movements */}
      <Paper sx={{ borderRadius: '16px', border: '1px solid', borderColor: 'divider', boxShadow: 'none', p: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="Historial de transacciones">
            <Tab label="Historial de Abonos / Pagos" icon={<PaymentsIcon />} iconPosition="start" sx={{ textTransform: 'none', fontWeight: 700 }} />
            <Tab label="Movimientos de Auditoría" icon={<HistoryIcon />} iconPosition="start" sx={{ textTransform: 'none', fontWeight: 700 }} />
          </Tabs>
        </Box>

        {/* Tab panel 0: Payments */}
        <CustomTabPanel value={tabValue} index={0}>
          {isLoadingPagos ? (
            <CircularProgress size={30} />
          ) : !pagos || pagos.length === 0 ? (
            <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
              No se han registrado pagos para esta venta.
            </Typography>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Folio Abono</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Fecha Pago</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Forma Pago</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Referencia</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Observaciones</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">Monto</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pagos.map((p) => (
                    <TableRow key={p.pagoId}>
                      <TableCell sx={{ fontWeight: 700 }}>#{p.pagoId}</TableCell>
                      <TableCell>{formatDate(p.fechaPago)}</TableCell>
                      <TableCell>
                        <Chip label={p.formaPago || 'EFECTIVO'} size="small" sx={{ fontWeight: 600, bgcolor: 'rgba(99, 102, 241, 0.08)', color: 'primary.main' }} />
                      </TableCell>
                      <TableCell>{p.referencia || '-'}</TableCell>
                      <TableCell>{p.observaciones || '-'}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: 'success.main' }}>
                        {formatCurrency(p.montoPago)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CustomTabPanel>

        {/* Tab panel 1: Audit Movements */}
        <CustomTabPanel value={tabValue} index={1}>
          {isLoadingMovimientos ? (
            <CircularProgress size={30} />
          ) : !movimientos || movimientos.length === 0 ? (
            <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
              No hay movimientos de auditoría registrados.
            </Typography>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>ID Movimiento</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Tipo</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Fecha Registro</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Descripción / Bitácora</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">Monto</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {movimientos.map((m) => {
                    let chipBg = 'rgba(148, 163, 184, 0.12)';
                    let chipColor = '#64748b';
                    if (m.tipoMovimiento === 'CARGO') {
                      chipBg = 'rgba(239, 68, 68, 0.12)';
                      chipColor = '#ef4444';
                    } else if (m.tipoMovimiento === 'ABONO') {
                      chipBg = 'rgba(16, 185, 129, 0.12)';
                      chipColor = '#10b981';
                    }

                    return (
                      <TableRow key={m.movimientoId}>
                        <TableCell sx={{ fontWeight: 700 }}>#{m.movimientoId}</TableCell>
                        <TableCell>
                          <Chip label={m.tipoMovimiento} size="small" sx={{ fontWeight: 700, bgcolor: chipBg, color: chipColor }} />
                        </TableCell>
                        <TableCell>{formatDate(m.fechaMovimiento)}</TableCell>
                        <TableCell>{m.descripcion || '-'}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>
                          {formatCurrency(m.monto)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CustomTabPanel>
      </Paper>

      {/* Confirmation Dialog to cancel sale */}
      <Dialog open={cancelOpen} onClose={() => setCancelOpen(false)}>
        <DialogTitle sx={{ fontWeight: 700 }}>¿Cancelar Venta a Crédito?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro que desea cancelar esta venta a crédito? Esta acción actualizará el estatus a <strong>CANCELADO</strong>. No se podrán registrar abonos o movimientos posteriores.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setCancelOpen(false)} variant="outlined" sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700 }}>
            No, mantener
          </Button>
          <Button onClick={handleCancelSale} color="error" variant="contained" disabled={cancelarVentaMutation.isPending} sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700 }}>
            Sí, cancelar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Dialog to register manual AJUSTE */}
      <Dialog open={ajusteOpen} onClose={() => setAjusteOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Registrar Movimiento de Ajuste</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Registra un ajuste manual en la bitácora de movimientos para esta venta. La descripción es obligatoria.
          </DialogContentText>

          {ajusteError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {ajusteError}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Monto del Ajuste *"
              type="number"
              value={ajusteMonto}
              onChange={(e) => setAjusteMonto(e.target.value)}
              fullWidth
              size="small"
            />
            <TextField
              label="Descripción del Ajuste *"
              value={ajusteDesc}
              onChange={(e) => setAjusteDesc(e.target.value)}
              fullWidth
              multiline
              rows={2}
              size="small"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setAjusteOpen(false)} variant="outlined" sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700 }}>
            Cancelar
          </Button>
          <Button
            onClick={handleRegistrarAjusteSubmit}
            variant="contained"
            disabled={registrarAjusteMutation.isPending}
            sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700 }}
          >
            Registrar Ajuste
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VentaDetailPage;
