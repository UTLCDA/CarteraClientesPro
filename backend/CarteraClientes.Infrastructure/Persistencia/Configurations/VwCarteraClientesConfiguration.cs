using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using CarteraClientes.Domain.Entities;

namespace CarteraClientes.Infrastructure.Persistencia.Configurations;

public class VwCarteraClientesConfiguration : IEntityTypeConfiguration<VwCarteraClientes>
{
    public void Configure(EntityTypeBuilder<VwCarteraClientes> builder)
    {
        builder.ToView("Vw_CarteraClientes");
        builder.HasNoKey();

        builder.Property(v => v.NombreCliente)
            .IsUnicode(false);

        builder.Property(v => v.Telefono)
            .IsUnicode(false);

        builder.Property(v => v.Correo)
            .IsUnicode(false);

        builder.Property(v => v.DescripcionProducto)
            .IsUnicode(false);

        builder.Property(v => v.PrecioUnitario)
            .HasColumnType("decimal(12,2)");

        builder.Property(v => v.DeudaInicial)
            .HasColumnType("decimal(12,2)");

        builder.Property(v => v.FechaInicioDeuda)
            .HasColumnType("date");

        builder.Property(v => v.FechaLimitePago)
            .HasColumnType("date");

        builder.Property(v => v.TotalPagado)
            .HasColumnType("decimal(12,2)");

        builder.Property(v => v.SaldoPendiente)
            .HasColumnType("decimal(12,2)");

        builder.Property(v => v.Estatus)
            .IsUnicode(false);

        builder.Property(v => v.Observaciones)
            .IsUnicode(false);
    }
}
