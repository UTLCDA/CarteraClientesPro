using System;

namespace CarteraClientes.Application.DTOs;

public class PagoDto
{
    public int PagoId { get; set; }
    public int VentaId { get; set; }
    public string DescripcionProducto { get; set; } = string.Empty;
    public string NombreCliente { get; set; } = string.Empty;
    public decimal MontoPago { get; set; }
    public DateTime FechaPago { get; set; }
    public string? FormaPago { get; set; }
    public string? Referencia { get; set; }
    public string? Observaciones { get; set; }
}

public class PagoCreateDto
{
    public int VentaId { get; set; }
    public decimal MontoPago { get; set; }
    public DateTime FechaPago { get; set; } = DateTime.Now;
    public string? FormaPago { get; set; }
    public string? Referencia { get; set; }
    public string? Observaciones { get; set; }
}
