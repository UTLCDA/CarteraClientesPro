using System;

namespace CarteraClientes.Application.DTOs;

public class ClienteDto
{
    public int ClienteId { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string? ApellidoPaterno { get; set; }
    public string? ApellidoMaterno { get; set; }
    public string? Telefono { get; set; }
    public string? Correo { get; set; }
    public string? Direccion { get; set; }
    public DateTime FechaRegistro { get; set; }
    public bool Activo { get; set; }
    public decimal SaldoTotalPendiente { get; set; }
}

public class ClienteCreateUpdateDto
{
    public string Nombre { get; set; } = string.Empty;
    public string? ApellidoPaterno { get; set; }
    public string? ApellidoMaterno { get; set; }
    public string? Telefono { get; set; }
    public string? Correo { get; set; }
    public string? Direccion { get; set; }
}

public class ClienteResumenDto
{
    public ClienteDto Cliente { get; set; } = null!;
    public int TotalVentas { get; set; }
    public decimal TotalVendido { get; set; }
    public decimal TotalPagado { get; set; }
    public decimal SaldoTotalPendiente { get; set; }
    public int CantidadVentasPendientes { get; set; }
}
