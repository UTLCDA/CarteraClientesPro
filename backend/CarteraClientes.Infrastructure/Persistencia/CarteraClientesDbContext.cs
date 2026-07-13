using Microsoft.EntityFrameworkCore;
using CarteraClientes.Domain.Entities;
using CarteraClientes.Infrastructure.Persistencia.Configurations;

namespace CarteraClientes.Infrastructure.Persistencia;

public class CarteraClientesDbContext : DbContext
{
    public CarteraClientesDbContext(DbContextOptions<CarteraClientesDbContext> options)
        : base(options)
    {
        AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);
    }

    public DbSet<Cliente> Clientes => Set<Cliente>();
    public DbSet<Venta> Ventas => Set<Venta>();
    public DbSet<Pago> Pagos => Set<Pago>();
    public DbSet<Movimiento> Movimientos => Set<Movimiento>();
    public DbSet<VwCarteraClientes> VwCarteraClientes => Set<VwCarteraClientes>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfiguration(new ClienteConfiguration());
        modelBuilder.ApplyConfiguration(new VentaConfiguration());
        modelBuilder.ApplyConfiguration(new PagoConfiguration());
        modelBuilder.ApplyConfiguration(new MovimientoConfiguration());
        modelBuilder.ApplyConfiguration(new VwCarteraClientesConfiguration());

        // Semillero de datos (Seed Data)
        modelBuilder.Entity<Cliente>().HasData(
            new Cliente
            {
                ClienteId = 1,
                Nombre = "Juan",
                ApellidoPaterno = "Pérez",
                ApellidoMaterno = "López",
                Telefono = "4771234567",
                Correo = "juan.perez@correo.com",
                Direccion = "León, Guanajuato",
                FechaRegistro = new DateTime(2026, 7, 13, 11, 0, 0),
                Activo = true
            }
        );

        modelBuilder.Entity<Venta>().HasData(
            new Venta
            {
                VentaId = 1,
                ClienteId = 1,
                DescripcionProducto = "Par de zapatos deportivos talla 27",
                Cantidad = 1,
                PrecioUnitario = 1500.00m,
                MontoTotal = 1500.00m,
                FechaInicioDeuda = new DateTime(2026, 7, 13),
                FechaLimitePago = new DateTime(2026, 8, 12),
                Observaciones = "Venta a crédito",
                Estatus = CarteraClientes.Domain.Enums.EstatusVenta.PENDIENTE,
                FechaRegistro = new DateTime(2026, 7, 13, 11, 0, 0)
            }
        );

        modelBuilder.Entity<Pago>().HasData(
            new Pago
            {
                PagoId = 1,
                VentaId = 1,
                MontoPago = 500.00m,
                FechaPago = new DateTime(2026, 7, 13, 11, 5, 0),
                FormaPago = "EFECTIVO",
                Observaciones = "Primer abono"
            }
        );

        modelBuilder.Entity<Movimiento>().HasData(
            new Movimiento
            {
                MovimientoId = 1,
                VentaId = 1,
                TipoMovimiento = CarteraClientes.Domain.Enums.TipoMovimiento.CARGO,
                Monto = 1500.00m,
                FechaMovimiento = new DateTime(2026, 7, 13, 11, 0, 0),
                Descripcion = "Cargo inicial por venta de producto"
            },
            new Movimiento
            {
                MovimientoId = 2,
                VentaId = 1,
                TipoMovimiento = CarteraClientes.Domain.Enums.TipoMovimiento.ABONO,
                Monto = 500.00m,
                FechaMovimiento = new DateTime(2026, 7, 13, 11, 5, 0),
                Descripcion = "Pago realizado por el cliente"
            }
        );
    }
}
