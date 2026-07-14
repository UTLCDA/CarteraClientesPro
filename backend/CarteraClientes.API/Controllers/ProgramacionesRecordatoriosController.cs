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
public class ProgramacionesRecordatoriosController : ControllerBase
{
    private readonly IProgramacionRecordatorioService _service;

    public ProgramacionesRecordatoriosController(IProgramacionRecordatorioService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProgramacionRecordatorioDto>>> GetAll(CancellationToken cancellationToken)
    {
        var list = await _service.GetAllAsync(cancellationToken);
        return Ok(list);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProgramacionRecordatorioDto>> GetById(int id, CancellationToken cancellationToken)
    {
        var item = await _service.GetByIdAsync(id, cancellationToken);
        if (item == null)
        {
            return NotFound(new { mensaje = $"Programación con ID {id} no encontrada." });
        }
        return Ok(item);
    }

    [HttpGet("cliente/{clienteId:int}")]
    public async Task<ActionResult<IEnumerable<ProgramacionRecordatorioDto>>> GetByClienteId(int clienteId, CancellationToken cancellationToken)
    {
        var list = await _service.GetByClienteIdAsync(clienteId, cancellationToken);
        return Ok(list);
    }

    [HttpPost]
    public async Task<ActionResult<ProgramacionRecordatorioDto>> Create(ProgramacionRecordatorioCreateUpdateDto dto, CancellationToken cancellationToken)
    {
        var item = await _service.CreateAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = item.ProgramacionRecordatorioId }, item);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<ProgramacionRecordatorioDto>> Update(int id, ProgramacionRecordatorioCreateUpdateDto dto, CancellationToken cancellationToken)
    {
        var item = await _service.UpdateAsync(id, dto, cancellationToken);
        if (item == null)
        {
            return NotFound(new { mensaje = $"Programación con ID {id} no encontrada." });
        }
        return Ok(item);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var success = await _service.DeleteAsync(id, cancellationToken);
        if (!success)
        {
            return NotFound(new { mensaje = $"Programación con ID {id} no encontrada." });
        }
        return NoContent();
    }

    [HttpPatch("{id:int}/activo")]
    public async Task<IActionResult> ToggleActivo(int id, [FromBody] bool activo, CancellationToken cancellationToken)
    {
        var success = await _service.ToggleActivoAsync(id, activo, cancellationToken);
        if (!success)
        {
            return NotFound(new { mensaje = $"Programación con ID {id} no encontrada." });
        }
        return NoContent();
    }
}
