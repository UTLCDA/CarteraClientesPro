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
public class RecordatoriosController : ControllerBase
{
    private readonly IRecordatorioService _recordatorioService;

    public RecordatoriosController(IRecordatorioService recordatorioService)
    {
        _recordatorioService = recordatorioService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<RecordatorioDto>>> GetByFiltros(
        [FromQuery] string? estatus,
        [FromQuery] string? canal,
        [FromQuery] DateTime? fechaDesde,
        CancellationToken cancellationToken)
    {
        var recordatorios = await _recordatorioService.GetByFiltrosAsync(estatus, canal, fechaDesde, cancellationToken);
        return Ok(recordatorios);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<RecordatorioDto>> GetById(int id, CancellationToken cancellationToken)
    {
        var recordatorio = await _recordatorioService.GetByIdAsync(id, cancellationToken);
        if (recordatorio == null)
        {
            return NotFound(new { mensaje = $"Recordatorio con ID {id} no encontrado." });
        }
        return Ok(recordatorio);
    }

    [HttpPost("generar")]
    public async Task<ActionResult<RecordatorioGenerarResultDto>> Generar(CancellationToken cancellationToken)
    {
        var result = await _recordatorioService.GenerarRecordatoriosSemanalesAsync(cancellationToken);
        return Ok(result);
    }

    [HttpPost("{id:int}/enviar-correo")]
    public async Task<IActionResult> EnviarCorreo(int id, CancellationToken cancellationToken)
    {
        var success = await _recordatorioService.EnviarCorreoAsync(id, cancellationToken);
        if (!success)
        {
            return BadRequest(new { mensaje = "No se pudo enviar el correo electrónico. Verifique si el cliente tiene una dirección de correo válida configurada o consulte los registros del servidor." });
        }
        return Ok(new { mensaje = "Correo electrónico enviado exitosamente." });
    }

    [HttpPut("{id:int}/marcar-enviado")]
    public async Task<IActionResult> MarcarEnviado(int id, CancellationToken cancellationToken)
    {
        var success = await _recordatorioService.MarcarComoEnviadoAsync(id, cancellationToken);
        if (!success)
        {
            return NotFound(new { mensaje = $"Recordatorio con ID {id} no encontrado." });
        }
        return NoContent();
    }
}
