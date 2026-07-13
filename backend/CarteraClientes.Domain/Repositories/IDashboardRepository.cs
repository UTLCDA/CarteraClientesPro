using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CarteraClientes.Domain.Entities;

namespace CarteraClientes.Domain.Repositories;

public interface IDashboardRepository
{
    Task<int> GetTotalClientesActivosAsync(CancellationToken cancellationToken = default);
    Task<decimal> GetTotalVendidoAsync(CancellationToken cancellationToken = default);
    Task<decimal> GetTotalPagadoAsync(CancellationToken cancellationToken = default);
    Task<int> GetCantidadVentasPendientesAsync(CancellationToken cancellationToken = default);
    Task<int> GetCantidadVentasVencidasAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<Venta>> GetUltimasVentasAsync(int count, CancellationToken cancellationToken = default);
    Task<IEnumerable<Pago>> GetPagosRecientesAsync(int count, CancellationToken cancellationToken = default);
    Task<IEnumerable<Cliente>> GetClientesMayorSaldoAsync(int count, CancellationToken cancellationToken = default);
}
