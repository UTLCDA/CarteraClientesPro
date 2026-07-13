using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using CarteraClientes.Application.DTOs;
using CarteraClientes.Application.Services;

namespace CarteraClientes.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet("resumen")]
    public async Task<ActionResult<DashboardResumenDto>> GetResumen(CancellationToken cancellationToken)
    {
        var resumen = await _dashboardService.GetResumenGeneralAsync(cancellationToken);
        return Ok(resumen);
    }
}
