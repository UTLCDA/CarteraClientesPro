import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Tooltip,
  Snackbar,
} from '@mui/material';
import {
  Email as EmailIcon,
  WhatsApp as WhatsAppIcon,
  Cached as CachedIcon,
  Done as DoneIcon,
  ErrorOutlined as ErrorIcon,
  Refresh as RefreshIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import {
  useRecordatorios,
  useGenerarRecordatorios,
  useEnviarRecordatorioCorreo,
  useMarcarRecordatorioEnviado,
} from '../hooks/useQueries';
import { formatDate } from '../utils/format';

const RecordatoriosList: React.FC = () => {
  const [estatusFilter, setEstatusFilter] = useState<string>('PENDIENTE');
  const [canalFilter, setCanalFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  // Queries & Mutations
  const { data: recordatorios, isLoading, error, refetch } = useRecordatorios({
    estatus: estatusFilter,
    canal: canalFilter,
  });

  const generarMutation = useGenerarRecordatorios();
  const enviarCorreoMutation = useEnviarRecordatorioCorreo();
  const marcarEnviadoMutation = useMarcarRecordatorioEnviado();

  const handleGenerar = async () => {
    try {
      const result = await generarMutation.mutateAsync();
      setSnackbarSeverity('success');
      setSnackbarMessage(
        `Generación completada: ${result.totalGenerados} recordatorios nuevos creados. (${result.totalSaltados} omitidos por haberse cobrado o recordado recientemente).`
      );
      refetch();
    } catch (e) {
      setSnackbarSeverity('error');
      setSnackbarMessage('Error al generar los recordatorios de la semana.');
    }
  };

  const handleEnviarCorreo = async (id: number) => {
    try {
      await enviarCorreoMutation.mutateAsync(id);
      setSnackbarSeverity('success');
      setSnackbarMessage('Recordatorio enviado por correo electrónico exitosamente.');
      refetch();
    } catch (e: any) {
      setSnackbarSeverity('error');
      setSnackbarMessage(e.response?.data?.mensaje || 'Error al enviar el correo electrónico.');
    }
  };

  const handleEnviarWhatsApp = (id: number, telefono: string, mensaje: string) => {
    if (!telefono) {
      setSnackbarSeverity('error');
      setSnackbarMessage('El cliente no cuenta con número telefónico registrado.');
      return;
    }

    // Clean phone number (leave digits only)
    const cleanPhone = telefono.replace(/\D/g, '');
    
    // Draft the WhatsApp URL
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(mensaje)}`;
    
    // Open in new tab
    window.open(url, '_blank');

    // Automatically mark as sent in database
    marcarEnviadoMutation.mutate(id, {
      onSuccess: () => {
        refetch();
      },
    });
  };

  const getStatusChip = (estatus: string) => {
    switch (estatus.toUpperCase()) {
      case 'ENVIADO':
        return (
          <Chip
            icon={<DoneIcon style={{ color: '#10b981' }} />}
            label="Enviado"
            size="small"
            sx={{ bgcolor: 'rgba(16, 185, 129, 0.12)', color: '#10b981', fontWeight: 700 }}
          />
        );
      case 'FALLIDO':
        return (
          <Chip
            icon={<ErrorIcon style={{ color: '#ef4444' }} />}
            label="Fallido"
            size="small"
            sx={{ bgcolor: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', fontWeight: 700 }}
          />
        );
      default:
        return (
          <Chip
            icon={<ScheduleIcon style={{ color: '#f59e0b' }} />}
            label="Pendiente"
            size="small"
            sx={{ bgcolor: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', fontWeight: 700 }}
          />
        );
    }
  };

  const getCanalChip = (canal: string) => {
    switch (canal.toUpperCase()) {
      case 'CORREO':
        return <Chip label="Solo Correo" size="small" variant="outlined" sx={{ fontWeight: 600 }} />;
      case 'AMBOS':
        return <Chip label="WhatsApp + Correo" size="small" color="primary" variant="outlined" sx={{ fontWeight: 600 }} />;
      default:
        return <Chip label="WhatsApp" size="small" color="success" variant="outlined" sx={{ fontWeight: 600 }} />;
    }
  };

  // Filter local results based on client name or product search
  const filteredRecordatorios = recordatorios?.filter(r =>
    r.nombreCliente.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.descripcionProducto.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box>
      {/* Header section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
            Cobranza y Recordatorios de Pago
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            Genera y envía de forma amigable recordatorios a tus deudores cada domingo.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <IconButton 
            onClick={() => refetch()} 
            disabled={isLoading}
            sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px' }}
          >
            <RefreshIcon />
          </IconButton>
          <Button
            variant="contained"
            startIcon={generarMutation.isPending ? <CircularProgress size={20} color="inherit" /> : <CachedIcon />}
            onClick={handleGenerar}
            disabled={generarMutation.isPending || isLoading}
            sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700, px: 3 }}
          >
            Generar Recordatorios de la Semana
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Error al cargar los recordatorios de pago. Por favor intente de nuevo.
        </Alert>
      )}

      {/* Filter Toolbar */}
      <Paper sx={{ p: 2.5, mb: 4, borderRadius: '16px', border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
          <TextField
            select
            label="Filtrar por Estatus"
            size="small"
            value={estatusFilter}
            onChange={(e) => setEstatusFilter(e.target.value)}
            fullWidth
          >
            <MenuItem value="">Todos los estatus</MenuItem>
            <MenuItem value="PENDIENTE">Pendientes</MenuItem>
            <MenuItem value="ENVIADO">Enviados</MenuItem>
            <MenuItem value="FALLIDO">Fallidos</MenuItem>
          </TextField>

          <TextField
            select
            label="Filtrar por Canal"
            size="small"
            value={canalFilter}
            onChange={(e) => setCanalFilter(e.target.value)}
            fullWidth
          >
            <MenuItem value="">Todos los canales</MenuItem>
            <MenuItem value="WHATSAPP">WhatsApp</MenuItem>
            <MenuItem value="CORREO">Solo Correo</MenuItem>
            <MenuItem value="AMBOS">WhatsApp + Correo</MenuItem>
          </TextField>

          <TextField
            label="Buscar cliente o producto..."
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
          />
        </Box>
      </Paper>

      {/* Main Content */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : !filteredRecordatorios || filteredRecordatorios.length === 0 ? (
        <Paper sx={{ py: 8, px: 4, textAlign: 'center', borderRadius: '16px', border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
          <DoneIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          <Typography variant="h6" color="text.primary" sx={{ fontWeight: 700 }} gutterBottom>
            No hay recordatorios pendientes
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 450, mx: 'auto' }}>
            Todos los cobros de esta semana están al corriente o no se han generado los recordatorios de deudores aún. Haz clic en el botón de arriba para buscar saldos vencidos.
          </Typography>
        </Paper>
      ) : (
        <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '16px', maxHeight: '60vh' }}>
          <Table stickyHeader sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Cliente</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Producto (Venta)</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Canal</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Fecha Generación</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Mensaje de Recordatorio</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">Estatus</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRecordatorios.map((r) => (
                <TableRow key={r.recordatorioId} hover>
                  <TableCell>
                    <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>{r.nombreCliente}</Typography>
                    {r.telefonoCliente && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        Tel: {r.telefonoCliente}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: '0.875rem' }}>{r.descripcionProducto}</Typography>
                    <Typography variant="caption" color="primary.main" sx={{ display: 'block', fontWeight: 600 }}>
                      Venta #{r.ventaId}
                    </Typography>
                  </TableCell>
                  <TableCell>{getCanalChip(r.canal)}</TableCell>
                  <TableCell sx={{ fontSize: '0.875rem' }}>{formatDate(r.fechaCreacion)}</TableCell>
                  <TableCell sx={{ maxWidth: 280 }}>
                    <Tooltip title={r.mensaje} placement="top" arrow>
                      <Typography 
                        sx={{ 
                          fontSize: '0.75rem', 
                          color: 'text.secondary', 
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          lineHeight: 1.4
                        }}
                      >
                        {r.mensaje}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="center">{getStatusChip(r.estatus)}</TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                      {/* WhatsApp trigger */}
                      {r.telefonoCliente ? (
                        <Tooltip title="Enviar por WhatsApp (Abre chat pre-redactado)">
                          <IconButton
                            color="success"
                            onClick={() => handleEnviarWhatsApp(r.recordatorioId, r.telefonoCliente, r.mensaje)}
                            disabled={marcarEnviadoMutation.isPending}
                            sx={{ bgcolor: 'rgba(76, 175, 80, 0.08)', '&:hover': { bgcolor: 'rgba(76, 175, 80, 0.15)' } }}
                          >
                            <WhatsAppIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      ) : null}

                      {/* Email trigger */}
                      {r.correoCliente ? (
                        <Tooltip title="Enviar correo automático por Gmail">
                          <Box sx={{ position: 'relative' }}>
                            <IconButton
                              color="primary"
                              onClick={() => handleEnviarCorreo(r.recordatorioId)}
                              disabled={enviarCorreoMutation.isPending && enviarCorreoMutation.variables === r.recordatorioId}
                              sx={{ bgcolor: 'rgba(33, 150, 243, 0.08)', '&:hover': { bgcolor: 'rgba(33, 150, 243, 0.15)' } }}
                            >
                              <EmailIcon fontSize="small" />
                            </IconButton>
                            {enviarCorreoMutation.isPending && enviarCorreoMutation.variables === r.recordatorioId && (
                              <CircularProgress
                                size={34}
                                sx={{
                                  color: 'primary.main',
                                  position: 'absolute',
                                  top: 1,
                                  left: 1,
                                  zIndex: 1,
                                }}
                              />
                            )}
                          </Box>
                        </Tooltip>
                      ) : null}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Snackbar notification alert */}
      <Snackbar
        open={!!snackbarMessage}
        autoHideDuration={6000}
        onClose={() => setSnackbarMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbarMessage(null)} severity={snackbarSeverity} sx={{ width: '100%', borderRadius: '12px' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RecordatoriosList;
