using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace CarteraClientes.Infrastructure.Persistencia.Migrations
{
    /// <inheritdoc />
    public partial class InitialPostgresCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Clientes",
                columns: table => new
                {
                    ClienteId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "character varying(100)", unicode: false, maxLength: 100, nullable: false),
                    ApellidoPaterno = table.Column<string>(type: "character varying(80)", unicode: false, maxLength: 80, nullable: true),
                    ApellidoMaterno = table.Column<string>(type: "character varying(80)", unicode: false, maxLength: 80, nullable: true),
                    Telefono = table.Column<string>(type: "character varying(20)", unicode: false, maxLength: 20, nullable: true),
                    Correo = table.Column<string>(type: "character varying(150)", unicode: false, maxLength: 150, nullable: true),
                    Direccion = table.Column<string>(type: "character varying(250)", unicode: false, maxLength: 250, nullable: true),
                    FechaRegistro = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    Activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Clientes", x => x.ClienteId);
                });

            migrationBuilder.CreateTable(
                name: "Ventas",
                columns: table => new
                {
                    VentaId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ClienteId = table.Column<int>(type: "integer", nullable: false),
                    DescripcionProducto = table.Column<string>(type: "character varying(250)", unicode: false, maxLength: 250, nullable: false),
                    Cantidad = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                    PrecioUnitario = table.Column<decimal>(type: "numeric(12,2)", nullable: false),
                    MontoTotal = table.Column<decimal>(type: "numeric(12,2)", nullable: false),
                    FechaInicioDeuda = table.Column<DateTime>(type: "date", nullable: false),
                    FechaLimitePago = table.Column<DateTime>(type: "date", nullable: true),
                    Observaciones = table.Column<string>(type: "character varying(500)", unicode: false, maxLength: 500, nullable: true),
                    Estatus = table.Column<string>(type: "character varying(20)", unicode: false, maxLength: 20, nullable: false, defaultValue: "PENDIENTE"),
                    FechaRegistro = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Ventas", x => x.VentaId);
                    table.ForeignKey(
                        name: "FK_Ventas_Clientes_ClienteId",
                        column: x => x.ClienteId,
                        principalTable: "Clientes",
                        principalColumn: "ClienteId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Movimientos",
                columns: table => new
                {
                    MovimientoId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    VentaId = table.Column<int>(type: "integer", nullable: false),
                    TipoMovimiento = table.Column<string>(type: "character varying(20)", unicode: false, maxLength: 20, nullable: false),
                    Monto = table.Column<decimal>(type: "numeric(12,2)", nullable: false),
                    FechaMovimiento = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    Descripcion = table.Column<string>(type: "character varying(250)", unicode: false, maxLength: 250, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Movimientos", x => x.MovimientoId);
                    table.ForeignKey(
                        name: "FK_Movimientos_Ventas_VentaId",
                        column: x => x.VentaId,
                        principalTable: "Ventas",
                        principalColumn: "VentaId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Pagos",
                columns: table => new
                {
                    PagoId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    VentaId = table.Column<int>(type: "integer", nullable: false),
                    MontoPago = table.Column<decimal>(type: "numeric(12,2)", nullable: false),
                    FechaPago = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    FormaPago = table.Column<string>(type: "character varying(30)", unicode: false, maxLength: 30, nullable: true),
                    Referencia = table.Column<string>(type: "character varying(100)", unicode: false, maxLength: 100, nullable: true),
                    Observaciones = table.Column<string>(type: "character varying(250)", unicode: false, maxLength: 250, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Pagos", x => x.PagoId);
                    table.ForeignKey(
                        name: "FK_Pagos_Ventas_VentaId",
                        column: x => x.VentaId,
                        principalTable: "Ventas",
                        principalColumn: "VentaId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.InsertData(
                table: "Clientes",
                columns: new[] { "ClienteId", "Activo", "ApellidoMaterno", "ApellidoPaterno", "Correo", "Direccion", "FechaRegistro", "Nombre", "Telefono" },
                values: new object[] { 1, true, "López", "Pérez", "juan.perez@correo.com", "León, Guanajuato", new DateTime(2026, 7, 13, 11, 0, 0, 0, DateTimeKind.Unspecified), "Juan", "4771234567" });

            migrationBuilder.InsertData(
                table: "Ventas",
                columns: new[] { "VentaId", "Cantidad", "ClienteId", "DescripcionProducto", "FechaInicioDeuda", "FechaLimitePago", "FechaRegistro", "MontoTotal", "Observaciones", "PrecioUnitario" },
                values: new object[] { 1, 1, 1, "Par de zapatos deportivos talla 27", new DateTime(2026, 7, 13, 0, 0, 0, 0, DateTimeKind.Unspecified), new DateTime(2026, 8, 12, 0, 0, 0, 0, DateTimeKind.Unspecified), new DateTime(2026, 7, 13, 11, 0, 0, 0, DateTimeKind.Unspecified), 1500.00m, "Venta a crédito", 1500.00m });

            migrationBuilder.InsertData(
                table: "Movimientos",
                columns: new[] { "MovimientoId", "Descripcion", "FechaMovimiento", "Monto", "TipoMovimiento", "VentaId" },
                values: new object[,]
                {
                    { 1, "Cargo inicial por venta de producto", new DateTime(2026, 7, 13, 11, 0, 0, 0, DateTimeKind.Unspecified), 1500.00m, "CARGO", 1 },
                    { 2, "Pago realizado por el cliente", new DateTime(2026, 7, 13, 11, 5, 0, 0, DateTimeKind.Unspecified), 500.00m, "ABONO", 1 }
                });

            migrationBuilder.InsertData(
                table: "Pagos",
                columns: new[] { "PagoId", "FechaPago", "FormaPago", "MontoPago", "Observaciones", "Referencia", "VentaId" },
                values: new object[] { 1, new DateTime(2026, 7, 13, 11, 5, 0, 0, DateTimeKind.Unspecified), "EFECTIVO", 500.00m, "Primer abono", null, 1 });

            migrationBuilder.CreateIndex(
                name: "IX_Movimientos_VentaId",
                table: "Movimientos",
                column: "VentaId");

            migrationBuilder.CreateIndex(
                name: "IX_Pagos_VentaId",
                table: "Pagos",
                column: "VentaId");

            migrationBuilder.CreateIndex(
                name: "IX_Ventas_ClienteId",
                table: "Ventas",
                column: "ClienteId");

            // Custom raw SQL to create PostgreSQL View
            migrationBuilder.Sql(@"
CREATE OR REPLACE VIEW ""Vw_CarteraClientes"" AS
SELECT
    v.""VentaId"",
    c.""ClienteId"",
    TRIM(CONCAT(
        c.""Nombre"", ' ',
        COALESCE(c.""ApellidoPaterno"", ''), ' ',
        COALESCE(c.""ApellidoMaterno"", '')
    )) AS ""NombreCliente"",
    c.""Telefono"",
    c.""Correo"",
    v.""DescripcionProducto"",
    v.""Cantidad"",
    v.""PrecioUnitario"",
    v.""MontoTotal"" AS ""DeudaInicial"",
    v.""FechaInicioDeuda"",
    v.""FechaLimitePago"",
    COALESCE(p.""TotalPagado"", 0) AS ""TotalPagado"",
    (v.""MontoTotal"" - COALESCE(p.""TotalPagado"", 0)) AS ""SaldoPendiente"",
    v.""Estatus"",
    v.""Observaciones""
FROM ""Ventas"" v
INNER JOIN ""Clientes"" c ON c.""ClienteId"" = v.""ClienteId""
LEFT JOIN (
    SELECT
        ""VentaId"",
        SUM(""MontoPago"") AS ""TotalPagado""
    FROM ""Pagos""
    GROUP BY ""VentaId""
) p ON p.""VentaId"" = v.""VentaId"";
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP VIEW IF EXISTS \"Vw_CarteraClientes\";");

            migrationBuilder.DropTable(
                name: "Movimientos");

            migrationBuilder.DropTable(
                name: "Pagos");

            migrationBuilder.DropTable(
                name: "Ventas");

            migrationBuilder.DropTable(
                name: "Clientes");
        }
    }
}
