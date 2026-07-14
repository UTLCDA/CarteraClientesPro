using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using CarteraClientes.Domain.Entities;

namespace CarteraClientes.Infrastructure.Persistencia.Configurations;

public class RecordatorioConfiguration : IEntityTypeConfiguration<Recordatorio>
{
    public void Configure(EntityTypeBuilder<Recordatorio> builder)
    {
        builder.ToTable("Recordatorios");

        builder.HasKey(r => r.RecordatorioId);

        builder.Property(r => r.Mensaje)
            .HasMaxLength(500)
            .IsRequired()
            .IsUnicode(false);

        builder.Property(r => r.FechaCreacion)
            .HasDefaultValueSql("CURRENT_TIMESTAMP");

        builder.Property(r => r.FechaEnvio)
            .IsRequired(false);

        builder.Property(r => r.Estatus)
            .HasMaxLength(20)
            .IsRequired()
            .HasDefaultValue("PENDIENTE")
            .IsUnicode(false);

        builder.Property(r => r.Canal)
            .HasMaxLength(20)
            .IsRequired()
            .HasDefaultValue("WHATSAPP")
            .IsUnicode(false);

        builder.HasOne(r => r.Cliente)
            .WithMany(c => c.Recordatorios)
            .HasForeignKey(r => r.ClienteId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(r => r.Venta)
            .WithMany(v => v.Recordatorios)
            .HasForeignKey(r => r.VentaId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
