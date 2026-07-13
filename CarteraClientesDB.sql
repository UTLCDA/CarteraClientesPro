/*
    Base de datos: CarteraClientesDB
    Descripción:
    Base de datos sencilla para administrar clientes, ventas a crédito,
    pagos, movimientos y saldos pendientes.

    Motor: Microsoft SQL Server
*/

USE master;
GO

IF DB_ID('CarteraClientesDB') IS NULL
BEGIN
    CREATE DATABASE CarteraClientesDB;
END
GO

USE CarteraClientesDB;
GO

/* =========================================================
   ELIMINACIÓN DE OBJETOS PARA PERMITIR REEJECUCIÓN DEL SCRIPT
   ========================================================= */

IF OBJECT_ID('dbo.Vw_CarteraClientes', 'V') IS NOT NULL
    DROP VIEW dbo.Vw_CarteraClientes;
GO

IF OBJECT_ID('dbo.Pagos', 'U') IS NOT NULL
    DROP TABLE dbo.Pagos;
GO

IF OBJECT_ID('dbo.Movimientos', 'U') IS NOT NULL
    DROP TABLE dbo.Movimientos;
GO

IF OBJECT_ID('dbo.Ventas', 'U') IS NOT NULL
    DROP TABLE dbo.Ventas;
GO

IF OBJECT_ID('dbo.Clientes', 'U') IS NOT NULL
    DROP TABLE dbo.Clientes;
GO

/* =========================================================
   TABLA: CLIENTES
   ========================================================= */

CREATE TABLE dbo.Clientes
(
    ClienteId       INT IDENTITY(1,1) NOT NULL,
    Nombre          VARCHAR(100) NOT NULL,
    ApellidoPaterno VARCHAR(80) NULL,
    ApellidoMaterno VARCHAR(80) NULL,
    Telefono        VARCHAR(20) NULL,
    Correo          VARCHAR(150) NULL,
    Direccion       VARCHAR(250) NULL,
    FechaRegistro   DATETIME NOT NULL
        CONSTRAINT DF_Clientes_FechaRegistro DEFAULT GETDATE(),
    Activo          BIT NOT NULL
        CONSTRAINT DF_Clientes_Activo DEFAULT 1,

    CONSTRAINT PK_Clientes
        PRIMARY KEY CLUSTERED (ClienteId)
);
GO

/* =========================================================
   TABLA: VENTAS
   Cada registro representa una venta a crédito o deuda.
   ========================================================= */

CREATE TABLE dbo.Ventas
(
    VentaId             INT IDENTITY(1,1) NOT NULL,
    ClienteId           INT NOT NULL,
    DescripcionProducto VARCHAR(250) NOT NULL,
    Cantidad            INT NOT NULL
        CONSTRAINT DF_Ventas_Cantidad DEFAULT 1,
    PrecioUnitario      DECIMAL(12,2) NOT NULL,
    MontoTotal          DECIMAL(12,2) NOT NULL,
    FechaInicioDeuda    DATE NOT NULL,
    FechaLimitePago     DATE NULL,
    Observaciones       VARCHAR(500) NULL,
    Estatus             VARCHAR(20) NOT NULL
        CONSTRAINT DF_Ventas_Estatus DEFAULT 'PENDIENTE',
    FechaRegistro       DATETIME NOT NULL
        CONSTRAINT DF_Ventas_FechaRegistro DEFAULT GETDATE(),

    CONSTRAINT PK_Ventas
        PRIMARY KEY CLUSTERED (VentaId),

    CONSTRAINT FK_Ventas_Clientes
        FOREIGN KEY (ClienteId)
        REFERENCES dbo.Clientes(ClienteId),

    CONSTRAINT CK_Ventas_Cantidad
        CHECK (Cantidad > 0),

    CONSTRAINT CK_Ventas_Montos
        CHECK (
            PrecioUnitario >= 0
            AND MontoTotal >= 0
        ),

    CONSTRAINT CK_Ventas_Estatus
        CHECK (Estatus IN ('PENDIENTE', 'PAGADO', 'CANCELADO'))
);
GO

/* =========================================================
   TABLA: MOVIMIENTOS
   Guarda cargos, abonos y ajustes.
   ========================================================= */

CREATE TABLE dbo.Movimientos
(
    MovimientoId    INT IDENTITY(1,1) NOT NULL,
    VentaId         INT NOT NULL,
    TipoMovimiento  VARCHAR(20) NOT NULL,
    Monto           DECIMAL(12,2) NOT NULL,
    FechaMovimiento DATETIME NOT NULL
        CONSTRAINT DF_Movimientos_FechaMovimiento DEFAULT GETDATE(),
    Descripcion     VARCHAR(250) NULL,

    CONSTRAINT PK_Movimientos
        PRIMARY KEY CLUSTERED (MovimientoId),

    CONSTRAINT FK_Movimientos_Ventas
        FOREIGN KEY (VentaId)
        REFERENCES dbo.Ventas(VentaId),

    CONSTRAINT CK_Movimientos_Tipo
        CHECK (TipoMovimiento IN ('CARGO', 'ABONO', 'AJUSTE')),

    CONSTRAINT CK_Movimientos_Monto
        CHECK (Monto > 0)
);
GO

/* =========================================================
   TABLA: PAGOS
   Guarda el detalle de cada pago realizado.
   ========================================================= */

