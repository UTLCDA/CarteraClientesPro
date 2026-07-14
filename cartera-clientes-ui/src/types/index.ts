export interface Cliente {
  clienteId: number;
  nombre: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  telefono?: string;
  correo?: string;
  direccion?: string;
  fechaRegistro: string;
  activo: boolean;
  saldoTotalPendiente: number;
}

export interface ClienteCreateUpdate {
  nombre: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  telefono?: string;
  correo?: string;
  direccion?: string;
}

export interface ClienteResumen {
  cliente: Cliente;
  totalVentas: number;
  totalVendido: number;
  totalPagado: number;
  saldoTotalPendiente: number;
  cantidadVentasPendientes: number;
}

export interface Venta {
  ventaId: number;
  clienteId: number;
  nombreCliente: string;
  descripcionProducto: string;
  cantidad: number;
  precioUnitario: number;
  montoTotal: number;
  fechaInicioDeuda: string;
  fechaLimitePago?: string;
  observaciones?: string;
  estatus: 'PENDIENTE' | 'PAGADO' | 'CANCELADO';
  fechaRegistro: string;
  totalPagado: number;
  saldoPendiente: number;
}

export interface VentaCreate {
  clienteId: number;
  descripcionProducto: string;
  cantidad: number;
  precioUnitario: number;
  fechaInicioDeuda: string;
  fechaLimitePago?: string;
  observaciones?: string;
}

export interface Pago {
  pagoId: number;
  ventaId: number;
  descripcionProducto: string;
  nombreCliente: string;
  montoPago: number;
  fechaPago: string;
  formaPago?: string;
  referencia?: string;
  observaciones?: string;
}

export interface PagoCreate {
  ventaId: number;
  montoPago: number;
  fechaPago: string;
  formaPago?: string;
  referencia?: string;
  observaciones?: string;
}

export interface Movimiento {
  movimientoId: number;
  ventaId: number;
  tipoMovimiento: 'CARGO' | 'ABONO' | 'AJUSTE';
  monto: number;
  fechaMovimiento: string;
  descripcion?: string;
}

export interface MovimientoAjuste {
  ventaId: number;
  monto: number;
  descripcion: string;
}

export interface DashboardResumen {
  totalClientesActivos: number;
  totalVendido: number;
  totalPagado: number;
  saldoTotalPendiente: number;
  cantidadVentasPendientes: number;
  cantidadVentasVencidas: number;
  ultimasVentas: Venta[];
  pagosRecientes: Pago[];
  clientesMayorSaldo: Cliente[];
}

export interface Recordatorio {
  recordatorioId: number;
  clienteId: number;
  nombreCliente: string;
  telefonoCliente: string;
  correoCliente: string;
  ventaId: number;
  descripcionProducto: string;
  mensaje: string;
  fechaCreacion: string;
  fechaProgramada?: string;
  fechaEnvio?: string;
  estatus: 'PENDIENTE' | 'ENVIADO' | 'FALLIDO';
  canal: 'WHATSAPP' | 'CORREO' | 'AMBOS';
}

export interface RecordatorioGenerarResult {
  totalGenerados: number;
  totalSaltados: number;
}

export interface ProgramacionRecordatorio {
  programacionRecordatorioId: number;
  clienteId: number;
  nombreCliente: string;
  ventaId: number;
  descripcionProducto: string;
  tipoCanal: 'WHATSAPP' | 'CORREO' | 'AMBOS';
  frecuencia: 'UNICA' | 'DIARIA' | 'SEMANAL';
  diaSemana?: string;
  horaEjecucion: string;
  fechaHoraEjecucion?: string;
  activo: boolean;
  mensajePersonalizado?: string;
  fechaUltimaEjecucion?: string;
}

export interface ProgramacionRecordatorioCreateUpdate {
  clienteId: number;
  ventaId: number;
  tipoCanal: 'WHATSAPP' | 'CORREO' | 'AMBOS';
  frecuencia: 'UNICA' | 'DIARIA' | 'SEMANAL';
  diaSemana?: string;
  horaEjecucion: string;
  fechaHoraEjecucion?: string;
  activo: boolean;
  mensajePersonalizado?: string;
}
