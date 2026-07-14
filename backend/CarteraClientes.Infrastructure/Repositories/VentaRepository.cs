using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using CarteraClientes.Domain.Entities;
using CarteraClientes.Domain.Repositories;
using CarteraClientes.Infrastructure.Persistencia;

namespace CarteraClientes.Infrastructure.Repositories;

public class VentaRepository : IVentaRepository
{
    private readonly CarteraClientesDbContext _dbContext;

    public VentaRepository(CarteraClientesDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Venta?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Ventas
            .Include(v => v.Cliente)
            .Include(v => v.Pagos)
            .Include(v => v.Movimientos)
            .FirstOrDefaultAsync(v => v.VentaId == id, cancellationToken);
    }

    public async Task<IEnumerable<Venta>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _dbContext.Ventas
            .Include(v => v.Cliente)
            .Include(v => v.Pagos)
            .OrderByDescending(v => v.FechaInicioDeuda)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Venta>> GetByClienteIdAsync(int clienteId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Ventas
            .Where(v => v.ClienteId == clienteId)
            .Include(v => v.Cliente)
            .Include(v => v.Pagos)
            .OrderByDescending(v => v.FechaInicioDeuda)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Venta>> GetPendientesAsync(CancellationToken cancellationToken = default)
    {
        return await _dbContext.Ventas
            .Where(v => v.Estatus == Domain.Enums.EstatusVenta.PENDIENTE)
            .Include(v => v.Cliente)
            .Include(v => v.Pagos)
            .OrderByDescending(v => v.FechaInicioDeuda)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(Venta venta, CancellationToken cancellationToken = default)
    {
        await _dbContext.Ventas.AddAsync(venta, cancellationToken);
    }

    public void Update(Venta venta)
    {
        _dbContext.Ventas.Update(venta);
    }

    public async Task<decimal> GetSaldoPendienteAsync(int ventaId, CancellationToken cancellationToken = default)
    {
        var venta = await _dbContext.Ventas
            .Include(v => v.Pagos)
            .FirstOrDefaultAsync(v => v.VentaId == ventaId, cancellationToken);

        if (venta == null) return 0;

        var totalPagado = venta.Pagos.Sum(p => p.MontoPago);
        return venta.MontoTotal - totalPagado;
    }
}
