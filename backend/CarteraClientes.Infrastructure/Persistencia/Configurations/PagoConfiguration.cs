using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using CarteraClientes.Domain.Entities;

namespace CarteraClientes.Infrastructure.Persistencia.Configurations;

public class PagoConfiguration : IEntityTypeConfiguration<Pago>
{
    public void Configure(EntityTypeBuilder<Pago> builder)
    {
        builder.ToTable("Pagos");

        builder.HasKey(p => p.PagoId);

        builder.Property(p => p.MontoPago)
            .HasColumnType("decimal(12,2)");

        builder.Property(p => p.FechaPago)
            .HasColumnType("datetime")
            .HasDefaultValueSql("GETDATE()");

        builder.Property(p => p.FormaPago)
            .HasMaxLength(30)
            .IsUnicode(false);

        builder.Property(p => p.Referencia)
            .HasMaxLength(100)
            .IsUnicode(false);

        builder.Property(p => p.Observaciones)
            .HasMaxLength(250)
            .IsUnicode(false);

        builder.HasOne(p => p.Venta)
            .WithMany(v => v.Pagos)
            .HasForeignKey(p => p.VentaId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
