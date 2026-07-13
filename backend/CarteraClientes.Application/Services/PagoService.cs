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

public class PagoService : IPagoService
{
    private readonly IPagoRepository _pagoRepository;
    private readonly IVentaRepository _ventaRepository;
    private readonly IMovimientoRepository _movimientoRepository;
    private readonly IUnitOfWork _unitOfWork;

    public PagoService(
        IPagoRepository pagoRepository,
        IVentaRepository ventaRepository,
        IMovimientoRepository movimientoRepository,
        IUnitOfWork unitOfWork)
    {
        _pagoRepository = pagoRepository;
        _ventaRepository = ventaRepository;
        _movimientoRepository = movimientoRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<PagoDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var pago = await _pagoRepository.GetByIdAsync(id, cancellationToken);
        return pago?.ToDto();
    }

    public async Task<IEnumerable<PagoDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var pagos = await _pagoRepository.GetAllAsync(cancellationToken);
        return pagos.Select(p => p.ToDto());
    }

    public async Task<IEnumerable<PagoDto>> GetByVentaIdAsync(int ventaId, CancellationToken cancellationToken = default)
    {
        var pagos = await _pagoRepository.GetByVentaIdAsync(ventaId, cancellationToken);
        return pagos.Select(p => p.ToDto());
    }

    public async Task<PagoDto> CreateAsync(PagoCreateDto dto, CancellationToken cancellationToken = default)
    {
        var venta = await _ventaRepository.GetByIdAsync(dto.VentaId, cancellationToken);
        if (venta == null)
        {
            throw new KeyNotFoundException($"Venta con ID {dto.VentaId} no encontrada.");
        }

        if (venta.Estatus == EstatusVenta.CANCELADO)
        {
            throw new InvalidOperationException("No se permite registrar pagos en una venta cancelada.");
        }

        if (venta.Estatus == EstatusVenta.PAGADO)
        {
            throw new InvalidOperationException("Esta venta ya ha sido liquidada en su totalidad.");
        }

        var totalPagado = venta.Pagos?.Sum(p => p.MontoPago) ?? 0;
        var saldoPendiente = venta.MontoTotal - totalPagado;

        if (dto.MontoPago > saldoPendiente)
        {
            throw new InvalidOperationException($"El monto del pago (${dto.MontoPago:N2}) no puede ser mayor al saldo pendiente de la venta (${saldoPendiente:N2}).");
        }

        var pago = dto.ToEntity();

        await _unitOfWork.BeginTransactionAsync(cancellationToken);
        try
        {
            await _pagoRepository.AddAsync(pago, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            var abono = new Movimiento
            {
                VentaId = venta.VentaId,
                TipoMovimiento = TipoMovimiento.ABONO,
                Monto = pago.MontoPago,
                FechaMovimiento = pago.FechaPago,
                Descripcion = $"Abono registrado. Pago ID: {pago.PagoId}. Forma: {pago.FormaPago}"
            };

            await _movimientoRepository.AddAsync(abono, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            // Regla: Cuando el saldo pendiente llegue a cero, cambiar a Pagado.
            if (dto.MontoPago == saldoPendiente)
            {
                venta.Estatus = EstatusVenta.PAGADO;
                _ventaRepository.Update(venta);
                await _unitOfWork.SaveChangesAsync(cancellationToken);
            }

            await _unitOfWork.CommitTransactionAsync(cancellationToken);
        }
        catch (Exception)
        {
            await _unitOfWork.RollbackTransactionAsync(cancellationToken);
            throw;
        }

        var createdPago = await _pagoRepository.GetByIdAsync(pago.PagoId, cancellationToken);
        return createdPago!.ToDto();
    }
}
