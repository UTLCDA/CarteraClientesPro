using System.Threading;
using System.Threading.Tasks;
using CarteraClientes.Application.DTOs;

namespace CarteraClientes.Application.Services;

public interface IDashboardService
{
    Task<DashboardResumenDto> GetResumenGeneralAsync(CancellationToken cancellationToken = default);
}
