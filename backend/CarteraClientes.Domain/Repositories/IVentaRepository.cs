using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CarteraClientes.Domain.Entities;

namespace CarteraClientes.Domain.Repositories;

public interface IVentaRepository
{
    Task<Venta?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IEnumerable<Venta>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<Venta>> GetByClienteIdAsync(int clienteId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Venta>> GetPendientesAsync(CancellationToken cancellationToken = default);
    Task AddAsync(Venta venta, CancellationToken cancellationToken = default);
    void Update(Venta venta);
    Task<decimal> GetSaldoPendienteAsync(int ventaId, CancellationToken cancellationToken = default);
}
