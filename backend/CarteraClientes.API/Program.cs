using Microsoft.EntityFrameworkCore;
using FluentValidation;
using CarteraClientes.API.Filters;
using CarteraClientes.API.Middleware;
using CarteraClientes.Domain.Repositories;
using CarteraClientes.Infrastructure.Persistencia;
using CarteraClientes.Infrastructure.Repositories;
using CarteraClientes.Application.Services;
using CarteraClientes.Application.Validators;

var builder = WebApplication.CreateBuilder(args);

// Configurar DbContext con la cadena de conexión de SQL Server
builder.Services.AddDbContext<CarteraClientesDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Registrar Repositorios y Unit of Work
builder.Services.AddScoped<IClienteRepository, ClienteRepository>();
builder.Services.AddScoped<IVentaRepository, VentaRepository>();
builder.Services.AddScoped<IVwCarteraClientesRepository, VwCarteraClientesRepository>();
builder.Services.AddScoped<IPagoRepository, PagoRepository>();
builder.Services.AddScoped<IMovimientoRepository, MovimientoRepository>();
builder.Services.AddScoped<IDashboardRepository, DashboardRepository>();
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

// Registrar Servicios de Aplicación
builder.Services.AddScoped<IClienteService, ClienteService>();
builder.Services.AddScoped<IVentaService, VentaService>();
builder.Services.AddScoped<IPagoService, PagoService>();
builder.Services.AddScoped<IMovimientoService, MovimientoService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();

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
        policy.WithOrigins("http://localhost:3000", "http://localhost:5173") // Puertos de desarrollo de React
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

app.Run();
