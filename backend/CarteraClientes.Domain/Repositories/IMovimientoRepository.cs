using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CarteraClientes.Domain.Entities;

namespace CarteraClientes.Domain.Repositories;

public interface IMovimientoRepository
{
    Task<Movimiento?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IEnumerable<Movimiento>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<Movimiento>> GetByVentaIdAsync(int ventaId, CancellationToken cancellationToken = default);
    Task AddAsync(Movimiento movimiento, CancellationToken cancellationToken = default);
}
