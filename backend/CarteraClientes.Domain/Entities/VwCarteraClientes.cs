using System;

namespace CarteraClientes.Domain.Entities;

public class VwCarteraClientes
{
    public int VentaId { get; set; }
    public int ClienteId { get; set; }
    public string NombreCliente { get; set; } = string.Empty;
    public string? Telefono { get; set; }
    public string? Correo { get; set; }
    public string DescripcionProducto { get; set; } = string.Empty;
    public int Cantidad { get; set; }
    public decimal PrecioUnitario { get; set; }
    public decimal DeudaInicial { get; set; }
    public DateTime FechaInicioDeuda { get; set; }
    public DateTime? FechaLimitePago { get; set; }
    public decimal TotalPagado { get; set; }
    public decimal SaldoPendiente { get; set; }
    public string Estatus { get; set; } = string.Empty;
    public string? Observaciones { get; set; }
}
