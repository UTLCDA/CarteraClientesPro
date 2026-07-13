using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CarteraClientes.Application.DTOs;

namespace CarteraClientes.Application.Services;

public interface IClienteService
{
    Task<ClienteDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IEnumerable<ClienteDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<ClienteDto>> BuscarAsync(string query, CancellationToken cancellationToken = default);
    Task<ClienteDto> CreateAsync(ClienteCreateUpdateDto dto, CancellationToken cancellationToken = default);
    Task<ClienteDto?> UpdateAsync(int id, ClienteCreateUpdateDto dto, CancellationToken cancellationToken = default);
    Task<bool> UpdateEstatusAsync(int id, bool activo, CancellationToken cancellationToken = default);
    Task<ClienteResumenDto?> GetResumenAsync(int id, CancellationToken cancellationToken = default);
}
