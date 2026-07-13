using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CarteraClientes.Application.DTOs;

namespace CarteraClientes.Application.Services;

public interface IVentaService
{
    Task<VentaDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IEnumerable<VentaDto>> GetAllAsync(
        int? clienteId,
        string? estatus,
        DateTime? fechaInicio,
        DateTime? fechaFin,
        string? productoText,
        CancellationToken cancellationToken = default);
    Task<IEnumerable<VentaDto>> GetByClienteIdAsync(int clienteId, CancellationToken cancellationToken = default);
    Task<IEnumerable<VentaDto>> GetPendientesAsync(CancellationToken cancellationToken = default);
    Task<VentaDto> CreateAsync(VentaCreateDto dto, CancellationToken cancellationToken = default);
    Task<VentaDto?> UpdateAsync(int id, VentaCreateDto dto, CancellationToken cancellationToken = default);
    Task<bool> CancelarAsync(int id, CancellationToken cancellationToken = default);
    Task<decimal?> GetSaldoAsync(int id, CancellationToken cancellationToken = default);
}
