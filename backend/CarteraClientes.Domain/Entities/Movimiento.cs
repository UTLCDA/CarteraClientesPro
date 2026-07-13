using System;
using CarteraClientes.Domain.Enums;

namespace CarteraClientes.Domain.Entities;

public class Movimiento
{
    public int MovimientoId { get; set; }
    public int VentaId { get; set; }
    public TipoMovimiento TipoMovimiento { get; set; }
    public decimal Monto { get; set; }
    public DateTime FechaMovimiento { get; set; } = DateTime.Now;
    public string? Descripcion { get; set; }

    // Navigation property
    public Venta? Venta { get; set; }
}