CREATE TABLE dbo.Pagos
(
    PagoId        INT IDENTITY(1,1) NOT NULL,
    VentaId       INT NOT NULL,
    MontoPago     DECIMAL(12,2) NOT NULL,
    FechaPago     DATETIME NOT NULL
        CONSTRAINT DF_Pagos_FechaPago DEFAULT GETDATE(),
    FormaPago     VARCHAR(30) NULL,
    Referencia    VARCHAR(100) NULL,
    Observaciones VARCHAR(250) NULL,

    CONSTRAINT PK_Pagos
        PRIMARY KEY CLUSTERED (PagoId),

    CONSTRAINT FK_Pagos_Ventas
        FOREIGN KEY (VentaId)
        REFERENCES dbo.Ventas(VentaId),

    CONSTRAINT CK_Pagos_Monto
        CHECK (MontoPago > 0)
);
GO

/* =========================================================
   ÍNDICES
   ========================================================= */

CREATE NONCLUSTERED INDEX IX_Ventas_ClienteId
ON dbo.Ventas (ClienteId);
GO

CREATE NONCLUSTERED INDEX IX_Ventas_Estatus
ON dbo.Ventas (Estatus);
GO

CREATE NONCLUSTERED INDEX IX_Movimientos_VentaId
ON dbo.Movimientos (VentaId);
GO

CREATE NONCLUSTERED INDEX IX_Pagos_VentaId
ON dbo.Pagos (VentaId);
GO

/* =========================================================
   VISTA: CARTERA DE CLIENTES
   ========================================================= */

CREATE VIEW dbo.Vw_CarteraClientes
AS
SELECT
      v.VentaId
    , c.ClienteId
    , NombreCliente =
        LTRIM(RTRIM(
            CONCAT(
                c.Nombre, ' ',
                ISNULL(c.ApellidoPaterno, ''), ' ',
                ISNULL(c.ApellidoMaterno, '')
            )
        ))
    , c.Telefono
    , c.Correo
    , v.DescripcionProducto
    , v.Cantidad
    , v.PrecioUnitario
    , v.MontoTotal AS DeudaInicial
    , v.FechaInicioDeuda
    , v.FechaLimitePago
    , TotalPagado = ISNULL(p.TotalPagado, 0)
    , SaldoPendiente =
        v.MontoTotal - ISNULL(p.TotalPagado, 0)
    , v.Estatus
    , v.Observaciones
FROM dbo.Ventas v
INNER JOIN dbo.Clientes c
    ON c.ClienteId = v.ClienteId
LEFT JOIN
(
    SELECT
          VentaId
        , TotalPagado = SUM(MontoPago)
    FROM dbo.Pagos
    GROUP BY VentaId
) p
    ON p.VentaId = v.VentaId;
GO

/* =========================================================
   DATOS DE EJEMPLO
   ========================================================= */

INSERT INTO dbo.Clientes
(
    Nombre,
    ApellidoPaterno,
    ApellidoMaterno,
    Telefono,
    Correo,
    Direccion
)
VALUES
(
    'Juan',
    'Pérez',
    'López',
    '4771234567',
    'juan.perez@correo.com',
    'León, Guanajuato'
);
GO

INSERT INTO dbo.Ventas
(
    ClienteId,
    DescripcionProducto,
    Cantidad,
    PrecioUnitario,
    MontoTotal,
    FechaInicioDeuda,
    FechaLimitePago,
    Observaciones
)
VALUES
(
    1,
    'Par de zapatos deportivos talla 27',
    1,
    1500.00,
    1500.00,
    CAST(GETDATE() AS DATE),
    DATEADD(DAY, 30, CAST(GETDATE() AS DATE)),
    'Venta a crédito'
);
GO

INSERT INTO dbo.Movimientos
(
    VentaId,
    TipoMovimiento,
    Monto,
    Descripcion
)
VALUES
(
    1,
    'CARGO',
    1500.00,
    'Cargo inicial por venta de producto'
);
GO

DECLARE @VentaId INT = 1;
DECLARE @MontoPago DECIMAL(12,2) = 500.00;

BEGIN TRY

    BEGIN TRANSACTION;

    INSERT INTO dbo.Pagos
    (
        VentaId,
        MontoPago,
        FechaPago,
        FormaPago,
        Referencia,
        Observaciones
    )
    VALUES
    (
        @VentaId,
        @MontoPago,
        GETDATE(),
        'EFECTIVO',
        NULL,
        'Primer abono'
    );

    INSERT INTO dbo.Movimientos
    (
        VentaId,
        TipoMovimiento,
        Monto,
        FechaMovimiento,
        Descripcion
    )
    VALUES
    (
        @VentaId,
        'ABONO',
        @MontoPago,
        GETDATE(),
        'Pago realizado por el cliente'
    );

    COMMIT TRANSACTION;

END TRY
BEGIN CATCH

    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;

    THROW;

END CATCH;
GO

/* =========================================================
   CONSULTAS DE EJEMPLO
   ========================================================= */

-- Consultar todos los clientes
SELECT *
FROM dbo.Clientes;
GO

-- Consultar la cartera completa
SELECT *
FROM dbo.Vw_CarteraClientes
ORDER BY FechaInicioDeuda DESC;
GO

-- Consultar solamente saldos pendientes
SELECT *
FROM dbo.Vw_CarteraClientes
WHERE SaldoPendiente > 0
  AND Estatus <> 'CANCELADO'
ORDER BY FechaInicioDeuda;
GO

-- Consultar movimientos de una venta
DECLARE @VentaConsulta INT = 1;

SELECT
      m.MovimientoId
    , m.VentaId
    , m.TipoMovimiento
    , m.Monto
    , m.FechaMovimiento
    , m.Descripcion
FROM dbo.Movimientos m
WHERE m.VentaId = @VentaConsulta
ORDER BY
      m.FechaMovimiento
    , m.MovimientoId;
GO

-- Consultar historial de pagos
SELECT
      p.PagoId
    , p.VentaId
    , p.MontoPago
    , p.FechaPago
    , p.FormaPago
    , p.Referencia
    , p.Observaciones
FROM dbo.Pagos p
ORDER BY p.FechaPago DESC;
GO
