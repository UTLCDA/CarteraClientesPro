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
  Tabs,
  Tab,
  Switch,
  Autocomplete,
} from '@mui/material';
import {
  Email as EmailIcon,
  WhatsApp as WhatsAppIcon,
  Cached as CachedIcon,
  Done as DoneIcon,
  ErrorOutlined as ErrorIcon,
  Refresh as RefreshIcon,
  Schedule as ScheduleIcon,
  Delete as DeleteIcon,
  AddAlert as AddAlertIcon,
  ListAlt as ListIcon,
} from '@mui/icons-material';
import {
  useRecordatorios,
  useGenerarRecordatorios,
  useEnviarRecordatorioCorreo,
  useMarcarRecordatorioEnviado,
  useClientes,
  useVentas,
  useProgramacionesRecordatorios,
  useCreateProgramacionRecordatorio,
  useDeleteProgramacionRecordatorio,
  useToggleProgramacionRecordatorioActivo,
} from '../hooks/useQueries';
import { formatDate } from '../utils/format';
import type { Cliente, Venta } from '../types';

const RecordatoriosList: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  // Filter states for History Tab
  const [historyEstatusFilter, setHistoryEstatusFilter] = useState<string>('PENDIENTE');
  const [historyCanalFilter, setHistoryCanalFilter] = useState<string>('');
  const [historyCliente, setHistoryCliente] = useState<Cliente | null>(null);
  const [historySearchQuery, setHistorySearchQuery] = useState<string>('');

  // Scheduler Form states
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [selectedVenta, setSelectedVenta] = useState<Venta | null>(null);
  const [canal, setCanal] = useState<'WHATSAPP' | 'CORREO' | 'AMBOS'>('WHATSAPP');
  const [frecuencia, setFrecuencia] = useState<'UNICA' | 'DIARIA' | 'SEMANAL'>('SEMANAL');
  const [diaSemana, setDiaSemana] = useState<string>('DOMINGO');
  const [horaEjecucion, setHoraEjecucion] = useState<string>('09:00');
  const [fechaHoraEjecucion, setFechaHoraEjecucion] = useState<string>('');
  const [mensajePersonalizado, setMensajePersonalizado] = useState<string>('');

  // Data queries
  const { data: clientes } = useClientes();
  const { data: recordatorios, isLoading: isLoadingRecordatorios, refetch: refetchRecordatorios } = useRecordatorios({
    clienteId: historyCliente?.clienteId || '',
    estatus: historyEstatusFilter,
    canal: historyCanalFilter,
  });

  const { data: programaciones, isLoading: isLoadingProgramaciones, refetch: refetchProgramaciones } = useProgramacionesRecordatorios();

  // Load client-specific pending sales for scheduling
  const { data: ventasCliente, isLoading: isLoadingVentasCliente } = useVentas({
    clienteId: selectedCliente?.clienteId || '',
    estatus: 'PENDIENTE',
  });

  // Mutations
  const generarMutation = useGenerarRecordatorios();
  const enviarCorreoMutation = useEnviarRecordatorioCorreo();
  const marcarEnviadoMutation = useMarcarRecordatorioEnviado();
  const createProgMutation = useCreateProgramacionRecordatorio();
  const deleteProgMutation = useDeleteProgramacionRecordatorio();
  const toggleProgMutation = useToggleProgramacionRecordatorioActivo();

  // Helper alerts
  const showToast = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbarSeverity(severity);
    setSnackbarMessage(message);
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    if (newValue === 0) refetchRecordatorios();
    if (newValue === 1) refetchProgramaciones();
  };

  // Reminders History handlers
  const handleGenerarManual = async () => {
    try {
      const result = await generarMutation.mutateAsync();
      showToast(
        `Generación completada: ${result.totalGenerados} recordatorios nuevos creados. (${result.totalSaltados} omitidos por haberse recordado recientemente).`,
        'success'
      );
      refetchRecordatorios();
    } catch (e) {
      showToast('Error al generar recordatorios dominicales.', 'error');
    }
  };

  const handleEnviarCorreo = async (id: number) => {
    try {
      await enviarCorreoMutation.mutateAsync(id);
      showToast('Recordatorio enviado por correo electrónico exitosamente.', 'success');
      refetchRecordatorios();
    } catch (e: any) {
      showToast(e.response?.data?.mensaje || 'Error al enviar el correo electrónico.', 'error');
    }
  };

  const handleEnviarWhatsApp = (id: number, telefono: string, mensaje: string) => {
    if (!telefono) {
      showToast('El cliente no cuenta con número telefónico registrado.', 'error');
      return;
    }
    const cleanPhone = telefono.replace(/\D/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
    
    marcarEnviadoMutation.mutate(id, {
      onSuccess: () => refetchRecordatorios(),
    });
  };

  // Scheduling Form handler
  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCliente) {
      showToast('Debe seleccionar un cliente.', 'error');
      return;
    }
    if (!selectedVenta) {
      showToast('Debe seleccionar una deuda/venta pendiente.', 'error');
      return;
    }
    if (frecuencia === 'UNICA' && !fechaHoraEjecucion) {
      showToast('Debe especificar la fecha y hora de ejecución.', 'error');
      return;
    }

    try {
      await createProgMutation.mutateAsync({
        clienteId: selectedCliente.clienteId,
        ventaId: selectedVenta.ventaId,
        tipoCanal: canal,
        frecuencia,
        diaSemana: frecuencia === 'SEMANAL' ? diaSemana : undefined,
        horaEjecucion: frecuencia !== 'UNICA' ? horaEjecucion : fechaHoraEjecucion.split('T')[1]?.substring(0, 5) || '09:00',
        fechaHoraEjecucion: frecuencia === 'UNICA' ? fechaHoraEjecucion : undefined,
        activo: true,
        mensajePersonalizado: mensajePersonalizado || undefined,
      });

      showToast('Recordatorio programado exitosamente.', 'success');
      // Reset form fields
      setSelectedCliente(null);
      setSelectedVenta(null);
      setMensajePersonalizado('');
      refetchProgramaciones();
    } catch (e) {
      showToast('Error al registrar la programación del recordatorio.', 'error');
    }
  };

  const handleToggleActivo = async (id: number, currentStatus: boolean) => {
    try {
      await toggleProgMutation.mutateAsync({
        id,
        activo: !currentStatus,
      });
      // Toggle locally
      await refetchProgramaciones();
      showToast('Estado de la programación actualizado.', 'success');
    } catch (e) {
      showToast('Error al actualizar el estado de la programación.', 'error');
    }
  };

  const handleDeleteProgramacion = async (id: number) => {
    if (window.confirm('¿Está seguro de eliminar esta regla de programación?')) {
      try {
        await deleteProgMutation.mutateAsync(id);
        showToast('Programación eliminada exitosamente.', 'success');
        refetchProgramaciones();
      } catch (e) {
        showToast('Error al eliminar la programación.', 'error');
      }
    }
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
        return <Chip label="Correo" size="small" variant="outlined" sx={{ fontWeight: 600 }} />;
      case 'AMBOS':
        return <Chip label="WhatsApp + Correo" size="small" color="primary" variant="outlined" sx={{ fontWeight: 600 }} />;
      default:
        return <Chip label="WhatsApp" size="small" color="success" variant="outlined" sx={{ fontWeight: 600 }} />;
    }
  };

  // Filter local history search
  const filteredRecordatorios = recordatorios?.filter(r =>
    r.nombreCliente.toLowerCase().includes(historySearchQuery.toLowerCase()) ||
    r.descripcionProducto.toLowerCase().includes(historySearchQuery.toLowerCase())
  );

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
          Cobranza y Recordatorios de Pago
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
          Administra la cobranza automática y gestiona alertas de deudas por cliente.
        </Typography>
      </Box>

      {/* Tabs Menu */}
      <Paper sx={{ mb: 4, borderRadius: '16px', border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
        <Tabs value={activeTab} onChange={handleTabChange} indicatorColor="primary" textColor="primary" variant="fullWidth">
          <Tab icon={<ListIcon />} iconPosition="start" label="Bandeja de Recordatorios" sx={{ textTransform: 'none', fontWeight: 700 }} />
          <Tab icon={<AddAlertIcon />} iconPosition="start" label="Programar Alertas Automáticas" sx={{ textTransform: 'none', fontWeight: 700 }} />
        </Tabs>
      </Paper>

      {/* TAB 0: HISTORIAL DE RECORDATORIOS */}
      {activeTab === 0 && (
        <Box>
          {/* Action Header */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3, gap: 1.5 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => refetchRecordatorios()}
              disabled={isLoadingRecordatorios}
              sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700 }}
            >
              Actualizar
            </Button>
            <Button
              variant="contained"
              startIcon={generarMutation.isPending ? <CircularProgress size={20} color="inherit" /> : <CachedIcon />}
              onClick={handleGenerarManual}
              disabled={generarMutation.isPending || isLoadingRecordatorios}
              sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700 }}
            >
              Generar Cobranza del Domingo
            </Button>
          </Box>

          {/* Filters Toolbar */}
          <Paper sx={{ p: 2.5, mb: 3, borderRadius: '16px', border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1.5fr 1fr 1fr 1fr' }, gap: 2, alignItems: 'center' }}>
              {/* Autocomplete Client Filter */}
              <Autocomplete
                size="small"
                options={clientes || []}
                getOptionLabel={(option) => `${option.nombre} ${option.apellidoPaterno ?? ''} ${option.apellidoMaterno ?? ''}`.trim()}
                value={historyCliente}
                onChange={(_, newValue) => setHistoryCliente(newValue)}
                renderInput={(params) => <TextField {...params} label="Filtrar por Cliente" />}
              />

              <TextField
                select
                label="Filtrar por Estatus"
                size="small"
                value={historyEstatusFilter}
                onChange={(e) => setHistoryEstatusFilter(e.target.value)}
                fullWidth
              >
                <MenuItem value="">Todos los estatus</MenuItem>
                <MenuItem value="PENDIENTE">Pendientes de Envío</MenuItem>
                <MenuItem value="ENVIADO">Enviados</MenuItem>
                <MenuItem value="FALLIDO">Fallidos</MenuItem>
              </TextField>

              <TextField
                select
                label="Filtrar por Canal"
                size="small"
                value={historyCanalFilter}
                onChange={(e) => setHistoryCanalFilter(e.target.value)}
                fullWidth
              >
                <MenuItem value="">Todos los canales</MenuItem>
                <MenuItem value="WHATSAPP">WhatsApp</MenuItem>
                <MenuItem value="CORREO">Correo</MenuItem>
                <MenuItem value="AMBOS">WhatsApp + Correo</MenuItem>
              </TextField>

              <TextField
                label="Buscar por producto..."
                size="small"
                value={historySearchQuery}
                onChange={(e) => setHistorySearchQuery(e.target.value)}
                fullWidth
              />
            </Box>
          </Paper>

          {/* Table list */}
          {isLoadingRecordatorios ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : !filteredRecordatorios || filteredRecordatorios.length === 0 ? (
            <Paper sx={{ py: 8, px: 4, textAlign: 'center', borderRadius: '16px', border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
              <DoneIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }} gutterBottom>
                No hay recordatorios pendientes
              </Typography>
              <Typography variant="body2" color="text.secondary">
                No se encontraron recordatorios con los filtros aplicados.
              </Typography>
            </Paper>
          ) : (
            <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '16px', maxHeight: '55vh' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Cliente</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Venta / Deuda</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Canal</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Programación</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Mensaje</TableCell>
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
                        <Typography variant="caption" color="primary.main" sx={{ fontWeight: 600 }}>
                          Venta #{r.ventaId}
                        </Typography>
                      </TableCell>
                      <TableCell>{getCanalChip(r.canal)}</TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: '0.825rem' }}>
                          {r.fechaProgramada ? formatDate(r.fechaProgramada) : 'Manual'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          Creado: {formatDate(r.fechaCreacion)}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 260 }}>
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
                              lineHeight: 1.4,
                            }}
                          >
                            {r.mensaje}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="center">{getStatusChip(r.estatus)}</TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                          {r.telefonoCliente && (
                            <Tooltip title="Enviar por WhatsApp (Abre chat pre-redactado)">
                              <IconButton
                                color="success"
                                onClick={() => handleEnviarWhatsApp(r.recordatorioId, r.telefonoCliente, r.mensaje)}
                                sx={{ bgcolor: 'rgba(76, 175, 80, 0.08)', '&:hover': { bgcolor: 'rgba(76, 175, 80, 0.15)' } }}
                              >
                                <WhatsAppIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {r.correoCliente && (
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
                                    sx={{ color: 'primary.main', position: 'absolute', top: 1, left: 1, zIndex: 1 }}
                                  />
                                )}
                              </Box>
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
        </Box>
      )}

      {/* TAB 1: PROGRAMAR ALERTAS AUTOMÁTICAS */}
      {activeTab === 1 && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' }, gap: 3.5 }}>
          {/* Scheduling Creator Form */}
          <Paper sx={{ p: 3, borderRadius: '16px', border: '1px solid', borderColor: 'divider', boxShadow: 'none', height: 'fit-content' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Nueva Programación
            </Typography>

            <form onSubmit={handleScheduleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {/* Select Client */}
                <Autocomplete
                  options={clientes || []}
                  getOptionLabel={(option) => `${option.nombre} ${option.apellidoPaterno ?? ''} ${option.apellidoMaterno ?? ''}`.trim()}
                  value={selectedCliente}
                  onChange={(_, newValue) => {
                    setSelectedCliente(newValue);
                    setSelectedVenta(null);
                  }}
                  renderInput={(params) => <TextField {...params} label="Cliente *" required />}
                />

                {/* Select Debt (Venta) */}
                <Autocomplete
                  options={ventasCliente || []}
                  getOptionLabel={(option) => `${option.descripcionProducto} (Saldo: $${option.saldoPendiente})`}
                  value={selectedVenta}
                  disabled={!selectedCliente || isLoadingVentasCliente}
                  onChange={(_, newValue) => setSelectedVenta(newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Seleccionar Deuda Pendiente *"
                      helperText={
                        !selectedCliente
                          ? 'Primero seleccione un cliente.'
                          : isLoadingVentasCliente
                          ? 'Cargando deudas...'
                          : ventasCliente?.length === 0
                          ? 'El cliente no tiene deudas pendientes.'
                          : ''
                      }
                      required
                    />
                  )}
                />

                {/* Select Canal */}
                <TextField
                  select
                  label="Canal de Notificación *"
                  value={canal}
                  onChange={(e) => setCanal(e.target.value as any)}
                  fullWidth
                >
                  <MenuItem value="WHATSAPP">WhatsApp (Aviso en Bandeja)</MenuItem>
                  <MenuItem value="CORREO">Correo (Envío 100% Automático)</MenuItem>
                  <MenuItem value="AMBOS">WhatsApp + Correo</MenuItem>
                </TextField>

                {/* Select Frecuencia */}
                <TextField
                  select
                  label="Frecuencia *"
                  value={frecuencia}
                  onChange={(e) => setFrecuencia(e.target.value as any)}
                  fullWidth
                >
                  <MenuItem value="SEMANAL">Semanal (Ej: Cada Domingo)</MenuItem>
                  <MenuItem value="DIARIA">Diaria</MenuItem>
                  <MenuItem value="UNICA">Una sola vez (Fecha específica)</MenuItem>
                </TextField>

                {/* Conditional Fields based on Frecuencia */}
                {frecuencia === 'SEMANAL' && (
                  <TextField
                    select
                    label="Día de la Semana *"
                    value={diaSemana}
                    onChange={(e) => setDiaSemana(e.target.value)}
                    fullWidth
                  >
                    <MenuItem value="LUNES">Lunes</MenuItem>
                    <MenuItem value="MARTES">Martes</MenuItem>
                    <MenuItem value="MIERCOLES">Miércoles</MenuItem>
                    <MenuItem value="JUEVES">Jueves</MenuItem>
                    <MenuItem value="VIERNES">Viernes</MenuItem>
                    <MenuItem value="SABADO">Sábado</MenuItem>
                    <MenuItem value="DOMINGO">Domingo</MenuItem>
                  </TextField>
                )}

                {frecuencia !== 'UNICA' ? (
                  <TextField
                    type="time"
                    label="Hora de Ejecución *"
                    value={horaEjecucion}
                    onChange={(e) => setHoraEjecucion(e.target.value)}
                    slotProps={{
                      inputLabel: { shrink: true }
                    }}
                    fullWidth
                    required
                  />
                ) : (
                  <TextField
                    type="datetime-local"
                    label="Fecha y Hora de Ejecución *"
                    value={fechaHoraEjecucion}
                    onChange={(e) => setFechaHoraEjecucion(e.target.value)}
                    slotProps={{
                      inputLabel: { shrink: true }
                    }}
                    fullWidth
                    required
                  />
                )}

                {/* Custom override message */}
                <TextField
                  label="Mensaje Personalizado (Opcional)"
                  placeholder="Dejar vacío para usar plantilla estándar de cobro."
                  value={mensajePersonalizado}
                  onChange={(e) => setMensajePersonalizado(e.target.value)}
                  multiline
                  rows={3}
                  fullWidth
                />

                <Button
                  type="submit"
                  variant="contained"
                  disabled={createProgMutation.isPending}
                  startIcon={createProgMutation.isPending ? <CircularProgress size={20} /> : <AddAlertIcon />}
                  sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700 }}
                >
                  Programar Recordatorio
                </Button>
              </Box>
            </form>
          </Paper>

          {/* Active Schedules List */}
          <Paper sx={{ p: 3, borderRadius: '16px', border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Alertas Programadas Activas
            </Typography>

            {isLoadingProgramaciones ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
              </Box>
            ) : !programaciones || programaciones.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Typography color="text.secondary" sx={{ fontWeight: 500 }}>
                  No hay programaciones de cobro registradas.
                </Typography>
              </Box>
            ) : (
              <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Cliente</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Deuda</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Programación</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Canal</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="center">Activo</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="center">Acción</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {programaciones.map((p) => (
                      <TableRow key={p.programacionRecordatorioId} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{p.nombreCliente}</TableCell>
                        <TableCell>{p.descripcionProducto}</TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 600 }}>
                            {p.frecuencia === 'SEMANAL'
                              ? `Cada ${p.diaSemana} a las ${p.horaEjecucion}`
                              : p.frecuencia === 'DIARIA'
                              ? `Diario a las ${p.horaEjecucion}`
                              : `Única vez: ${p.fechaHoraEjecucion ? formatDate(p.fechaHoraEjecucion) : 'N/A'}`}
                          </Typography>
                          {p.fechaUltimaEjecucion && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              Última ejec: {formatDate(p.fechaUltimaEjecucion)}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>{getCanalChip(p.tipoCanal)}</TableCell>
                        <TableCell align="center">
                          <Switch
                            checked={p.activo}
                            onChange={() => handleToggleActivo(p.programacionRecordatorioId, p.activo)}
                            color="primary"
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => handleDeleteProgramacion(p.programacionRecordatorioId)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Box>
      )}

      {/* Toast warnings */}
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
