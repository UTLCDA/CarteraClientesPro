using System;
using System.Linq;
using CarteraClientes.Application.DTOs;
using CarteraClientes.Domain.Entities;

namespace CarteraClientes.Application.Mappers;

public static class MappingExtensions
{
    public static ClienteDto ToDto(this Cliente entity)
    {
        decimal totalVendido = 0;
        decimal totalPagos = 0;

        if (entity.Ventas != null && entity.Ventas.Any())
        {
            totalVendido = entity.Ventas.Sum(v => v.MontoTotal);
            totalPagos = entity.Ventas.SelectMany(v => v.Pagos ?? Enumerable.Empty<Pago>()).Sum(p => p.MontoPago);
        }

        var saldoPendiente = totalVendido - totalPagos;
        
        return new ClienteDto
        {
            ClienteId = entity.ClienteId,
            Nombre = entity.Nombre,
            ApellidoPaterno = entity.ApellidoPaterno,
            ApellidoMaterno = entity.ApellidoMaterno,
            Telefono = entity.Telefono,
            Correo = entity.Correo,
            Direccion = entity.Direccion,
            FechaRegistro = entity.FechaRegistro,
            Activo = entity.Activo,
            SaldoTotalPendiente = saldoPendiente
        };
    }

    public static Cliente ToEntity(this ClienteCreateUpdateDto dto)
    {
        return new Cliente
        {
            Nombre = dto.Nombre,
            ApellidoPaterno = dto.ApellidoPaterno,
            ApellidoMaterno = dto.ApellidoMaterno,
            Telefono = dto.Telefono,
            Correo = dto.Correo,
            Direccion = dto.Direccion
        };
    }

    public static void UpdateEntity(this ClienteCreateUpdateDto dto, Cliente entity)
    {
        entity.Nombre = dto.Nombre;
        entity.ApellidoPaterno = dto.ApellidoPaterno;
        entity.ApellidoMaterno = dto.ApellidoMaterno;
        entity.Telefono = dto.Telefono;
        entity.Correo = dto.Correo;
        entity.Direccion = dto.Direccion;
    }

    public static VentaDto ToDto(this Venta entity)
    {
        var totalPagado = entity.Pagos?.Sum(p => p.MontoPago) ?? 0;
        var saldo = entity.MontoTotal - totalPagado;
        
        return new VentaDto
        {
            VentaId = entity.VentaId,
            ClienteId = entity.ClienteId,
            NombreCliente = entity.Cliente != null 
                ? $"{entity.Cliente.Nombre} {entity.Cliente.ApellidoPaterno} {entity.Cliente.ApellidoMaterno}".Trim()
                : string.Empty,
            DescripcionProducto = entity.DescripcionProducto,
            Cantidad = entity.Cantidad,
            PrecioUnitario = entity.PrecioUnitario,
            MontoTotal = entity.MontoTotal,
            FechaInicioDeuda = entity.FechaInicioDeuda,
            FechaLimitePago = entity.FechaLimitePago,
            Observaciones = entity.Observaciones,
            Estatus = entity.Estatus.ToString(),
            FechaRegistro = entity.FechaRegistro,
            TotalPagado = totalPagado,
            SaldoPendiente = saldo
        };
    }

    public static Venta ToEntity(this VentaCreateDto dto)
    {
        return new Venta
        {
            ClienteId = dto.ClienteId,
            DescripcionProducto = dto.DescripcionProducto,
            Cantidad = dto.Cantidad,
            PrecioUnitario = dto.PrecioUnitario,
            MontoTotal = dto.Cantidad * dto.PrecioUnitario,
            FechaInicioDeuda = dto.FechaInicioDeuda,
            FechaLimitePago = dto.FechaLimitePago,
            Observaciones = dto.Observaciones,
            Estatus = Domain.Enums.EstatusVenta.PENDIENTE
        };
    }

    public static PagoDto ToDto(this Pago entity)
    {
        return new PagoDto
        {
            PagoId = entity.PagoId,
            VentaId = entity.VentaId,
            DescripcionProducto = entity.Venta?.DescripcionProducto ?? string.Empty,
            NombreCliente = entity.Venta?.Cliente != null
                ? $"{entity.Venta.Cliente.Nombre} {entity.Venta.Cliente.ApellidoPaterno} {entity.Venta.Cliente.ApellidoMaterno}".Trim()
                : string.Empty,
            MontoPago = entity.MontoPago,
            FechaPago = entity.FechaPago,
            FormaPago = entity.FormaPago,
            Referencia = entity.Referencia,
            Observaciones = entity.Observaciones
        };
    }

    public static Pago ToEntity(this PagoCreateDto dto)
    {
        return new Pago
        {
            VentaId = dto.VentaId,
            MontoPago = dto.MontoPago,
            FechaPago = dto.FechaPago,
            FormaPago = dto.FormaPago,
            Referencia = dto.Referencia,
            Observaciones = dto.Observaciones
        };
    }

    public static MovimientoDto ToDto(this Movimiento entity)
    {
        return new MovimientoDto
        {
            MovimientoId = entity.MovimientoId,
            VentaId = entity.VentaId,
            TipoMovimiento = entity.TipoMovimiento.ToString(),
            Monto = entity.Monto,
            FechaMovimiento = entity.FechaMovimiento,
            Descripcion = entity.Descripcion
        };
    }
    
    public static VentaDto ToDto(this VwCarteraClientes view)
    {
        return new VentaDto
        {
            VentaId = view.VentaId,
            ClienteId = view.ClienteId,
            NombreCliente = view.NombreCliente,
            DescripcionProducto = view.DescripcionProducto,
            Cantidad = view.Cantidad,
            PrecioUnitario = view.PrecioUnitario,
            MontoTotal = view.DeudaInicial,
            FechaInicioDeuda = view.FechaInicioDeuda,
            FechaLimitePago = view.FechaLimitePago,
            Observaciones = view.Observaciones,
            Estatus = view.Estatus,
            FechaRegistro = view.FechaInicioDeuda,
            TotalPagado = view.TotalPagado,
            SaldoPendiente = view.SaldoPendiente
        };
    }
}
