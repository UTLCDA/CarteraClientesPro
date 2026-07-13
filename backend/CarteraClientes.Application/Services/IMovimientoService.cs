using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CarteraClientes.Application.DTOs;

namespace CarteraClientes.Application.Services;

public interface IMovimientoService
{
    Task<IEnumerable<MovimientoDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<MovimientoDto>> GetByVentaIdAsync(int ventaId, CancellationToken cancellationToken = default);
    Task<MovimientoDto> RegistrarAjusteAsync(MovimientoAjusteDto dto, CancellationToken cancellationToken = default);
}
