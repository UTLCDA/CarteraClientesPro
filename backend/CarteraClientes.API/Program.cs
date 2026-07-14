using Microsoft.EntityFrameworkCore;
using FluentValidation;
using CarteraClientes.API.Filters;
using CarteraClientes.API.Middleware;
using CarteraClientes.Domain.Repositories;
using CarteraClientes.Infrastructure.Persistencia;
using CarteraClientes.Infrastructure.Repositories;
using CarteraClientes.Application.Services;
using CarteraClientes.Application.Validators;
using CarteraClientes.API.Services;

var builder = WebApplication.CreateBuilder(args);

// Configurar DbContext con la cadena de conexión de PostgreSQL
builder.Services.AddDbContext<CarteraClientesDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Registrar Repositorios y Unit of Work
builder.Services.AddScoped<IClienteRepository, ClienteRepository>();
builder.Services.AddScoped<IVentaRepository, VentaRepository>();
builder.Services.AddScoped<IVwCarteraClientesRepository, VwCarteraClientesRepository>();
builder.Services.AddScoped<IPagoRepository, PagoRepository>();
builder.Services.AddScoped<IMovimientoRepository, MovimientoRepository>();
builder.Services.AddScoped<IDashboardRepository, DashboardRepository>();
builder.Services.AddScoped<IRecordatorioRepository, RecordatorioRepository>();
builder.Services.AddScoped<IProgramacionRecordatorioRepository, ProgramacionRecordatorioRepository>();
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

// Registrar Servicios de Aplicación
builder.Services.AddScoped<IClienteService, ClienteService>();
builder.Services.AddScoped<IVentaService, VentaService>();
builder.Services.AddScoped<IPagoService, PagoService>();
builder.Services.AddScoped<IMovimientoService, MovimientoService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<IRecordatorioService, RecordatorioService>();
builder.Services.AddScoped<IProgramacionRecordatorioService, ProgramacionRecordatorioService>();

// Registrar Hosted Services (Background Workers)
builder.Services.AddHostedService<RecordatorioBackgroundWorker>();

// Registrar Validadores de FluentValidation
builder.Services.AddValidatorsFromAssembly(typeof(ClienteCreateUpdateDtoValidator).Assembly);

// Configurar controladores y registrar el filtro de validación
builder.Services.AddControllers(options =>
{
    options.Filters.Add<ValidationFilter>();
});

// Configurar Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configurar CORS para permitir el frontend local
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Middleware global de excepciones
app.UseMiddleware<ExceptionMiddleware>();

// Configurar Swagger en ambiente de Desarrollo
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "CarteraClientes.API v1");
    });
}

app.UseCors("AllowFrontend");

app.UseAuthorization();

app.MapControllers();

// Aplicar migraciones pendientes automáticamente al iniciar la app
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<CarteraClientesDbContext>();
        context.Database.Migrate();
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Ocurrió un error al aplicar las migraciones en el arranque.");
    }
}

app.Run();
