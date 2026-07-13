using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using CarteraClientes.Application.DTOs;
using CarteraClientes.Application.Services;

namespace CarteraClientes.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ClientesController : ControllerBase
{
    private readonly IClienteService _clienteService;

    public ClientesController(IClienteService clienteService)
    {
        _clienteService = clienteService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ClienteDto>>> GetAll(CancellationToken cancellationToken)
    {
        var clientes = await _clienteService.GetAllAsync(cancellationToken);
        return Ok(clientes);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ClienteDto>> GetById(int id, CancellationToken cancellationToken)
    {
        var cliente = await _clienteService.GetByIdAsync(id, cancellationToken);
        if (cliente == null)
        {
            return NotFound(new { mensaje = $"Cliente con ID {id} no encontrado." });
        }
        return Ok(cliente);
    }

    [HttpGet("buscar")]
    public async Task<ActionResult<IEnumerable<ClienteDto>>> Buscar([FromQuery] string? texto, CancellationToken cancellationToken)
    {
        var clientes = await _clienteService.BuscarAsync(texto ?? string.Empty, cancellationToken);
        return Ok(clientes);
    }

    [HttpPost]
    public async Task<ActionResult<ClienteDto>> Create(ClienteCreateUpdateDto dto, CancellationToken cancellationToken)
    {
        var cliente = await _clienteService.CreateAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = cliente.ClienteId }, cliente);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<ClienteDto>> Update(int id, ClienteCreateUpdateDto dto, CancellationToken cancellationToken)
    {
        var cliente = await _clienteService.UpdateAsync(id, dto, cancellationToken);
        if (cliente == null)
        {
            return NotFound(new { mensaje = $"Cliente con ID {id} no encontrado." });
        }
        return Ok(cliente);
    }

    [HttpPatch("{id:int}/estatus")]
    public async Task<IActionResult> UpdateEstatus(int id, [FromBody] bool activo, CancellationToken cancellationToken)
    {
        var success = await _clienteService.UpdateEstatusAsync(id, activo, cancellationToken);
        if (!success)
        {
            return NotFound(new { mensaje = $"Cliente con ID {id} no encontrado." });
        }
        return NoContent();
    }

    [HttpGet("{id:int}/resumen")]
    public async Task<ActionResult<ClienteResumenDto>> GetResumen(int id, CancellationToken cancellationToken)
    {
        var resumen = await _clienteService.GetResumenAsync(id, cancellationToken);
        if (resumen == null)
        {
            return NotFound(new { mensaje = $"Cliente con ID {id} no encontrado." });
        }
        return Ok(resumen);
    }
}
