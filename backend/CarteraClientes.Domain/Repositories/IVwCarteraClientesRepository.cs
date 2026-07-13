using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CarteraClientes.Domain.Entities;

namespace CarteraClientes.Domain.Repositories;

public interface IVwCarteraClientesRepository
{
    Task<IEnumerable<VwCarteraClientes>> GetFilteredAsync(
        int? clienteId,
        string? estatus,
        DateTime? fechaInicio,
        DateTime? fechaFin,
        string? productoText,
        CancellationToken cancellationToken = default);
}
