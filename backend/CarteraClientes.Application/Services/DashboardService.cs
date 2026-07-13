using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CarteraClientes.Application.DTOs;
using CarteraClientes.Application.Mappers;
using CarteraClientes.Domain.Repositories;

namespace CarteraClientes.Application.Services;

public class DashboardService : IDashboardService
{
    private readonly IDashboardRepository _dashboardRepository;

    public DashboardService(IDashboardRepository dashboardRepository)
    {
        _dashboardRepository = dashboardRepository;
    }

    public async Task<DashboardResumenDto> GetResumenGeneralAsync(CancellationToken cancellationToken = default)
    {
        var totalClientes = await _dashboardRepository.GetTotalClientesActivosAsync(cancellationToken);
        var totalVendido = await _dashboardRepository.GetTotalVendidoAsync(cancellationToken);
        var totalPagado = await _dashboardRepository.GetTotalPagadoAsync(cancellationToken);
        var saldoTotalPendiente = totalVendido - totalPagado;
        var ventasPendientes = await _dashboardRepository.GetCantidadVentasPendientesAsync(cancellationToken);
        var ventasVencidas = await _dashboardRepository.GetCantidadVentasVencidasAsync(cancellationToken);

        var ultimasVentas = await _dashboardRepository.GetUltimasVentasAsync(10, cancellationToken);
        var pagosRecientes = await _dashboardRepository.GetPagosRecientesAsync(10, cancellationToken);
        var clientesMayorSaldo = await _dashboardRepository.GetClientesMayorSaldoAsync(5, cancellationToken);

        return new DashboardResumenDto
        {
            TotalClientesActivos = totalClientes,
            TotalVendido = totalVendido,
            TotalPagado = totalPagado,
            SaldoTotalPendiente = saldoTotalPendiente,
            CantidadVentasPendientes = ventasPendientes,
            CantidadVentasVencidas = ventasVencidas,
            UltimasVentas = ultimasVentas.Select(v => v.ToDto()),
            PagosRecientes = pagosRecientes.Select(p => p.ToDto()),
            ClientesMayorSaldo = clientesMayorSaldo.Select(c => c.ToDto())
        };
    }
}
