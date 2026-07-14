using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CarteraClientes.Application.DTOs;

namespace CarteraClientes.Application.Services;

public interface IProgramacionRecordatorioService
{
    Task<ProgramacionRecordatorioDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IEnumerable<ProgramacionRecordatorioDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<ProgramacionRecordatorioDto>> GetByClienteIdAsync(int clienteId, CancellationToken cancellationToken = default);
    Task<ProgramacionRecordatorioDto> CreateAsync(ProgramacionRecordatorioCreateUpdateDto dto, CancellationToken cancellationToken = default);
    Task<ProgramacionRecordatorioDto?> UpdateAsync(int id, ProgramacionRecordatorioCreateUpdateDto dto, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
    Task<bool> ToggleActivoAsync(int id, bool activo, CancellationToken cancellationToken = default);
}
