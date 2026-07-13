using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CarteraClientes.Domain.Entities;

namespace CarteraClientes.Domain.Repositories;

public interface IPagoRepository
{
    Task<Pago?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IEnumerable<Pago>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<Pago>> GetByVentaIdAsync(int ventaId, CancellationToken cancellationToken = default);
    Task AddAsync(Pago pago, CancellationToken cancellationToken = default);
}
