import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/apiClient';
import * as T from '../types';

// ==========================================
// DASHBOARD
// ==========================================
export const useDashboardResumen = () => {
  return useQuery<T.DashboardResumen>({
    queryKey: ['dashboardResumen'],
    queryFn: async () => {
      const response = await apiClient.get<T.DashboardResumen>('/dashboard/resumen');
      return response.data;
    },
  });
};

// ==========================================
// CLIENTES
// ==========================================
export const useClientes = (texto?: string) => {
  return useQuery<T.Cliente[]>({
    queryKey: ['clientes', texto],
    queryFn: async () => {
      const url = texto ? `/clientes/buscar?texto=${encodeURIComponent(texto)}` : '/clientes';
      const response = await apiClient.get<T.Cliente[]>(url);
      return response.data;
    },
  });
};

export const useCliente = (id: number) => {
  return useQuery<T.Cliente>({
    queryKey: ['cliente', id],
    queryFn: async () => {
      const response = await apiClient.get<T.Cliente>(`/clientes/${id}`);
      return response.data;
    },
    enabled: id > 0,
  });
};

export const useClienteResumen = (id: number) => {
  return useQuery<T.ClienteResumen>({
    queryKey: ['clienteResumen', id],
    queryFn: async () => {
      const response = await apiClient.get<T.ClienteResumen>(`/clientes/${id}/resumen`);
      return response.data;
    },
    enabled: id > 0,
  });
};

export const useCreateCliente = () => {
  const queryClient = useQueryClient();
  return useMutation<T.Cliente, Error, T.ClienteCreateUpdate>({
    mutationFn: async (newCliente) => {
      const response = await apiClient.post<T.Cliente>('/clientes', newCliente);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardResumen'] });
    },
  });
};

export const useUpdateCliente = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<T.Cliente, Error, T.ClienteCreateUpdate>({
    mutationFn: async (updatedCliente) => {
      const response = await apiClient.put<T.Cliente>(`/clientes/${id}`, updatedCliente);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      queryClient.invalidateQueries({ queryKey: ['cliente', id] });
      queryClient.invalidateQueries({ queryKey: ['clienteResumen', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboardResumen'] });
    },
  });
};

export const useUpdateClienteEstatus = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, boolean>({
    mutationFn: async (activo) => {
      await apiClient.patch(`/clientes/${id}/estatus`, activo);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      queryClient.invalidateQueries({ queryKey: ['cliente', id] });
      queryClient.invalidateQueries({ queryKey: ['clienteResumen', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboardResumen'] });
    },
  });
};

// ==========================================
// VENTAS
// ==========================================
export interface VentasFilters {
  clienteId?: number | string;
  estatus?: string;
  fechaInicio?: string;
  fechaFin?: string;
  productoText?: string;
}

export const useVentas = (filters: VentasFilters = {}) => {
  return useQuery<T.Venta[]>({
    queryKey: ['ventas', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.clienteId) params.append('clienteId', filters.clienteId.toString());
      if (filters.estatus) params.append('estatus', filters.estatus);
      if (filters.fechaInicio) params.append('fechaInicio', filters.fechaInicio);
      if (filters.fechaFin) params.append('fechaFin', filters.fechaFin);
      if (filters.productoText) params.append('productoText', filters.productoText);

      const response = await apiClient.get<T.Venta[]>(`/ventas?${params.toString()}`);
      return response.data;
    },
  });
};

export const useVenta = (id: number) => {
  return useQuery<T.Venta>({
    queryKey: ['venta', id],
    queryFn: async () => {
      const response = await apiClient.get<T.Venta>(`/ventas/${id}`);
      return response.data;
    },
    enabled: id > 0,
  });
};

export const useVentasByCliente = (clienteId: number) => {
  return useQuery<T.Venta[]>({
    queryKey: ['ventasCliente', clienteId],
    queryFn: async () => {
      const response = await apiClient.get<T.Venta[]>(`/ventas/cliente/${clienteId}`);
      return response.data;
    },
    enabled: clienteId > 0,
  });
};

export const useVentasPendientes = () => {
  return useQuery<T.Venta[]>({
    queryKey: ['ventasPendientes'],
    queryFn: async () => {
      const response = await apiClient.get<T.Venta[]>('/ventas/pendientes');
      return response.data;
    },
  });
};

export const useCreateVenta = () => {
  const queryClient = useQueryClient();
  return useMutation<T.Venta, Error, T.VentaCreate>({
    mutationFn: async (newVenta) => {
      const response = await apiClient.post<T.Venta>('/ventas', newVenta);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ventas'] });
      queryClient.invalidateQueries({ queryKey: ['ventasPendientes'] });
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardResumen'] });
    },
  });
};

export const useUpdateVenta = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<T.Venta, Error, T.VentaCreate>({
    mutationFn: async (updatedVenta) => {
      const response = await apiClient.put<T.Venta>(`/ventas/${id}`, updatedVenta);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ventas'] });
      queryClient.invalidateQueries({ queryKey: ['venta', id] });
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardResumen'] });
    },
  });
};

export const useCancelarVenta = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, void>({
    mutationFn: async () => {
      await apiClient.patch(`/ventas/${id}/cancelar`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ventas'] });
      queryClient.invalidateQueries({ queryKey: ['venta', id] });
      queryClient.invalidateQueries({ queryKey: ['movimientos', id] }); // invalidate movements for this sale
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardResumen'] });
    },
  });
};

// ==========================================
// PAGOS
// ==========================================
export const usePagos = () => {
  return useQuery<T.Pago[]>({
    queryKey: ['pagos'],
    queryFn: async () => {
      const response = await apiClient.get<T.Pago[]>('/pagos');
      return response.data;
    },
  });
};

export const usePagosByVenta = (ventaId: number) => {
  return useQuery<T.Pago[]>({
    queryKey: ['pagosVenta', ventaId],
    queryFn: async () => {
      const response = await apiClient.get<T.Pago[]>(`/pagos/venta/${ventaId}`);
      return response.data;
    },
    enabled: ventaId > 0,
  });
};

export const useCreatePago = () => {
  const queryClient = useQueryClient();
  return useMutation<T.Pago, Error, T.PagoCreate>({
    mutationFn: async (newPago) => {
      const response = await apiClient.post<T.Pago>('/pagos', newPago);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['pagos'] });
      queryClient.invalidateQueries({ queryKey: ['pagosVenta', data.ventaId] });
      queryClient.invalidateQueries({ queryKey: ['venta', data.ventaId] });
      queryClient.invalidateQueries({ queryKey: ['ventas'] });
      queryClient.invalidateQueries({ queryKey: ['movimientos', data.ventaId] });
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardResumen'] });
    },
  });
};

