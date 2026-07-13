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

public class VwCarteraClientesRepository : IVwCarteraClientesRepository
{
    private readonly CarteraClientesDbContext _dbContext;

    public VwCarteraClientesRepository(CarteraClientesDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IEnumerable<VwCarteraClientes>> GetFilteredAsync(
        int? clienteId,
        string? estatus,
        DateTime? fechaInicio,
        DateTime? fechaFin,
        string? productoText,
        CancellationToken cancellationToken = default)
    {
        var query = _dbContext.VwCarteraClientes.AsNoTracking().AsQueryable();

        if (clienteId.HasValue)
        {
            query = query.Where(v => v.ClienteId == clienteId.Value);
        }

        if (!string.IsNullOrWhiteSpace(estatus))
        {
            query = query.Where(v => v.Estatus.ToLower() == estatus.Trim().ToLower());
        }

        if (fechaInicio.HasValue)
        {
            query = query.Where(v => v.FechaInicioDeuda >= fechaInicio.Value);
        }

        if (fechaFin.HasValue)
        {
            query = query.Where(v => v.FechaInicioDeuda <= fechaFin.Value);
        }

        if (!string.IsNullOrWhiteSpace(productoText))
        {
            var cleanText = productoText.Trim().ToLower();
            query = query.Where(v => v.DescripcionProducto.ToLower().Contains(cleanText) ||
                                     v.NombreCliente.ToLower().Contains(cleanText));
        }

        return await query.OrderByDescending(v => v.FechaInicioDeuda).ToListAsync(cancellationToken);
    }
}
