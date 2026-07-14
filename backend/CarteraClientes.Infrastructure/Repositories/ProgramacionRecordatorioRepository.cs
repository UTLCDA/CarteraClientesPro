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

public class ProgramacionRecordatorioRepository : IProgramacionRecordatorioRepository
{
    private readonly CarteraClientesDbContext _dbContext;

    public ProgramacionRecordatorioRepository(CarteraClientesDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<ProgramacionRecordatorio?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _dbContext.ProgramacionesRecordatorios
            .Include(pr => pr.Cliente)
            .Include(pr => pr.Venta)
            .FirstOrDefaultAsync(pr => pr.ProgramacionRecordatorioId == id, cancellationToken);
    }

    public async Task<IEnumerable<ProgramacionRecordatorio>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _dbContext.ProgramacionesRecordatorios
            .Include(pr => pr.Cliente)
            .Include(pr => pr.Venta)
            .OrderByDescending(pr => pr.ProgramacionRecordatorioId)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<ProgramacionRecordatorio>> GetByClienteIdAsync(int clienteId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.ProgramacionesRecordatorios
            .Include(pr => pr.Cliente)
            .Include(pr => pr.Venta)
            .Where(pr => pr.ClienteId == clienteId)
            .OrderByDescending(pr => pr.ProgramacionRecordatorioId)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<ProgramacionRecordatorio>> GetActivasAsync(CancellationToken cancellationToken = default)
    {
        return await _dbContext.ProgramacionesRecordatorios
            .Include(pr => pr.Cliente)
            .Include(pr => pr.Venta)
            .Where(pr => pr.Activo)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(ProgramacionRecordatorio programacion, CancellationToken cancellationToken = default)
    {
        await _dbContext.ProgramacionesRecordatorios.AddAsync(programacion, cancellationToken);
    }

    public void Update(ProgramacionRecordatorio programacion)
    {
        _dbContext.ProgramacionesRecordatorios.Update(programacion);
    }

    public void Remove(ProgramacionRecordatorio programacion)
    {
        _dbContext.ProgramacionesRecordatorios.Remove(programacion);
    }
}
