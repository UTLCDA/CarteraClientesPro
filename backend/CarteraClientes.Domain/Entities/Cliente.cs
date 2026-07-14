using System;
using System.Collections.Generic;

namespace CarteraClientes.Domain.Entities;

public class Cliente
{
    public int ClienteId { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string? ApellidoPaterno { get; set; }
    public string? ApellidoMaterno { get; set; }
    public string? Telefono { get; set; }
    public string? Correo { get; set; }
    public string? Direccion { get; set; }
    public DateTime FechaRegistro { get; set; } = DateTime.Now;
    public bool Activo { get; set; } = true;

    // Navigation properties
    public ICollection<Venta> Ventas { get; set; } = new List<Venta>();
    public ICollection<Recordatorio> Recordatorios { get; set; } = new List<Recordatorio>();
}
