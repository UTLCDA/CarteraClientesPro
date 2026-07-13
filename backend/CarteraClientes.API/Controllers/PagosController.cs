using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using CarteraClientes.Application.DTOs;
using CarteraClientes.Application.Services;

namespace CarteraClientes.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PagosController : ControllerBase
{
    private readonly IPagoService _pagoService;

    public PagosController(IPagoService pagoService)
    {
        _pagoService = pagoService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<PagoDto>>> GetAll(CancellationToken cancellationToken)
    {
        var pagos = await _pagoService.GetAllAsync(cancellationToken);
        return Ok(pagos);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<PagoDto>> GetById(int id, CancellationToken cancellationToken)
    {
        var pago = await _pagoService.GetByIdAsync(id, cancellationToken);
        if (pago == null)
        {
            return NotFound(new { mensaje = $"Pago con ID {id} no encontrado." });
        }
        return Ok(pago);
    }

    [HttpGet("venta/{ventaId:int}")]
    public async Task<ActionResult<IEnumerable<PagoDto>>> GetByVentaId(int ventaId, CancellationToken cancellationToken)
    {
        var pagos = await _pagoService.GetByVentaIdAsync(ventaId, cancellationToken);
        return Ok(pagos);
    }

    [HttpPost]
    public async Task<ActionResult<PagoDto>> Create(PagoCreateDto dto, CancellationToken cancellationToken)
    {
        var pago = await _pagoService.CreateAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = pago.PagoId }, pago);
    }
}
