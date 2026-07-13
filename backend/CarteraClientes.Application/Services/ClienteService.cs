using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CarteraClientes.Application.DTOs;
using CarteraClientes.Application.Mappers;
using CarteraClientes.Domain.Entities;
using CarteraClientes.Domain.Repositories;

namespace CarteraClientes.Application.Services;

public class ClienteService : IClienteService
{
    private readonly IClienteRepository _clienteRepository;
    private readonly IUnitOfWork _unitOfWork;

    public ClienteService(IClienteRepository clienteRepository, IUnitOfWork unitOfWork)
    {
        _clienteRepository = clienteRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ClienteDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var cliente = await _clienteRepository.GetByIdAsync(id, cancellationToken);
        return cliente?.ToDto();
    }

    public async Task<IEnumerable<ClienteDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var clientes = await _clienteRepository.GetAllAsync(cancellationToken);
        return clientes.Select(c => c.ToDto());
    }

    public async Task<IEnumerable<ClienteDto>> BuscarAsync(string query, CancellationToken cancellationToken = default)
    {
        var clientes = await _clienteRepository.BuscarAsync(query, cancellationToken);
        return clientes.Select(c => c.ToDto());
    }

    public async Task<ClienteDto> CreateAsync(ClienteCreateUpdateDto dto, CancellationToken cancellationToken = default)
    {
        var cliente = dto.ToEntity();
        await _clienteRepository.AddAsync(cliente, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return cliente.ToDto();
    }

    public async Task<ClienteDto?> UpdateAsync(int id, ClienteCreateUpdateDto dto, CancellationToken cancellationToken = default)
    {
        var cliente = await _clienteRepository.GetByIdAsync(id, cancellationToken);
        if (cliente == null) return null;

        dto.UpdateEntity(cliente);
        _clienteRepository.Update(cliente);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return cliente.ToDto();
    }

    public async Task<bool> UpdateEstatusAsync(int id, bool activo, CancellationToken cancellationToken = default)
    {
        var cliente = await _clienteRepository.GetByIdAsync(id, cancellationToken);
        if (cliente == null) return false;

        cliente.Activo = activo;
        _clienteRepository.Update(cliente);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<ClienteResumenDto?> GetResumenAsync(int id, CancellationToken cancellationToken = default)
    {
        var cliente = await _clienteRepository.GetByIdAsync(id, cancellationToken);
        if (cliente == null) return null;

        var dto = cliente.ToDto();
        var totalVentas = cliente.Ventas?.Count ?? 0;
        var totalVendido = cliente.Ventas?.Sum(v => v.MontoTotal) ?? 0;
        var totalPagado = cliente.Ventas?.SelectMany(v => v.Pagos ?? Enumerable.Empty<Pago>()).Sum(p => p.MontoPago) ?? 0;
        var saldoTotalPendiente = totalVendido - totalPagado;
        var ventasPendientes = cliente.Ventas?.Count(v => v.Estatus == Domain.Enums.EstatusVenta.PENDIENTE) ?? 0;

        return new ClienteResumenDto
        {
            Cliente = dto,
            TotalVentas = totalVentas,
            TotalVendido = totalVendido,
            TotalPagado = totalPagado,
            SaldoTotalPendiente = saldoTotalPendiente,
            CantidadVentasPendientes = ventasPendientes
        };
    }
}
