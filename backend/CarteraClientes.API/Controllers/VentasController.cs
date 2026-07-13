using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using CarteraClientes.Application.DTOs;
using CarteraClientes.Application.Services;

namespace CarteraClientes.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VentasController : ControllerBase
{
    private readonly IVentaService _ventaService;

    public VentasController(IVentaService ventaService)
    {
        _ventaService = ventaService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<VentaDto>>> GetAll(
        [FromQuery] int? clienteId,
        [FromQuery] string? estatus,
        [FromQuery] DateTime? fechaInicio,
        [FromQuery] DateTime? fechaFin,
        [FromQuery] string? productoText,
        CancellationToken cancellationToken)
    {
        var ventas = await _ventaService.GetAllAsync(clienteId, estatus, fechaInicio, fechaFin, productoText, cancellationToken);
        return Ok(ventas);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<VentaDto>> GetById(int id, CancellationToken cancellationToken)
    {
        var venta = await _ventaService.GetByIdAsync(id, cancellationToken);
        if (venta == null)
        {
            return NotFound(new { mensaje = $"Venta con ID {id} no encontrada." });
        }
        return Ok(venta);
    }

    [HttpGet("cliente/{clienteId:int}")]
    public async Task<ActionResult<IEnumerable<VentaDto>>> GetByClienteId(int clienteId, CancellationToken cancellationToken)
    {
        var ventas = await _ventaService.GetByClienteIdAsync(clienteId, cancellationToken);
        return Ok(ventas);
    }

    [HttpGet("pendientes")]
    public async Task<ActionResult<IEnumerable<VentaDto>>> GetPendientes(CancellationToken cancellationToken)
    {
        var ventas = await _ventaService.GetPendientesAsync(cancellationToken);
        return Ok(ventas);
    }

    [HttpPost]
    public async Task<ActionResult<VentaDto>> Create(VentaCreateDto dto, CancellationToken cancellationToken)
    {
        var venta = await _ventaService.CreateAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = venta.VentaId }, venta);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<VentaDto>> Update(int id, VentaCreateDto dto, CancellationToken cancellationToken)
    {
        var venta = await _ventaService.UpdateAsync(id, dto, cancellationToken);
        if (venta == null)
        {
            return NotFound(new { mensaje = $"Venta con ID {id} no encontrada." });
        }
        return Ok(venta);
    }

    [HttpPatch("{id:int}/cancelar")]
    public async Task<IActionResult> Cancelar(int id, CancellationToken cancellationToken)
    {
        var success = await _ventaService.CancelarAsync(id, cancellationToken);
        if (!success)
        {
            return NotFound(new { mensaje = $"Venta con ID {id} no encontrada." });
        }
        return NoContent();
    }

    [HttpGet("{id:int}/saldo")]
    public async Task<ActionResult<decimal>> GetSaldo(int id, CancellationToken cancellationToken)
    {
        var saldo = await _ventaService.GetSaldoAsync(id, cancellationToken);
        if (saldo == null)
        {
            return NotFound(new { mensaje = $"Venta con ID {id} no encontrada." });
        }
        return Ok(new { saldoPendiente = saldo.Value });
    }
}
