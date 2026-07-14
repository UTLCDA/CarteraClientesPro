using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using CarteraClientes.Domain.Entities;
using CarteraClientes.Domain.Repositories;
using CarteraClientes.Infrastructure.Persistencia;

namespace CarteraClientes.Infrastructure.Repositories;

public class RecordatorioRepository : IRecordatorioRepository
{
    private readonly CarteraClientesDbContext _dbContext;

    public RecordatorioRepository(CarteraClientesDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Recordatorio?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Recordatorios
            .Include(r => r.Cliente)
            .Include(r => r.Venta)
            .FirstOrDefaultAsync(r => r.RecordatorioId == id, cancellationToken);
    }

    public async Task<IEnumerable<Recordatorio>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _dbContext.Recordatorios
            .Include(r => r.Cliente)
            .Include(r => r.Venta)
            .OrderByDescending(r => r.FechaCreacion)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Recordatorio>> GetByFiltrosAsync(string? estatus, string? canal, DateTime? fechaDesde, CancellationToken cancellationToken = default)
    {
        var query = _dbContext.Recordatorios
            .Include(r => r.Cliente)
            .Include(r => r.Venta)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(estatus))
        {
            query = query.Where(r => r.Estatus == estatus);
        }

        if (!string.IsNullOrWhiteSpace(canal))
        {
            query = query.Where(r => r.Canal == canal);
        }

        if (fechaDesde.HasValue)
        {
            query = query.Where(r => r.FechaCreacion >= fechaDesde.Value);
        }

        return await query
            .OrderByDescending(r => r.FechaCreacion)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Recordatorio>> GetPendientesEnvioAsync(CancellationToken cancellationToken = default)
    {
        return await _dbContext.Recordatorios
            .Include(r => r.Cliente)
            .Include(r => r.Venta)
            .Where(r => r.Estatus == "PENDIENTE")
            .OrderByDescending(r => r.FechaCreacion)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(Recordatorio recordatorio, CancellationToken cancellationToken = default)
    {
        await _dbContext.Recordatorios.AddAsync(recordatorio, cancellationToken);
    }

    public void Update(Recordatorio recordatorio)
    {
        _dbContext.Recordatorios.Update(recordatorio);
    }
}
