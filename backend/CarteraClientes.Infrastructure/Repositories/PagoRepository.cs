using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using CarteraClientes.Domain.Entities;
using CarteraClientes.Domain.Repositories;
using CarteraClientes.Infrastructure.Persistencia;

namespace CarteraClientes.Infrastructure.Repositories;

public class PagoRepository : IPagoRepository
{
    private readonly CarteraClientesDbContext _dbContext;

    public PagoRepository(CarteraClientesDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Pago?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Pagos
            .Include(p => p.Venta)
            .ThenInclude(v => v!.Cliente)
            .FirstOrDefaultAsync(p => p.PagoId == id, cancellationToken);
    }

    public async Task<IEnumerable<Pago>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _dbContext.Pagos
            .Include(p => p.Venta)
            .ThenInclude(v => v!.Cliente)
            .OrderByDescending(p => p.FechaPago)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Pago>> GetByVentaIdAsync(int ventaId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Pagos
            .Where(p => p.VentaId == ventaId)
            .OrderByDescending(p => p.FechaPago)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(Pago pago, CancellationToken cancellationToken = default)
    {
        await _dbContext.Pagos.AddAsync(pago, cancellationToken);
    }
}
