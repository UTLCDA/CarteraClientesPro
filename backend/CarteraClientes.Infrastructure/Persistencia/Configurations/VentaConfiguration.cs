using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using CarteraClientes.Domain.Entities;
using CarteraClientes.Domain.Enums;
using System;

namespace CarteraClientes.Infrastructure.Persistencia.Configurations;

public class VentaConfiguration : IEntityTypeConfiguration<Venta>
{
    public void Configure(EntityTypeBuilder<Venta> builder)
    {
        builder.ToTable("Ventas");

        builder.HasKey(v => v.VentaId);

        builder.Property(v => v.DescripcionProducto)
            .HasMaxLength(250)
            .IsRequired()
            .IsUnicode(false);

        builder.Property(v => v.Cantidad)
            .HasDefaultValue(1);

        builder.Property(v => v.PrecioUnitario)
            .HasColumnType("decimal(12,2)");

        builder.Property(v => v.MontoTotal)
            .HasColumnType("decimal(12,2)");

        builder.Property(v => v.FechaInicioDeuda)
            .HasColumnType("date");

        builder.Property(v => v.FechaLimitePago)
            .HasColumnType("date");

        builder.Property(v => v.Observaciones)
            .HasMaxLength(500)
            .IsUnicode(false);

        builder.Property(v => v.Estatus)
            .HasMaxLength(20)
            .HasConversion(
                v => v.ToString(),
                v => (EstatusVenta)Enum.Parse(typeof(EstatusVenta), v)
            )
            .HasDefaultValue(EstatusVenta.PENDIENTE)
            .IsUnicode(false);

        builder.Property(v => v.FechaRegistro)
            .HasColumnType("datetime")
            .HasDefaultValueSql("GETDATE()");

        builder.HasOne(v => v.Cliente)
            .WithMany(c => c.Ventas)
            .HasForeignKey(v => v.ClienteId)
            .OnDelete(DeleteBehavior.Restrict); // No physical cascading delete to prevent accidental losses
    }
}
