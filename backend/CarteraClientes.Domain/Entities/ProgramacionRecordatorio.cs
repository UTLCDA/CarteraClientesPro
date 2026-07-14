using System;

namespace CarteraClientes.Domain.Entities;

public class ProgramacionRecordatorio
{
    public int ProgramacionRecordatorioId { get; set; }
    public int ClienteId { get; set; }
    public int VentaId { get; set; }
    public string TipoCanal { get; set; } = "WHATSAPP"; // WHATSAPP, CORREO, AMBOS
    public string Frecuencia { get; set; } = "SEMANAL"; // UNICA, DIARIA, SEMANAL
    public string? DiaSemana { get; set; } // LUNES, MARTES, MIERCOLES, JUEVES, VIERNES, SABADO, DOMINGO
    public string HoraEjecucion { get; set; } = "09:00"; // HH:mm format
    public DateTime? FechaHoraEjecucion { get; set; } // For UNICA execution date/time
    public bool Activo { get; set; } = true;
    public string? MensajePersonalizado { get; set; }
    public DateTime? FechaUltimaEjecucion { get; set; }

    // Navigation properties
    public Cliente Cliente { get; set; } = null!;
    public Venta Venta { get; set; } = null!;
}
