using System;

namespace CarteraClientes.Application.DTOs;

public class ProgramacionRecordatorioDto
{
    public int ProgramacionRecordatorioId { get; set; }
    public int ClienteId { get; set; }
    public string NombreCliente { get; set; } = string.Empty;
    public int VentaId { get; set; }
    public string DescripcionProducto { get; set; } = string.Empty;
    public string TipoCanal { get; set; } = string.Empty;
    public string Frecuencia { get; set; } = string.Empty;
    public string? DiaSemana { get; set; }
    public string HoraEjecucion { get; set; } = string.Empty;
    public DateTime? FechaHoraEjecucion { get; set; }
    public bool Activo { get; set; }
    public string? MensajePersonalizado { get; set; }
    public DateTime? FechaUltimaEjecucion { get; set; }
}

public class ProgramacionRecordatorioCreateUpdateDto
{
    public int ClienteId { get; set; }
    public int VentaId { get; set; }
    public string TipoCanal { get; set; } = "WHATSAPP"; // WHATSAPP, CORREO, AMBOS
    public string Frecuencia { get; set; } = "SEMANAL"; // UNICA, DIARIA, SEMANAL
    public string? DiaSemana { get; set; } // LUNES, MARTES, etc.
    public string HoraEjecucion { get; set; } = "09:00";
    public DateTime? FechaHoraEjecucion { get; set; }
    public bool Activo { get; set; } = true;
    public string? MensajePersonalizado { get; set; }
}
