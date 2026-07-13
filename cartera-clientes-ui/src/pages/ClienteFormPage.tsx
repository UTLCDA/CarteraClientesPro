import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import {
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useCreateCliente, useCliente, useUpdateCliente } from '../hooks/useQueries';
import DireccionMapaSelector from '../components/DireccionMapaSelector';

const clienteSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio.').max(100, 'El nombre no debe exceder 100 caracteres.'),
  apellidoPaterno: z.string().max(80, 'El apellido paterno no debe exceder 80 caracteres.').optional().or(z.literal('')),
  apellidoMaterno: z.string().max(80, 'El apellido materno no debe exceder 80 caracteres.').optional().or(z.literal('')),
  telefono: z.string().max(20, 'El teléfono no debe exceder 20 caracteres.').optional().or(z.literal('')),
  correo: z.string().email('El correo electrónico no es válido.').max(150, 'El correo electrónico no debe exceder 150 caracteres.').optional().or(z.literal('')),
  direccion: z.string().max(250, 'La dirección no debe exceder 250 caracteres.').optional().or(z.literal('')),
});

type ClienteFormValues = z.infer<typeof clienteSchema>;

const ClienteFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const clienteId = isEditMode ? parseInt(id!) : 0;

  const { data: cliente, isLoading: isLoadingCliente, error: loadError } = useCliente(clienteId);
  const createClienteMutation = useCreateCliente();
  const updateClienteMutation = useUpdateCliente(clienteId);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ClienteFormValues>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      nombre: '',
      apellidoPaterno: '',
      apellidoMaterno: '',
      telefono: '',
      correo: '',
      direccion: '',
    },
  });

  useEffect(() => {
    if (isEditMode && cliente) {
      setValue('nombre', cliente.nombre);
      setValue('apellidoPaterno', cliente.apellidoPaterno || '');
      setValue('apellidoMaterno', cliente.apellidoMaterno || '');
      setValue('telefono', cliente.telefono || '');
      setValue('correo', cliente.correo || '');
      setValue('direccion', cliente.direccion || '');
    }
  }, [isEditMode, cliente, setValue]);

  const onSubmit = async (values: ClienteFormValues) => {
    const dataToSend = {
      nombre: values.nombre,
      apellidoPaterno: values.apellidoPaterno || undefined,
      apellidoMaterno: values.apellidoMaterno || undefined,
      telefono: values.telefono || undefined,
      correo: values.correo || undefined,
      direccion: values.direccion || undefined,
    };

    try {
      if (isEditMode) {
        await updateClienteMutation.mutateAsync(dataToSend);
      } else {
        await createClienteMutation.mutateAsync(dataToSend);
      }
      navigate('/clientes');
    } catch (e) {
      console.error(e);
    }
  };

  if (isEditMode && isLoadingCliente) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isEditMode && loadError) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Error al cargar los datos del cliente.
      </Alert>
    );
  }

  const isSaving = createClienteMutation.isPending || updateClienteMutation.isPending;
  const saveError = createClienteMutation.error || updateClienteMutation.error;

  return (
    <Box sx={{ maxWidth: 850, mx: 'auto' }}>
      {/* Page header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mr: 2, textTransform: 'none', fontWeight: 700 }}
        >
          Volver
        </Button>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          {isEditMode ? 'Editar Cliente' : 'Registrar Cliente'}
        </Typography>
      </Box>

      {saveError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {saveError.message || 'Ocurrió un error al guardar los datos del cliente.'}
        </Alert>
      )}

      {/* Form Card */}
      <Paper sx={{ p: 4, borderRadius: '16px', border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 3.5 }}>
            <Box sx={{ gridColumn: 'span 12' }}>
              <Controller
                name="nombre"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Nombre(s) *"
                    fullWidth
                    error={!!errors.nombre}
                    helperText={errors.nombre?.message}
                  />
                )}
              />
            </Box>

            <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
              <Controller
                name="apellidoPaterno"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Apellido Paterno"
                    fullWidth
                    error={!!errors.apellidoPaterno}
                    helperText={errors.apellidoPaterno?.message}
                  />
                )}
              />
            </Box>

            <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
              <Controller
                name="apellidoMaterno"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Apellido Materno"
                    fullWidth
                    error={!!errors.apellidoMaterno}
                    helperText={errors.apellidoMaterno?.message}
                  />
                )}
              />
            </Box>

            <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
              <Controller
                name="telefono"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Teléfono"
                    fullWidth
                    error={!!errors.telefono}
                    helperText={errors.telefono?.message}
                  />
                )}
              />
            </Box>

            <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
              <Controller
                name="correo"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Correo Electrónico"
                    fullWidth
                    error={!!errors.correo}
                    helperText={errors.correo?.message}
                  />
                )}
              />
            </Box>

            <Box sx={{ gridColumn: 'span 12' }}>
              <Controller
                name="direccion"
                control={control}
                render={({ field }) => (
                  <DireccionMapaSelector
                    value={field.value || ''}
                    onChange={field.onChange}
                    error={!!errors.direccion}
                    helperText={errors.direccion?.message}
                  />
                )}
              />
            </Box>

            <Box sx={{ gridColumn: 'span 12', display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/clientes')}
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
                Guardar Cliente
              </Button>
            </Box>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default ClienteFormPage;
