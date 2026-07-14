using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CarteraClientes.Domain.Entities;

namespace CarteraClientes.Domain.Repositories;

public interface IRecordatorioRepository
{
    Task<Recordatorio?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IEnumerable<Recordatorio>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<Recordatorio>> GetByFiltrosAsync(int? clienteId, string? estatus, string? canal, DateTime? fechaDesde, CancellationToken cancellationToken = default);
    Task<IEnumerable<Recordatorio>> GetPendientesEnvioAsync(CancellationToken cancellationToken = default);
    Task AddAsync(Recordatorio recordatorio, CancellationToken cancellationToken = default);
    void Update(Recordatorio recordatorio);
}
