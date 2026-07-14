using System;

namespace CarteraClientes.Application.DTOs;

public class RecordatorioDto
{
    public int RecordatorioId { get; set; }
    public int ClienteId { get; set; }
    public string NombreCliente { get; set; } = string.Empty;
    public string TelefonoCliente { get; set; } = string.Empty;
    public string CorreoCliente { get; set; } = string.Empty;
    public int VentaId { get; set; }
    public string DescripcionProducto { get; set; } = string.Empty;
    public string Mensaje { get; set; } = string.Empty;
    public DateTime FechaCreacion { get; set; }
    public DateTime? FechaEnvio { get; set; }
    public string Estatus { get; set; } = string.Empty;
    public string Canal { get; set; } = string.Empty;
}

public class RecordatorioGenerarResultDto
{
    public int TotalGenerados { get; set; }
    public int TotalSaltados { get; set; }
}
