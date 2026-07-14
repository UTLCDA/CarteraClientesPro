using System;
using System.Collections.Generic;
using CarteraClientes.Domain.Enums;

namespace CarteraClientes.Domain.Entities;

public class Venta
{
    public int VentaId { get; set; }
    public int ClienteId { get; set; }
    public string DescripcionProducto { get; set; } = string.Empty;
    public int Cantidad { get; set; } = 1;
    public decimal PrecioUnitario { get; set; }
    public decimal MontoTotal { get; set; }
    public DateTime FechaInicioDeuda { get; set; }
    public DateTime? FechaLimitePago { get; set; }
    public string? Observaciones { get; set; }
    public EstatusVenta Estatus { get; set; } = EstatusVenta.PENDIENTE;
    public DateTime FechaRegistro { get; set; } = DateTime.Now;

    // Navigation properties
    public Cliente? Cliente { get; set; }
    public ICollection<Pago> Pagos { get; set; } = new List<Pago>();
    public ICollection<Movimiento> Movimientos { get; set; } = new List<Movimiento>();
    public ICollection<Recordatorio> Recordatorios { get; set; } = new List<Recordatorio>();
}
