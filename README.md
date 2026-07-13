# 💼 CarteraPro - Sistema de Control de Cartera y Cobranza

Un sistema moderno, responsivo y seguro para la administración de carteras de clientes, ventas a crédito, abonos de pago y auditoría de movimientos financieros. Diseñado con una arquitectura limpia en capas en el backend y una interfaz rica e interactiva en el frontend.

---

## 🛠️ Tecnologías Utilizadas

### Backend
* **Lenguaje:** C# (.NET 10.0)
* **API Framework:** ASP.NET Core Web API con Controllers
* **ORM:** Entity Framework Core (EF Core) 10.0
* **Base de Datos:** SQL Server
* **Arquitectura:** Clean Architecture (Capas: Domain, Application, Infrastructure, API)
* **Validación:** FluentValidation para validación automática de solicitudes
* **Seguridad:** Middleware de manejo global de excepciones y políticas CORS flexibles
* **Documentación:** Swagger / OpenAPI interactivo

### Frontend
* **Core:** React 19 con TypeScript y Vite
* **Diseño y Estilos:** Material UI (MUI) con paleta Indigo/Teal premium y diseño responsivo
* **Validación de Formularios:** React Hook Form integrado con Zod schemas
* **Gestión de Estado y Caching:** TanStack Query v5 (React Query)
* **Cliente REST:** Axios con interceptores de peticiones

---

## 📂 Estructura del Proyecto

```text
app_carteraClientes/
├── CarteraClientesDB.sql       # Script de creación de base de datos, vista y seed inicial
├── README.md                   # Documentación principal del sistema
│
├── backend/                    # Solución C# .NET
│   ├── CarteraClientes.sln     # Archivo de solución de Visual Studio
│   ├── CarteraClientes.Domain/ # Entidades principales, enums e interfaces de repositorio
│   ├── CarteraClientes.Application/ # DTOs, validaciones y lógica de servicios
│   ├── CarteraClientes.Infrastructure/ # DbContext, mapeos y repositorios EF Core
│   └── CarteraClientes.API/    # Middleware, controladores y configuraciones del servidor
│
└── cartera-clientes-ui/        # Cliente Web React (Vite)
    ├── src/
    │   ├── api/                # Cliente Axios configurado para interactuar con la API
    │   ├── hooks/              # Query y Mutation hooks (TanStack Query)
    │   ├── layouts/            # Plantilla Master responsiva (MainLayout)
    │   ├── pages/              # Páginas del sistema (Dashboard, Clientes, Ventas, Pagos)
    │   ├── routes/             # Enrutamiento jerárquico del sistema
    │   ├── utils/              # Formateadores de moneda mexicana ($) y fechas (dd/MM/yyyy)
    │   └── main.tsx            # Punto de entrada de React
    └── package.json
```

---

## 🚀 Pasos para la Configuración e Inicialización

### 1. Base de Datos (SQL Server)
El sistema requiere una base de datos SQL Server configurada:
1. Abra su cliente de base de datos (por ejemplo, SQL Server Management Studio).
2. Ejecute el script completo [CarteraClientesDB.sql](file:///d:/app_carteraClientes/CarteraClientesDB.sql) para crear la base de datos `CarteraClientesDB`, las tablas (`Clientes`, `Ventas`, `Pagos`, `Movimientos`), la vista de cálculo de cartera `Vw_CarteraClientes`, y el seed inicial de registros.

El script de base de datos mapea automáticamente las llaves primarias, llaves foráneas y reglas de integridad transaccional.

### 2. Configurar y Ejecutar el Backend (.NET API)
La cadena de conexión por defecto se encuentra configurada en el archivo `appsettings.json` del proyecto de API.

1. Navegue al directorio del API:
   ```bash
   cd backend/CarteraClientes.API
   ```
2. Revise el archivo `appsettings.json` y modifique la sección `ConnectionStrings` si su servidor SQL local requiere credenciales personalizadas:
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Server=localhost;Database=CarteraClientesDB;Trusted_Connection=True;TrustServerCertificate=True;"
   }
   ```
3. Restaure y compile la solución C#:
   ```bash
   dotnet restore
   dotnet build
   ```
4. Ejecute el servidor backend:
   ```bash
   dotnet run
   ```
   *El servidor API iniciará por defecto en: `http://localhost:5032`.*
5. Puede ver y probar los endpoints REST directamente desde Swagger visitando:
   `http://localhost:5032/swagger`

### 3. Configurar y Ejecutar el Frontend (React)
1. Navegue a la carpeta del frontend:
   ```bash
   cd cartera-clientes-ui
   ```
2. Instale todas las dependencias requeridas (incluyendo las librerías nativas del bundler Vite/Rolldown para su sistema operativo):
   ```bash
   npm install
   ```
3. Configure la URL del API (si fuera diferente a `http://localhost:5032/api`) en el archivo [apiClient.ts](file:///d:/app_carteraClientes/cartera-clientes-ui/src/api/apiClient.ts).
4. Ejecute el servidor de desarrollo local:
   ```bash
   npm run dev
   ```
5. Abra su navegador en la dirección mostrada por Vite (usualmente `http://localhost:5173`).
6. Para compilar la aplicación para producción:
   ```bash
   npm run build
   ```

---

## 🔒 Reglas de Negocio Implementadas

El sistema aplica estrictamente las siguientes reglas tanto a nivel de API/Base de datos como de interfaz UI:
1. **Transacciones Atómicas:** El registro de ventas y pagos se ejecuta dentro de transacciones de base de datos (`IUnitOfWork`). Si alguna operación intermedia falla, se efectúa un Rollback completo.
2. **Cálculo de Saldos Automático:** El `SaldoPendiente` de una venta se calcula en tiempo real como `MontoTotal - TotalPagado`.
3. **Flujo de Auditoría de Movimientos:**
   * Al registrar una venta a crédito, se genera de manera automática un movimiento de tipo `CARGO` por el monto total de la venta.
   * Al registrar un abono de pago, se genera un movimiento de tipo `ABONO`.
   * Si el `SaldoPendiente` llega a `$0.00`, la venta cambia automáticamente su estatus a `PAGADO`.
4. **Validación de Límites:**
   * El monto de un abono no puede ser menor o igual a cero.
   * El monto de un abono no puede exceder el `SaldoPendiente` actual de la venta.
5. **Ventas Canceladas:** Si una venta pasa a estatus `CANCELADO`, queda inhabilitada para recibir pagos posteriores.
6. **Borrado Lógico de Clientes:** No se permite la eliminación física de clientes que tengan historial de ventas a crédito. En su lugar, el sistema permite desactivar el cliente (`Activo = 0`), impidiendo que se registren nuevas ventas a su nombre.
7. **Ajustes de Auditoría Manuales:** Desde la pantalla de detalle de venta, es posible ingresar movimientos manuales de ajuste con descripción obligatoria en la bitácora histórica.
