using System;

namespace CarteraClientes.Application.DTOs;

public class MovimientoDto
{
    public int MovimientoId { get; set; }
    public int VentaId { get; set; }
    public string TipoMovimiento { get; set; } = string.Empty;
    public decimal Monto { get; set; }
    public DateTime FechaMovimiento { get; set; }
    public string? Descripcion { get; set; }
}

public class MovimientoAjusteDto
{
    public int VentaId { get; set; }
    public decimal Monto { get; set; }
    public string Descripcion { get; set; } = string.Empty;
}
