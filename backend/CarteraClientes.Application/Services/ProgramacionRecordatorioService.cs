using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CarteraClientes.Application.DTOs;
using CarteraClientes.Domain.Entities;
using CarteraClientes.Domain.Repositories;

namespace CarteraClientes.Application.Services;

public class ProgramacionRecordatorioService : IProgramacionRecordatorioService
{
    private readonly IProgramacionRecordatorioRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public ProgramacionRecordatorioService(
        IProgramacionRecordatorioRepository repository,
        IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ProgramacionRecordatorioDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var item = await _repository.GetByIdAsync(id, cancellationToken);
        if (item == null) return null;
        return MapToDto(item);
    }

    public async Task<IEnumerable<ProgramacionRecordatorioDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var list = await _repository.GetAllAsync(cancellationToken);
        return list.Select(MapToDto);
    }

    public async Task<IEnumerable<ProgramacionRecordatorioDto>> GetByClienteIdAsync(int clienteId, CancellationToken cancellationToken = default)
    {
        var list = await _repository.GetByClienteIdAsync(clienteId, cancellationToken);
        return list.Select(MapToDto);
    }

    public async Task<ProgramacionRecordatorioDto> CreateAsync(ProgramacionRecordatorioCreateUpdateDto dto, CancellationToken cancellationToken = default)
    {
        var item = new ProgramacionRecordatorio
        {
            ClienteId = dto.ClienteId,
            VentaId = dto.VentaId,
            TipoCanal = dto.TipoCanal,
            Frecuencia = dto.Frecuencia,
            DiaSemana = dto.DiaSemana?.ToUpper(),
            HoraEjecucion = dto.HoraEjecucion,
            FechaHoraEjecucion = dto.FechaHoraEjecucion,
            Activo = dto.Activo,
            MensajePersonalizado = dto.MensajePersonalizado
        };

        await _repository.AddAsync(item, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Fetch again to include navigation properties (Cliente/Venta names)
        var createdItem = await _repository.GetByIdAsync(item.ProgramacionRecordatorioId, cancellationToken);
        return MapToDto(createdItem!);
    }

    public async Task<ProgramacionRecordatorioDto?> UpdateAsync(int id, ProgramacionRecordatorioCreateUpdateDto dto, CancellationToken cancellationToken = default)
    {
        var item = await _repository.GetByIdAsync(id, cancellationToken);
        if (item == null) return null;

        item.ClienteId = dto.ClienteId;
        item.VentaId = dto.VentaId;
        item.TipoCanal = dto.TipoCanal;
        item.Frecuencia = dto.Frecuencia;
        item.DiaSemana = dto.DiaSemana?.ToUpper();
        item.HoraEjecucion = dto.HoraEjecucion;
        item.FechaHoraEjecucion = dto.FechaHoraEjecucion;
        item.Activo = dto.Activo;
        item.MensajePersonalizado = dto.MensajePersonalizado;

        _repository.Update(item);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToDto(item);
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var item = await _repository.GetByIdAsync(id, cancellationToken);
        if (item == null) return false;

        _repository.Remove(item);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> ToggleActivoAsync(int id, bool activo, CancellationToken cancellationToken = default)
    {
        var item = await _repository.GetByIdAsync(id, cancellationToken);
        if (item == null) return false;

        item.Activo = activo;
        _repository.Update(item);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }

    private ProgramacionRecordatorioDto MapToDto(ProgramacionRecordatorio pr)
    {
        return new ProgramacionRecordatorioDto
        {
            ProgramacionRecordatorioId = pr.ProgramacionRecordatorioId,
            ClienteId = pr.ClienteId,
            NombreCliente = pr.Cliente != null ? $"{pr.Cliente.Nombre} {pr.Cliente.ApellidoPaterno ?? ""} {pr.Cliente.ApellidoMaterno ?? ""}".Trim() : string.Empty,
            VentaId = pr.VentaId,
            DescripcionProducto = pr.Venta != null ? pr.Venta.DescripcionProducto : string.Empty,
            TipoCanal = pr.TipoCanal,
            Frecuencia = pr.Frecuencia,
            DiaSemana = pr.DiaSemana,
            HoraEjecucion = pr.HoraEjecucion,
            FechaHoraEjecucion = pr.FechaHoraEjecucion,
            Activo = pr.Activo,
            MensajePersonalizado = pr.MensajePersonalizado,
            FechaUltimaEjecucion = pr.FechaUltimaEjecucion
        };
    }
}
