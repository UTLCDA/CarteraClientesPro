using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CarteraClientes.Domain.Entities;

namespace CarteraClientes.Domain.Repositories;

public interface IClienteRepository
{
    Task<Cliente?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IEnumerable<Cliente>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<Cliente>> BuscarAsync(string query, CancellationToken cancellationToken = default);
    Task AddAsync(Cliente cliente, CancellationToken cancellationToken = default);
    void Update(Cliente cliente);
    Task<bool> HasVentasAsync(int clienteId, CancellationToken cancellationToken = default);
}
