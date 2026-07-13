import React from 'react';
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
  Chip,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Add as AddIcon, Payments as PaymentsIcon } from '@mui/icons-material';
import { usePagos } from '../hooks/useQueries';
import { formatCurrency, formatDate } from '../utils/format';

const PagosList: React.FC = () => {
  const { data: pagos, isLoading, error } = usePagos();
  const navigate = useNavigate();

  return (
    <Box>
      {/* Top Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          Historial General de Abonos
        </Typography>
        <Button
          variant="contained"
          color="success"
          startIcon={<AddIcon />}
          onClick={() => navigate('/pagos/nuevo')}
          sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700 }}
        >
          Registrar Abono
        </Button>
      </Box>

      {/* Pagos Table Card */}
      <Paper sx={{ p: 3, borderRadius: '16px', border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">Error al cargar el historial de abonos.</Alert>
        ) : !pagos || pagos.length === 0 ? (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <PaymentsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No se han registrado abonos
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Registra un nuevo abono para liquidar los saldos pendientes de las ventas.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Folio Pago</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Cliente</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Producto (Venta)</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Fecha Pago</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Forma Pago</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Referencia</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">Monto</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pagos.map((pago) => (
                  <TableRow key={pago.pagoId} hover>
                    <TableCell sx={{ fontWeight: 700 }}>#{pago.pagoId}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{pago.nombreCliente}</TableCell>
                    <TableCell>{pago.descripcionProducto}</TableCell>
                    <TableCell>{formatDate(pago.fechaPago)}</TableCell>
                    <TableCell>
                      <Chip
                        label={pago.formaPago || 'EFECTIVO'}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          bgcolor: 'rgba(16, 185, 129, 0.08)',
                          color: 'success.main',
                        }}
                      />
                    </TableCell>
                    <TableCell>{pago.referencia || '-'}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: 'success.main' }}>
                      {formatCurrency(pago.montoPago)}
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

export default PagosList;
