using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CarteraClientes.Domain.Entities;

namespace CarteraClientes.Domain.Repositories;

public interface IProgramacionRecordatorioRepository
{
    Task<ProgramacionRecordatorio?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IEnumerable<ProgramacionRecordatorio>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<ProgramacionRecordatorio>> GetByClienteIdAsync(int clienteId, CancellationToken cancellationToken = default);
    Task<IEnumerable<ProgramacionRecordatorio>> GetActivasAsync(CancellationToken cancellationToken = default);
    Task AddAsync(ProgramacionRecordatorio programacion, CancellationToken cancellationToken = default);
    void Update(ProgramacionRecordatorio programacion);
    void Remove(ProgramacionRecordatorio programacion);
}
