using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using CarteraClientes.Domain.Entities;
using CarteraClientes.Domain.Enums;
using CarteraClientes.Domain.Repositories;
using CarteraClientes.Infrastructure.Persistencia;

namespace CarteraClientes.Infrastructure.Repositories;

public class DashboardRepository : IDashboardRepository
{
    private readonly CarteraClientesDbContext _dbContext;

    public DashboardRepository(CarteraClientesDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<int> GetTotalClientesActivosAsync(CancellationToken cancellationToken = default)
    {
        return await _dbContext.Clientes.CountAsync(c => c.Activo, cancellationToken);
    }

    public async Task<decimal> GetTotalVendidoAsync(CancellationToken cancellationToken = default)
    {
        return await _dbContext.Ventas
            .Where(v => v.Estatus != EstatusVenta.CANCELADO)
            .SumAsync(v => v.MontoTotal, cancellationToken);
    }

    public async Task<decimal> GetTotalPagadoAsync(CancellationToken cancellationToken = default)
    {
        return await _dbContext.Pagos
            .Where(p => p.Venta!.Estatus != EstatusVenta.CANCELADO)
            .SumAsync(p => p.MontoPago, cancellationToken);
    }

    public async Task<int> GetCantidadVentasPendientesAsync(CancellationToken cancellationToken = default)
    {
        return await _dbContext.Ventas.CountAsync(v => v.Estatus == EstatusVenta.PENDIENTE, cancellationToken);
    }

    public async Task<int> GetCantidadVentasVencidasAsync(CancellationToken cancellationToken = default)
    {
        var today = DateTime.Today;
        return await _dbContext.Ventas
            .CountAsync(v => v.Estatus == EstatusVenta.PENDIENTE &&
                             v.FechaLimitePago.HasValue &&
                             v.FechaLimitePago.Value < today, cancellationToken);
    }

    public async Task<IEnumerable<Venta>> GetUltimasVentasAsync(int count, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Ventas
            .Include(v => v.Cliente)
            .Include(v => v.Pagos)
            .OrderByDescending(v => v.FechaRegistro)
            .Take(count)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Pago>> GetPagosRecientesAsync(int count, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Pagos
            .Include(p => p.Venta)
            .ThenInclude(v => v!.Cliente)
            .OrderByDescending(p => p.FechaPago)
            .Take(count)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Cliente>> GetClientesMayorSaldoAsync(int count, CancellationToken cancellationToken = default)
    {
        var clients = await _dbContext.Clientes
            .Where(c => c.Activo)
            .Include(c => c.Ventas)
            .ThenInclude(v => v.Pagos)
            .ToListAsync(cancellationToken);

        return clients
            .Select(c => new 
            {
                Cliente = c,
                Saldo = c.Ventas.Sum(v => v.MontoTotal) - c.Ventas.SelectMany(v => v.Pagos).Sum(p => p.MontoPago)
            })
            .OrderByDescending(x => x.Saldo)
            .Take(count)
            .Select(x => x.Cliente)
            .ToList();
    }
}
