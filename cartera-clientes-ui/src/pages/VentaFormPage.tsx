import React, { useEffect } from 'react';
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
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useCreateVenta, useClientes } from '../hooks/useQueries';
import { formatCurrency, formatDateForInput } from '../utils/format';

const ventaSchema = z.object({
  clienteId: z.number().min(1, 'El cliente es obligatorio.'),
  descripcionProducto: z.string().min(1, 'La descripción del producto es obligatoria.').max(250, 'La descripción no debe exceder 250 caracteres.'),
  cantidad: z.coerce.number()
    .int('La cantidad debe ser un número entero.')
    .positive('La cantidad debe ser mayor que cero.'),
  precioUnitario: z.coerce.number()
    .positive('El precio unitario debe ser mayor que cero.'),
  fechaInicioDeuda: z.string().min(1, 'La fecha de inicio de la deuda es obligatoria.'),
  fechaLimitePago: z.string().optional().or(z.literal('')),
  observaciones: z.string().max(500, 'Las observaciones no deben exceder 500 caracteres.').optional().or(z.literal('')),
}).refine(data => {
  if (data.fechaLimitePago && data.fechaInicioDeuda) {
    const inicio = new Date(data.fechaInicioDeuda);
    const limite = new Date(data.fechaLimitePago);
    return limite >= inicio;
  }
  return true;
}, {
  message: 'La fecha límite de pago no puede ser menor que la fecha de inicio de la deuda.',
  path: ['fechaLimitePago']
});

type VentaFormValues = z.infer<typeof ventaSchema>;

const VentaFormPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClienteId = searchParams.get('clienteId');

  const { data: clientes, isLoading: isLoadingClientes, error: loadClientesError } = useClientes();
  const createVentaMutation = useCreateVenta();

  const todayStr = formatDateForInput(new Date());

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<VentaFormValues>({
    resolver: zodResolver(ventaSchema) as any,
    defaultValues: {
      clienteId: queryClienteId ? parseInt(queryClienteId) : undefined as any,
      descripcionProducto: '',
      cantidad: '' as any,
      precioUnitario: '' as any,
      fechaInicioDeuda: todayStr,
      fechaLimitePago: '',
      observaciones: '',
    },
  });

  // Watch quantity and unit price to compute live total
  const cantidad = watch('cantidad');
  const precioUnitario = watch('precioUnitario');
  const totalCalculado = (Number(cantidad) || 0) * (Number(precioUnitario) || 0);

  // If query parameter changes, set value
  useEffect(() => {
    if (queryClienteId) {
      setValue('clienteId', parseInt(queryClienteId));
    }
  }, [queryClienteId, setValue]);

  const onSubmit = async (values: VentaFormValues) => {
    const dataToSend = {
      clienteId: values.clienteId,
      descripcionProducto: values.descripcionProducto,
      cantidad: values.cantidad,
      precioUnitario: values.precioUnitario,
      fechaInicioDeuda: values.fechaInicioDeuda,
      fechaLimitePago: values.fechaLimitePago || undefined,
      observaciones: values.observaciones || undefined,
    };

    try {
      await createVentaMutation.mutateAsync(dataToSend);
      navigate(queryClienteId ? `/clientes/${queryClienteId}` : '/ventas');
    } catch (e) {
      console.error(e);
    }
  };

  const isSaving = createVentaMutation.isPending;
  const saveError = createVentaMutation.error;

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
          Registrar Venta a Crédito
        </Typography>
      </Box>

      {saveError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {saveError.message || 'Ocurrió un error al guardar la venta.'}
        </Alert>
      )}

      {isLoadingClientes ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : loadClientesError ? (
        <Alert severity="error">Error al cargar el listado de clientes. No se puede registrar la venta.</Alert>
      ) : (
        <Paper sx={{ p: 4, borderRadius: '16px', border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 3.5 }}>
              <Box sx={{ gridColumn: 'span 12' }}>
                <Controller
                  name="clienteId"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="Cliente *"
                      fullWidth
                      error={!!errors.clienteId}
                      helperText={errors.clienteId?.message}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                      disabled={!!queryClienteId}
                    >
                      <MenuItem value="">Seleccione un cliente</MenuItem>
                      {clientes?.map((c) => (
                        <MenuItem key={c.clienteId} value={c.clienteId}>
                          {`${c.nombre} ${c.apellidoPaterno || ''} ${c.apellidoMaterno || ''}`.trim()}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Box>

              <Box sx={{ gridColumn: 'span 12' }}>
                <Controller
                  name="descripcionProducto"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Descripción del Producto *"
                      fullWidth
                      error={!!errors.descripcionProducto}
                      helperText={errors.descripcionProducto?.message}
                    />
                  )}
                />
              </Box>

              <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 4' } }}>
                <Controller
                  name="cantidad"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="number"
                      label="Cantidad *"
                      fullWidth
                      error={!!errors.cantidad}
                      helperText={errors.cantidad?.message}
                      onChange={(e) => {
                        const val = e.target.value;
                        field.onChange(val === '' ? '' : parseInt(val, 10));
                      }}
                    />
                  )}
                />
              </Box>

              <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 4' } }}>
                <Controller
                  name="precioUnitario"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="number"
                      label="Precio Unitario *"
                      fullWidth
                      error={!!errors.precioUnitario}
                      helperText={errors.precioUnitario?.message}
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

              {/* Autocalculated field */}
              <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 4' } }}>
                <TextField
                  label="Monto Total Calculado"
                  fullWidth
                  value={formatCurrency(totalCalculado)}
                  slotProps={{
                    input: { readOnly: true }
                  }}
                  disabled
                />
              </Box>

              <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                <Controller
                  name="fechaInicioDeuda"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="date"
                      label="Fecha de Inicio *"
                      fullWidth
                      slotProps={{ inputLabel: { shrink: true } }}
                      error={!!errors.fechaInicioDeuda}
                      helperText={errors.fechaInicioDeuda?.message}
                    />
                  )}
                />
              </Box>

              <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                <Controller
                  name="fechaLimitePago"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="date"
                      label="Fecha Límite de Pago"
                      fullWidth
                      slotProps={{ inputLabel: { shrink: true } }}
                      error={!!errors.fechaLimitePago}
                      helperText={errors.fechaLimitePago?.message}
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
                      rows={3}
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
                  startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                  disabled={isSaving}
                  sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700 }}
                >
                  Registrar Venta
                </Button>
              </Box>
            </Box>
          </form>
        </Paper>
      )}
    </Box>
  );
};

export default VentaFormPage;
