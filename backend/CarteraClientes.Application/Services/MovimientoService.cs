using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CarteraClientes.Application.DTOs;
using CarteraClientes.Application.Mappers;
using CarteraClientes.Domain.Entities;
using CarteraClientes.Domain.Enums;
using CarteraClientes.Domain.Repositories;

namespace CarteraClientes.Application.Services;

public class MovimientoService : IMovimientoService
{
    private readonly IMovimientoRepository _movimientoRepository;
    private readonly IVentaRepository _ventaRepository;
    private readonly IUnitOfWork _unitOfWork;

    public MovimientoService(
        IMovimientoRepository movimientoRepository,
        IVentaRepository ventaRepository,
        IUnitOfWork unitOfWork)
    {
        _movimientoRepository = movimientoRepository;
        _ventaRepository = ventaRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<MovimientoDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var movimientos = await _movimientoRepository.GetAllAsync(cancellationToken);
        return movimientos.Select(m => m.ToDto());
    }

    public async Task<IEnumerable<MovimientoDto>> GetByVentaIdAsync(int ventaId, CancellationToken cancellationToken = default)
    {
        var movimientos = await _movimientoRepository.GetByVentaIdAsync(ventaId, cancellationToken);
        return movimientos.Select(m => m.ToDto());
    }

    public async Task<MovimientoDto> RegistrarAjusteAsync(MovimientoAjusteDto dto, CancellationToken cancellationToken = default)
    {
        var venta = await _ventaRepository.GetByIdAsync(dto.VentaId, cancellationToken);
        if (venta == null)
        {
            throw new KeyNotFoundException($"Venta con ID {dto.VentaId} no encontrada.");
        }

        if (string.IsNullOrWhiteSpace(dto.Descripcion))
        {
            throw new ArgumentException("La descripción del ajuste es obligatoria.");
        }

        if (dto.Monto <= 0)
        {
            throw new ArgumentException("El monto del ajuste debe ser mayor a cero.");
        }

        var movimiento = new Movimiento
        {
            VentaId = dto.VentaId,
            TipoMovimiento = TipoMovimiento.AJUSTE,
            Monto = dto.Monto,
            FechaMovimiento = DateTime.Now,
            Descripcion = dto.Descripcion
        };

        await _movimientoRepository.AddAsync(movimiento, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return movimiento.ToDto();
    }
}
