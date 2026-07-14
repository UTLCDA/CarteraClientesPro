using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CarteraClientes.Application.DTOs;

namespace CarteraClientes.Application.Services;

public interface IRecordatorioService
{
    Task<RecordatorioDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IEnumerable<RecordatorioDto>> GetByFiltrosAsync(string? estatus, string? canal, DateTime? fechaDesde, CancellationToken cancellationToken = default);
    Task<RecordatorioGenerarResultDto> GenerarRecordatoriosSemanalesAsync(CancellationToken cancellationToken = default);
    Task<bool> EnviarCorreoAsync(int id, CancellationToken cancellationToken = default);
    Task<bool> MarcarComoEnviadoAsync(int id, CancellationToken cancellationToken = default);
}
