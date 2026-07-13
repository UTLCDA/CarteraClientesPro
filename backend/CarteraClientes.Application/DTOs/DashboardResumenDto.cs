using System.Collections.Generic;

namespace CarteraClientes.Application.DTOs;

public class DashboardResumenDto
{
    public int TotalClientesActivos { get; set; }
    public decimal TotalVendido { get; set; }
    public decimal TotalPagado { get; set; }
    public decimal SaldoTotalPendiente { get; set; }
    public int CantidadVentasPendientes { get; set; }
    public int CantidadVentasVencidas { get; set; }
    public IEnumerable<VentaDto> UltimasVentas { get; set; } = new List<VentaDto>();
    public IEnumerable<PagoDto> PagosRecientes { get; set; } = new List<PagoDto>();
    public IEnumerable<ClienteDto> ClientesMayorSaldo { get; set; } = new List<ClienteDto>();
}
