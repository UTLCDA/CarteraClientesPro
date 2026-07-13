using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using CarteraClientes.Domain.Entities;
using CarteraClientes.Domain.Repositories;
using CarteraClientes.Infrastructure.Persistencia;

namespace CarteraClientes.Infrastructure.Repositories;

public class MovimientoRepository : IMovimientoRepository
{
    private readonly CarteraClientesDbContext _dbContext;

    public MovimientoRepository(CarteraClientesDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Movimiento?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Movimientos
            .Include(m => m.Venta)
            .FirstOrDefaultAsync(m => m.MovimientoId == id, cancellationToken);
    }

    public async Task<IEnumerable<Movimiento>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _dbContext.Movimientos
            .Include(m => m.Venta)
            .OrderByDescending(m => m.FechaMovimiento)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Movimiento>> GetByVentaIdAsync(int ventaId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Movimientos
            .Where(m => m.VentaId == ventaId)
            .OrderByDescending(m => m.FechaMovimiento)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(Movimiento movimiento, CancellationToken cancellationToken = default)
    {
        await _dbContext.Movimientos.AddAsync(movimiento, cancellationToken);
    }
}
