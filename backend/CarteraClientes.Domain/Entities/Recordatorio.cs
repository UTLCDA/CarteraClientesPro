using System;

namespace CarteraClientes.Domain.Entities;

public class Recordatorio
{
    public int RecordatorioId { get; set; }
    public int ClienteId { get; set; }
    public int VentaId { get; set; }
    public string Mensaje { get; set; } = string.Empty;
    public DateTime FechaCreacion { get; set; } = DateTime.Now;
    public DateTime? FechaProgramada { get; set; }
    public DateTime? FechaEnvio { get; set; }
    public string Estatus { get; set; } = "PENDIENTE"; // PENDIENTE, ENVIADO, FALLIDO
    public string Canal { get; set; } = "WHATSAPP"; // WHATSAPP, CORREO, AMBOS

    // Navigation properties
    public Cliente Cliente { get; set; } = null!;
    public Venta Venta { get; set; } = null!;
}
