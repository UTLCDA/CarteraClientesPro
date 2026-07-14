using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace CarteraClientes.Infrastructure.Persistencia.Migrations
{
    /// <inheritdoc />
    public partial class AddRemindersScheduling : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "FechaProgramada",
                table: "Recordatorios",
                type: "timestamp without time zone",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ProgramacionesRecordatorios",
                columns: table => new
                {
                    ProgramacionRecordatorioId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ClienteId = table.Column<int>(type: "integer", nullable: false),
                    VentaId = table.Column<int>(type: "integer", nullable: false),
                    TipoCanal = table.Column<string>(type: "character varying(20)", unicode: false, maxLength: 20, nullable: false, defaultValue: "WHATSAPP"),
                    Frecuencia = table.Column<string>(type: "character varying(20)", unicode: false, maxLength: 20, nullable: false, defaultValue: "SEMANAL"),
                    DiaSemana = table.Column<string>(type: "character varying(15)", unicode: false, maxLength: 15, nullable: true),
                    HoraEjecucion = table.Column<string>(type: "character varying(5)", unicode: false, maxLength: 5, nullable: false, defaultValue: "09:00"),
                    FechaHoraEjecucion = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    Activo = table.Column<bool>(type: "boolean", nullable: false),
                    MensajePersonalizado = table.Column<string>(type: "character varying(500)", unicode: false, maxLength: 500, nullable: true),
                    FechaUltimaEjecucion = table.Column<DateTime>(type: "timestamp without time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProgramacionesRecordatorios", x => x.ProgramacionRecordatorioId);
                    table.ForeignKey(
                        name: "FK_ProgramacionesRecordatorios_Clientes_ClienteId",
                        column: x => x.ClienteId,
                        principalTable: "Clientes",
                        principalColumn: "ClienteId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProgramacionesRecordatorios_Ventas_VentaId",
                        column: x => x.VentaId,
                        principalTable: "Ventas",
                        principalColumn: "VentaId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProgramacionesRecordatorios_ClienteId",
                table: "ProgramacionesRecordatorios",
                column: "ClienteId");

            migrationBuilder.CreateIndex(
                name: "IX_ProgramacionesRecordatorios_VentaId",
                table: "ProgramacionesRecordatorios",
                column: "VentaId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ProgramacionesRecordatorios");

            migrationBuilder.DropColumn(
                name: "FechaProgramada",
                table: "Recordatorios");
        }
    }
}
