using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using CarteraClientes.Domain.Entities;
using CarteraClientes.Domain.Enums;
using System;

namespace CarteraClientes.Infrastructure.Persistencia.Configurations;

public class MovimientoConfiguration : IEntityTypeConfiguration<Movimiento>
{
    public void Configure(EntityTypeBuilder<Movimiento> builder)
    {
        builder.ToTable("Movimientos");

        builder.HasKey(m => m.MovimientoId);

        builder.Property(m => m.TipoMovimiento)
            .HasMaxLength(20)
            .HasConversion(
                tm => tm.ToString(),
                tm => (TipoMovimiento)Enum.Parse(typeof(TipoMovimiento), tm)
            )
            .IsUnicode(false);

        builder.Property(m => m.Monto)
            .HasColumnType("decimal(12,2)");

        builder.Property(m => m.FechaMovimiento)
            .HasColumnType("datetime")
            .HasDefaultValueSql("GETDATE()");

        builder.Property(m => m.Descripcion)
            .HasMaxLength(250)
            .IsUnicode(false);

        builder.HasOne(m => m.Venta)
            .WithMany(v => v.Movimientos)
            .HasForeignKey(m => m.VentaId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
