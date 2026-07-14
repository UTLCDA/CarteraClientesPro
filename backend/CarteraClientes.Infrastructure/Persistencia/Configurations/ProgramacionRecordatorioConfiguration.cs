using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using CarteraClientes.Domain.Entities;

namespace CarteraClientes.Infrastructure.Persistencia.Configurations;

public class ProgramacionRecordatorioConfiguration : IEntityTypeConfiguration<ProgramacionRecordatorio>
{
    public void Configure(EntityTypeBuilder<ProgramacionRecordatorio> builder)
    {
        builder.ToTable("ProgramacionesRecordatorios");

        builder.HasKey(pr => pr.ProgramacionRecordatorioId);

        builder.Property(pr => pr.TipoCanal)
            .HasMaxLength(20)
            .IsRequired()
            .HasDefaultValue("WHATSAPP")
            .IsUnicode(false);

        builder.Property(pr => pr.Frecuencia)
            .HasMaxLength(20)
            .IsRequired()
            .HasDefaultValue("SEMANAL")
            .IsUnicode(false);

        builder.Property(pr => pr.DiaSemana)
            .HasMaxLength(15)
            .IsRequired(false)
            .IsUnicode(false);

        builder.Property(pr => pr.HoraEjecucion)
            .HasMaxLength(5)
            .IsRequired()
            .HasDefaultValue("09:00")
            .IsUnicode(false);

        builder.Property(pr => pr.MensajePersonalizado)
            .HasMaxLength(500)
            .IsRequired(false)
            .IsUnicode(false);

        builder.HasOne(pr => pr.Cliente)
            .WithMany()
            .HasForeignKey(pr => pr.ClienteId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(pr => pr.Venta)
            .WithMany()
            .HasForeignKey(pr => pr.VentaId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
