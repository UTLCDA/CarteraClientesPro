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
  InputAdornment,
  IconButton,
  Tooltip,
  Chip,
  Box,
  Switch,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  PersonAddAlt as PersonAddIcon,
} from '@mui/icons-material';
import { useClientes, useUpdateClienteEstatus } from '../hooks/useQueries';
import { formatCurrency } from '../utils/format';

const ClientesList: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const { data: clientes, isLoading, error } = useClientes(searchText);
  const navigate = useNavigate();

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
  };

  return (
    <Box>
      {/* Header section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          Administrar Clientes
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/clientes/nuevo')}
          sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700 }}
        >
          Registrar Cliente
        </Button>
      </Box>

      {/* Search and Table section */}
      <Paper sx={{ p: 3, borderRadius: '16px', border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
        <TextField
          placeholder="Buscar cliente por nombre, teléfono o correo..."
          variant="outlined"
          size="small"
          value={searchText}
          onChange={handleSearchChange}
          sx={{ mb: 3, width: { xs: '100%', sm: 400 } }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }
          }}
        />

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">Error al cargar el listado de clientes.</Alert>
        ) : !clientes || clientes.length === 0 ? (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <PersonAddIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No se encontraron clientes
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Registra un nuevo cliente para comenzar a administrar su cartera.
            </Typography>
          </Box>
        ) : (
          <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px', overflowX: 'auto' }}>
            <Table sx={{ minWidth: 700 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Nombre Completo</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Teléfono</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Correo Electrónico</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">Saldo Pendiente</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">Estatus</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {clientes.map((cliente) => (
                  <TableRow key={cliente.clienteId} hover>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {`${cliente.nombre} ${cliente.apellidoPaterno || ''} ${cliente.apellidoMaterno || ''}`.trim()}
                    </TableCell>
                    <TableCell>{cliente.telefono || 'Sin teléfono'}</TableCell>
                    <TableCell>{cliente.correo || 'Sin correo'}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: cliente.saldoTotalPendiente > 0 ? 'error.main' : 'text.primary' }}>
                      {formatCurrency(cliente.saldoTotalPendiente)}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={cliente.activo ? 'Activo' : 'Inactivo'}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          bgcolor: cliente.activo ? 'rgba(16, 185, 129, 0.12)' : 'rgba(148, 163, 184, 0.12)',
                          color: cliente.activo ? '#10b981' : '#64748b',
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
                        <Tooltip title="Ver detalle">
                          <IconButton color="primary" onClick={() => navigate(`/clientes/${cliente.clienteId}`)}>
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Editar">
                          <IconButton color="secondary" onClick={() => navigate(`/clientes/editar/${cliente.clienteId}`)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={cliente.activo ? 'Desactivar' : 'Activar'}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <StatusToggleSwitch clienteId={cliente.clienteId} initialValue={cliente.activo} />
                          </Box>
                        </Tooltip>
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

// Subcomponent to wrap switch status mutations
const StatusToggleSwitch: React.FC<{ clienteId: number; initialValue: boolean }> = ({ clienteId, initialValue }) => {
  const [checked, setChecked] = useState(initialValue);
  const statusMutation = useUpdateClienteEstatus(clienteId);

  const handleToggle = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.checked;
    setChecked(newValue);
    try {
      await statusMutation.mutateAsync(newValue);
    } catch {
      setChecked(!newValue); // rollback on failure
    }
  };

  return <Switch checked={checked} onChange={handleToggle} color="primary" size="small" />;
};

export default ClientesList;
