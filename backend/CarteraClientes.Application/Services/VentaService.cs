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

public class VentaService : IVentaService
{
    private readonly IVentaRepository _ventaRepository;
    private readonly IVwCarteraClientesRepository _vwCarteraClientesRepository;
    private readonly IMovimientoRepository _movimientoRepository;
    private readonly IUnitOfWork _unitOfWork;

    public VentaService(
        IVentaRepository ventaRepository,
        IVwCarteraClientesRepository vwCarteraClientesRepository,
        IMovimientoRepository movimientoRepository,
        IUnitOfWork unitOfWork)
    {
        _ventaRepository = ventaRepository;
        _vwCarteraClientesRepository = vwCarteraClientesRepository;
        _movimientoRepository = movimientoRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<VentaDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var venta = await _ventaRepository.GetByIdAsync(id, cancellationToken);
        return venta?.ToDto();
    }

    public async Task<IEnumerable<VentaDto>> GetAllAsync(
        int? clienteId,
        string? estatus,
        DateTime? fechaInicio,
        DateTime? fechaFin,
        string? productoText,
        CancellationToken cancellationToken = default)
    {
        // Query through view repository for optimized filters
        var views = await _vwCarteraClientesRepository.GetFilteredAsync(
            clienteId, estatus, fechaInicio, fechaFin, productoText, cancellationToken);
        
        return views.Select(v => v.ToDto());
    }

    public async Task<IEnumerable<VentaDto>> GetByClienteIdAsync(int clienteId, CancellationToken cancellationToken = default)
    {
        var ventas = await _ventaRepository.GetByClienteIdAsync(clienteId, cancellationToken);
        return ventas.Select(v => v.ToDto());
    }

    public async Task<IEnumerable<VentaDto>> GetPendientesAsync(CancellationToken cancellationToken = default)
    {
        var ventas = await _ventaRepository.GetPendientesAsync(cancellationToken);
        return ventas.Select(v => v.ToDto());
    }

    public async Task<VentaDto> CreateAsync(VentaCreateDto dto, CancellationToken cancellationToken = default)
    {
        var venta = dto.ToEntity();

        await _unitOfWork.BeginTransactionAsync(cancellationToken);
        try
        {
            await _ventaRepository.AddAsync(venta, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            var cargo = new Movimiento
            {
                VentaId = venta.VentaId,
                TipoMovimiento = TipoMovimiento.CARGO,
                Monto = venta.MontoTotal,
                FechaMovimiento = DateTime.Now,
                Descripcion = "Cargo inicial por venta de producto"
            };

            await _movimientoRepository.AddAsync(cargo, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            await _unitOfWork.CommitTransactionAsync(cancellationToken);
        }
        catch (Exception)
        {
            await _unitOfWork.RollbackTransactionAsync(cancellationToken);
            throw;
        }

        var createdVenta = await _ventaRepository.GetByIdAsync(venta.VentaId, cancellationToken);
        return createdVenta!.ToDto();
    }

    public async Task<VentaDto?> UpdateAsync(int id, VentaCreateDto dto, CancellationToken cancellationToken = default)
    {
        var venta = await _ventaRepository.GetByIdAsync(id, cancellationToken);
        if (venta == null) return null;

        // Verify if total amount changes
        decimal oldMontoTotal = venta.MontoTotal;
        
        venta.DescripcionProducto = dto.DescripcionProducto;
        venta.Cantidad = dto.Cantidad;
        venta.PrecioUnitario = dto.PrecioUnitario;
        venta.MontoTotal = dto.Cantidad * dto.PrecioUnitario;
        venta.FechaInicioDeuda = dto.FechaInicioDeuda;
        venta.FechaLimitePago = dto.FechaLimitePago;
        venta.Observaciones = dto.Observaciones;

        await _unitOfWork.BeginTransactionAsync(cancellationToken);
        try
        {
            _ventaRepository.Update(venta);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            // If the MontoTotal has changed, we add an AJUSTE movement to keep the balance consistent
            if (venta.MontoTotal != oldMontoTotal)
            {
                var diferencia = venta.MontoTotal - oldMontoTotal;
                var tipoMovimiento = diferencia > 0 ? TipoMovimiento.CARGO : TipoMovimiento.ABONO;
                var montoAjuste = Math.Abs(diferencia);

                var ajuste = new Movimiento
                {
                    VentaId = venta.VentaId,
                    TipoMovimiento = tipoMovimiento,
                    Monto = montoAjuste,
                    FechaMovimiento = DateTime.Now,
                    Descripcion = $"Ajuste automático por modificación del monto total de venta. Anterior: {oldMontoTotal:C2}, Nuevo: {venta.MontoTotal:C2}"
                };

                await _movimientoRepository.AddAsync(ajuste, cancellationToken);
                await _unitOfWork.SaveChangesAsync(cancellationToken);
            }

            // Also check if after the update, the pending balance is 0 and we need to update estatus
            var totalPagado = venta.Pagos?.Sum(p => p.MontoPago) ?? 0;
            var saldo = venta.MontoTotal - totalPagado;
            
            if (saldo <= 0 && venta.Estatus == EstatusVenta.PENDIENTE)
            {
                venta.Estatus = EstatusVenta.PAGADO;
                _ventaRepository.Update(venta);
                await _unitOfWork.SaveChangesAsync(cancellationToken);
            }
            else if (saldo > 0 && venta.Estatus == EstatusVenta.PAGADO)
            {
                venta.Estatus = EstatusVenta.PENDIENTE;
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

        var updatedVenta = await _ventaRepository.GetByIdAsync(venta.VentaId, cancellationToken);
        return updatedVenta?.ToDto();
    }

    public async Task<bool> CancelarAsync(int id, CancellationToken cancellationToken = default)
    {
        var venta = await _ventaRepository.GetByIdAsync(id, cancellationToken);
        if (venta == null) return false;

        venta.Estatus = EstatusVenta.CANCELADO;
        _ventaRepository.Update(venta);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<decimal?> GetSaldoAsync(int id, CancellationToken cancellationToken = default)
    {
        var venta = await _ventaRepository.GetByIdAsync(id, cancellationToken);
        if (venta == null) return null;

        return await _ventaRepository.GetSaldoPendienteAsync(id, cancellationToken);
    }
}
