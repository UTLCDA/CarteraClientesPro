using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using CarteraClientes.Application.DTOs;
using CarteraClientes.Application.Services;

namespace CarteraClientes.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MovimientosController : ControllerBase
{
    private readonly IMovimientoService _movimientoService;

    public MovimientosController(IMovimientoService movimientoService)
    {
        _movimientoService = movimientoService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<MovimientoDto>>> GetAll(CancellationToken cancellationToken)
    {
        var movimientos = await _movimientoService.GetAllAsync(cancellationToken);
        return Ok(movimientos);
    }

    [HttpGet("venta/{ventaId:int}")]
    public async Task<ActionResult<IEnumerable<MovimientoDto>>> GetByVentaId(int ventaId, CancellationToken cancellationToken)
    {
        var movimientos = await _movimientoService.GetByVentaIdAsync(ventaId, cancellationToken);
        return Ok(movimientos);
    }

    [HttpPost("ajuste")]
    public async Task<ActionResult<MovimientoDto>> RegistrarAjuste(MovimientoAjusteDto dto, CancellationToken cancellationToken)
    {
        var movimiento = await _movimientoService.RegistrarAjusteAsync(dto, cancellationToken);
        // Returns 201 Created. We don't have a GetById for movements, but we can return it.
        return StatusCode(201, movimiento);
    }
}
