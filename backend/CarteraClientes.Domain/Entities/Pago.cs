using System;

namespace CarteraClientes.Domain.Entities;

public class Pago
{
    public int PagoId { get; set; }
    public int VentaId { get; set; }
    public decimal MontoPago { get; set; }
    public DateTime FechaPago { get; set; } = DateTime.Now;
    public string? FormaPago { get; set; }
    public string? Referencia { get; set; }
    public string? Observaciones { get; set; }

    // Navigation property
    public Venta? Venta { get; set; }
}
