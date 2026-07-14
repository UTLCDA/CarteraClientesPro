import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import {
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  CircularProgress,
  Alert,
  InputAdornment,
  Autocomplete,
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useCreatePago, useVentasPendientes, useVenta } from '../hooks/useQueries';
import { formatCurrency, formatDateForInput } from '../utils/format';

const pagoSchema = z.object({
  ventaId: z.number().min(1, 'La venta es obligatoria.'),
  montoPago: z.coerce.number().positive('El monto del pago debe ser mayor que cero.'),
  fechaPago: z.string().min(1, 'La fecha de pago es obligatoria.'),
  formaPago: z.string().max(30, 'La forma de pago no debe exceder 30 caracteres.').optional().or(z.literal('')),
  referencia: z.string().max(100, 'La referencia no debe exceder 100 caracteres.').optional().or(z.literal('')),
  observaciones: z.string().max(250, 'Las observaciones no deben exceder 250 caracteres.').optional().or(z.literal('')),
});

type PagoFormValues = z.infer<typeof pagoSchema>;

const PagoFormPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryVentaId = searchParams.get('ventaId');

  // Fetch pending sales for the dropdown selection
  const { data: ventasPendientes, isLoading: isLoadingVentas, error: loadVentasError } = useVentasPendientes();
  const createPagoMutation = useCreatePago();

  const todayStr = formatDateForInput(new Date());

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors },
  } = useForm<PagoFormValues>({
    resolver: zodResolver(pagoSchema) as any,
    defaultValues: {
      ventaId: queryVentaId ? parseInt(queryVentaId) : undefined as any,
      montoPago: '' as any,
      fechaPago: todayStr,
      formaPago: 'EFECTIVO',
      referencia: '',
      observaciones: '',
    },
  });

  const selectedVentaId = watch('ventaId');
  const [saldoPendiente, setSaldoPendiente] = useState<number>(0);
  const [selectedVentaDetails, setSelectedVentaDetails] = useState<string>('');

  // Fetch selected sale details in case it was passed by query parameter
  const { data: queryVenta } = useVenta(queryVentaId ? parseInt(queryVentaId) : 0);

  useEffect(() => {
    if (queryVentaId && queryVenta) {
      setSaldoPendiente(queryVenta.saldoPendiente);
      setSelectedVentaDetails(`${queryVenta.nombreCliente} - ${queryVenta.descripcionProducto}`);
      setValue('ventaId', queryVenta.ventaId);
    }
  }, [queryVentaId, queryVenta, setValue]);

  // Handle selected venta changes
  useEffect(() => {
    if (selectedVentaId && ventasPendientes && !queryVentaId) {
      const selected = ventasPendientes.find(v => v.ventaId === selectedVentaId);
      if (selected) {
        setSaldoPendiente(selected.saldoPendiente);
        setSelectedVentaDetails(`${selected.nombreCliente} - ${selected.descripcionProducto}`);
      }
    }
  }, [selectedVentaId, ventasPendientes, queryVentaId]);

  const onSubmit = async (values: PagoFormValues) => {
    if (values.montoPago > saldoPendiente) {
      setError('montoPago', {
        type: 'manual',
        message: `El monto del pago (${formatCurrency(values.montoPago)}) no puede exceder el saldo pendiente (${formatCurrency(saldoPendiente)}).`,
      });
      return;
    }

    const dataToSend = {
      ventaId: values.ventaId,
      montoPago: values.montoPago,
      fechaPago: values.fechaPago,
      formaPago: values.formaPago || undefined,
      referencia: values.referencia || undefined,
      observaciones: values.observaciones || undefined,
    };

    try {
      await createPagoMutation.mutateAsync(dataToSend);
      navigate(queryVentaId ? `/ventas/${queryVentaId}` : '/pagos');
    } catch (e) {
      console.error(e);
    }
  };

  const isSaving = createPagoMutation.isPending;
  const saveError = createPagoMutation.error;

  return (
    <Box sx={{ maxWidth: 850, mx: 'auto' }}>
      {/* Top Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mr: 2, textTransform: 'none', fontWeight: 700 }}
        >
          Volver
        </Button>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          Registrar Abono / Pago
        </Typography>
      </Box>

      {saveError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {saveError.message || 'Ocurrió un error al guardar el pago.'}
        </Alert>
      )}

      {isLoadingVentas ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : loadVentasError ? (
        <Alert severity="error">Error al cargar el listado de ventas pendientes.</Alert>
      ) : (
        <Paper sx={{ p: 4, borderRadius: '16px', border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 3.5 }}>
              <Box sx={{ gridColumn: 'span 12' }}>
                {queryVentaId ? (
                  <TextField
                    label="Venta a Crédito Seleccionada"
                    fullWidth
                    value={`${selectedVentaDetails}`}
                    disabled
                  />
                ) : (
                  <Controller
                    name="ventaId"
                    control={control}
                    render={({ field }) => (
                      <Autocomplete
                        options={ventasPendientes || []}
                        getOptionLabel={(option) => 
                          `${option.nombreCliente} - ${option.descripcionProducto} (${formatCurrency(option.saldoPendiente)} pend.)`
                        }
                        value={ventasPendientes?.find(v => v.ventaId === field.value) || null}
                        onChange={(_, newValue) => {
                          field.onChange(newValue ? newValue.ventaId : undefined);
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Seleccione la Venta Pendiente *"
                            error={!!errors.ventaId}
                            helperText={errors.ventaId?.message}
                            required
                          />
                        )}
                        fullWidth
                      />
                    )}
                  />
                )}
              </Box>

              {/* Dynamic Balance indicator */}
              {selectedVentaId > 0 && (
                <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                  <TextField
                    label="Saldo Pendiente de la Venta"
                    fullWidth
                    value={formatCurrency(saldoPendiente)}
                    slotProps={{
                      input: { readOnly: true }
                    }}
                    disabled
                    sx={{
                      '& .MuiInputBase-input': {
                        color: 'error.main',
                        fontWeight: 700,
                      },
                    }}
                  />
                </Box>
              )}

              <Box sx={{ gridColumn: selectedVentaId > 0 ? { xs: 'span 12', sm: 'span 6' } : 'span 12' }}>
                <Controller
                  name="montoPago"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="number"
                      label="Monto del Abono *"
                      fullWidth
                      error={!!errors.montoPago}
                      helperText={errors.montoPago?.message}
                      slotProps={{
                        input: {
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        }
                      }}
                      onChange={(e) => {
                        const val = e.target.value;
                        field.onChange(val === '' ? '' : parseFloat(val));
                      }}
                    />
                  )}
                />
              </Box>

              <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                <Controller
                  name="fechaPago"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="date"
                      label="Fecha de Pago *"
                      fullWidth
                      slotProps={{ inputLabel: { shrink: true } }}
                      error={!!errors.fechaPago}
                      helperText={errors.fechaPago?.message}
                    />
                  )}
                />
              </Box>

              <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                <Controller
                  name="formaPago"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="Forma de Pago *"
                      fullWidth
                      error={!!errors.formaPago}
                      helperText={errors.formaPago?.message}
                    >
                      <MenuItem value="EFECTIVO">Efectivo</MenuItem>
                      <MenuItem value="TRANSFERENCIA">Transferencia Electrónica</MenuItem>
                      <MenuItem value="TARJETA">Tarjeta de Crédito/Débito</MenuItem>
                      <MenuItem value="DEPOSITO">Depósito Bancario</MenuItem>
                      <MenuItem value="OTRO">Otro</MenuItem>
                    </TextField>
                  )}
                />
              </Box>

              <Box sx={{ gridColumn: 'span 12' }}>
                <Controller
                  name="referencia"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Referencia de Pago (Folio, Autorización, etc.)"
                      fullWidth
                      error={!!errors.referencia}
                      helperText={errors.referencia?.message}
                    />
                  )}
                />
              </Box>

              <Box sx={{ gridColumn: 'span 12' }}>
                <Controller
                  name="observaciones"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Observaciones"
                      fullWidth
                      multiline
                      rows={2}
                      error={!!errors.observaciones}
                      helperText={errors.observaciones?.message}
                    />
                  )}
                />
              </Box>

              <Box sx={{ gridColumn: 'span 12', display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate(-1)}
                  disabled={isSaving}
                  sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700 }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="success"
                  startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                  disabled={isSaving}
                  sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700 }}
                >
                  Registrar Pago
                </Button>
              </Box>
            </Box>
          </form>
        </Paper>
      )}
    </Box>
  );
};

export default PagoFormPage;
