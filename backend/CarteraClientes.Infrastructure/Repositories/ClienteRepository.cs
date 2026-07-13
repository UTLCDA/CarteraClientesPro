using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using CarteraClientes.Domain.Entities;
using CarteraClientes.Domain.Repositories;
using CarteraClientes.Infrastructure.Persistencia;

namespace CarteraClientes.Infrastructure.Repositories;

public class ClienteRepository : IClienteRepository
{
    private readonly CarteraClientesDbContext _dbContext;

    public ClienteRepository(CarteraClientesDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Cliente?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Clientes
            .Include(c => c.Ventas)
            .FirstOrDefaultAsync(c => c.ClienteId == id, cancellationToken);
    }

    public async Task<IEnumerable<Cliente>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _dbContext.Clientes
            .OrderByDescending(c => c.FechaRegistro)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Cliente>> BuscarAsync(string query, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(query))
        {
            return await GetAllAsync(cancellationToken);
        }

        query = query.Trim().ToLower();

        return await _dbContext.Clientes
            .Where(c => c.Nombre.ToLower().Contains(query) ||
                        (c.ApellidoPaterno != null && c.ApellidoPaterno.ToLower().Contains(query)) ||
                        (c.ApellidoMaterno != null && c.ApellidoMaterno.ToLower().Contains(query)) ||
                        (c.Telefono != null && c.Telefono.Contains(query)) ||
                        (c.Correo != null && c.Correo.ToLower().Contains(query)))
            .OrderByDescending(c => c.FechaRegistro)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(Cliente cliente, CancellationToken cancellationToken = default)
    {
        await _dbContext.Clientes.AddAsync(cliente, cancellationToken);
    }

    public void Update(Cliente cliente)
    {
        _dbContext.Clientes.Update(cliente);
    }

    public async Task<bool> HasVentasAsync(int clienteId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Ventas.AnyAsync(v => v.ClienteId == clienteId, cancellationToken);
    }
}
