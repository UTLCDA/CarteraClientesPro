using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CarteraClientes.Application.DTOs;

namespace CarteraClientes.Application.Services;

public interface IPagoService
{
    Task<PagoDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IEnumerable<PagoDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<PagoDto>> GetByVentaIdAsync(int ventaId, CancellationToken cancellationToken = default);
    Task<PagoDto> CreateAsync(PagoCreateDto dto, CancellationToken cancellationToken = default);
}
