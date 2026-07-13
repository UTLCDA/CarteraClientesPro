using System;

namespace CarteraClientes.Application.DTOs;

public class VentaDto
{
    public int VentaId { get; set; }
    public int ClienteId { get; set; }
    public string NombreCliente { get; set; } = string.Empty;
    public string DescripcionProducto { get; set; } = string.Empty;
    public int Cantidad { get; set; }
    public decimal PrecioUnitario { get; set; }
    public decimal MontoTotal { get; set; }
    public DateTime FechaInicioDeuda { get; set; }
    public DateTime? FechaLimitePago { get; set; }
    public string? Observaciones { get; set; }
    public string Estatus { get; set; } = string.Empty;
    public DateTime FechaRegistro { get; set; }
    public decimal TotalPagado { get; set; }
    public decimal SaldoPendiente { get; set; }
}

public class VentaCreateDto
{
    public int ClienteId { get; set; }
    public string DescripcionProducto { get; set; } = string.Empty;
    public int Cantidad { get; set; }
    public decimal PrecioUnitario { get; set; }
    public DateTime FechaInicioDeuda { get; set; }
    public DateTime? FechaLimitePago { get; set; }
    public string? Observaciones { get; set; }
}
