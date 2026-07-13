using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using CarteraClientes.Domain.Entities;

namespace CarteraClientes.Infrastructure.Persistencia.Configurations;

public class ClienteConfiguration : IEntityTypeConfiguration<Cliente>
{
    public void Configure(EntityTypeBuilder<Cliente> builder)
    {
        builder.ToTable("Clientes");

        builder.HasKey(c => c.ClienteId);

        builder.Property(c => c.Nombre)
            .HasMaxLength(100)
            .IsRequired()
            .IsUnicode(false);

        builder.Property(c => c.ApellidoPaterno)
            .HasMaxLength(80)
            .IsUnicode(false);

        builder.Property(c => c.ApellidoMaterno)
            .HasMaxLength(80)
            .IsUnicode(false);

        builder.Property(c => c.Telefono)
            .HasMaxLength(20)
            .IsUnicode(false);

        builder.Property(c => c.Correo)
            .HasMaxLength(150)
            .IsUnicode(false);

        builder.Property(c => c.Direccion)
            .HasMaxLength(250)
            .IsUnicode(false);

        builder.Property(c => c.FechaRegistro)
            .HasDefaultValueSql("CURRENT_TIMESTAMP");

        builder.Property(c => c.Activo)
            .HasDefaultValue(true);
    }
}