// ==========================================
// MOVIMIENTOS
// ==========================================
export const useMovimientos = () => {
  return useQuery<T.Movimiento[]>({
    queryKey: ['movimientos'],
    queryFn: async () => {
      const response = await apiClient.get<T.Movimiento[]>('/movimientos');
      return response.data;
    },
  });
};

export const useMovimientosByVenta = (ventaId: number) => {
  return useQuery<T.Movimiento[]>({
    queryKey: ['movimientosVenta', ventaId],
    queryFn: async () => {
      const response = await apiClient.get<T.Movimiento[]>(`/movimientos/venta/${ventaId}`);
      return response.data;
    },
    enabled: ventaId > 0,
  });
};

export const useRegistrarAjuste = () => {
  const queryClient = useQueryClient();
  return useMutation<T.Movimiento, Error, T.MovimientoAjuste>({
    mutationFn: async (newAjuste) => {
      const response = await apiClient.post<T.Movimiento>('/movimientos/ajuste', newAjuste);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['movimientos'] });
      queryClient.invalidateQueries({ queryKey: ['movimientosVenta', data.ventaId] });
      queryClient.invalidateQueries({ queryKey: ['venta', data.ventaId] });
      queryClient.invalidateQueries({ queryKey: ['ventas'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardResumen'] });
    },
  });
};

// ==========================================
// RECORDATORIOS
// ==========================================
export interface RecordatoriosFilters {
  estatus?: string;
  canal?: string;
  fechaDesde?: string;
}

export const useRecordatorios = (filters: RecordatoriosFilters = {}) => {
  return useQuery<T.Recordatorio[]>({
    queryKey: ['recordatorios', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.estatus) params.append('estatus', filters.estatus);
      if (filters.canal) params.append('canal', filters.canal);
      if (filters.fechaDesde) params.append('fechaDesde', filters.fechaDesde);

      const response = await apiClient.get<T.Recordatorio[]>(`/recordatorios?${params.toString()}`);
      return response.data;
    },
  });
};

export const useGenerarRecordatorios = () => {
  const queryClient = useQueryClient();
  return useMutation<T.RecordatorioGenerarResult, Error, void>({
    mutationFn: async () => {
      const response = await apiClient.post<T.RecordatorioGenerarResult>('/recordatorios/generar');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recordatorios'] });
    },
  });
};

export const useEnviarRecordatorioCorreo = () => {
  const queryClient = useQueryClient();
  return useMutation<{ mensaje: string }, Error, number>({
    mutationFn: async (id) => {
      const response = await apiClient.post<{ mensaje: string }>(`/recordatorios/${id}/enviar-correo`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recordatorios'] });
    },
  });
};

export const useMarcarRecordatorioEnviado = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: async (id) => {
      await apiClient.put(`/recordatorios/${id}/marcar-enviado`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recordatorios'] });
    },
  });
};
