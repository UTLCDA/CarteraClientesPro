using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using CarteraClientes.Domain.Entities;
using CarteraClientes.Infrastructure.Persistencia;
using CarteraClientes.Application.Services;

namespace CarteraClientes.API.Services;

public class RecordatorioBackgroundWorker : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<RecordatorioBackgroundWorker> _logger;

    public RecordatorioBackgroundWorker(
        IServiceProvider serviceProvider,
        ILogger<RecordatorioBackgroundWorker> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Recordatorio Background Worker has started.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessScheduledRemindersAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred executing ProcessScheduledRemindersAsync.");
            }

            // Wait 60 seconds before checking again
            await Task.Delay(TimeSpan.FromSeconds(60), stoppingToken);
        }

        _logger.LogInformation("Recordatorio Background Worker has stopped.");
    }

    private async Task ProcessScheduledRemindersAsync(CancellationToken cancellationToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<CarteraClientesDbContext>();
        var recordatorioService = scope.ServiceProvider.GetRequiredService<IRecordatorioService>();

        var now = DateTime.Now;

        // Fetch all active rules
        var rules = await dbContext.ProgramacionesRecordatorios
            .Include(pr => pr.Cliente)
            .Include(pr => pr.Venta)
            .Where(pr => pr.Activo)
            .ToListAsync(cancellationToken);

        foreach (var pr in rules)
        {
            // Verify the related sale still has a pending balance
            if (pr.Venta == null || pr.Venta.Estatus != CarteraClientes.Domain.Enums.EstatusVenta.PENDIENTE)
            {
                // Auto-deactivate schedule rule if the debt is already paid/cancelled
                pr.Activo = false;
                dbContext.ProgramacionesRecordatorios.Update(pr);
                await dbContext.SaveChangesAsync(cancellationToken);
                _logger.LogInformation("Auto-deactivated scheduling rule {Id} because sale is no longer PENDING.", pr.ProgramacionRecordatorioId);
                continue;
            }

            // Double check actual pending balance (skip if zero)
            decimal pendingBalance = await dbContext.Pagos
                .Where(p => p.VentaId == pr.VentaId)
                .Select(p => p.MontoPago)
                .Cast<decimal?>()
                .SumAsync(cancellationToken) ?? 0;
            
            decimal actualOwed = pr.Venta.MontoTotal - pendingBalance;
            if (actualOwed <= 0)
            {
                pr.Activo = false;
                dbContext.ProgramacionesRecordatorios.Update(pr);
                await dbContext.SaveChangesAsync(cancellationToken);
                continue;
            }

            // Parse time execution (HH:mm)
            var scheduledParts = pr.HoraEjecucion.Split(':');
            if (scheduledParts.Length != 2 || 
                !int.TryParse(scheduledParts[0], out var sHour) || 
                !int.TryParse(scheduledParts[1], out var sMin))
            {
                continue;
            }

            var scheduledTimeToday = now.Date.AddHours(sHour).AddMinutes(sMin);
            bool shouldRun = false;

            if (pr.Frecuencia.ToUpper() == "UNICA")
            {
                shouldRun = pr.FechaHoraEjecucion.HasValue && 
                            now >= pr.FechaHoraEjecucion.Value && 
                            pr.FechaUltimaEjecucion == null;
            }
            else if (pr.Frecuencia.ToUpper() == "DIARIA")
            {
                shouldRun = now >= scheduledTimeToday && 
                            (pr.FechaUltimaEjecucion == null || pr.FechaUltimaEjecucion.Value.Date < now.Date);
            }
            else if (pr.Frecuencia.ToUpper() == "SEMANAL")
            {
                var normalizedDay = GetNormalizedDayOfWeek(now.DayOfWeek);
                shouldRun = pr.DiaSemana == normalizedDay && 
                            now >= scheduledTimeToday && 
                            (pr.FechaUltimaEjecucion == null || pr.FechaUltimaEjecucion.Value.Date < now.Date);
            }

            if (shouldRun)
            {
                _logger.LogInformation("Triggered scheduling rule {Id} for Client {ClientName}", pr.ProgramacionRecordatorioId, pr.Cliente.Nombre);

                // Compose text
                string mensaje = pr.MensajePersonalizado;
                if (string.IsNullOrWhiteSpace(mensaje))
                {
                    string nombreFormateado = $"{pr.Cliente.Nombre} {pr.Cliente.ApellidoPaterno ?? ""}".Trim();
                    string saldoFormateado = actualOwed.ToString("C");
                    string fechaVentaFormateada = pr.Venta.FechaInicioDeuda.ToString("dd/MM/yyyy");
                    mensaje = $"Hola {nombreFormateado}, le recordamos de manera atenta que tiene un saldo pendiente de {saldoFormateado} por la compra de '{pr.Venta.DescripcionProducto}' realizada el {fechaVentaFormateada}. Le sugerimos realizar su abono a la brevedad. ¡Muchas gracias y excelente día!";
                }

                // Add recordatorio entry
                var recordatorio = new Recordatorio
                {
                    ClienteId = pr.ClienteId,
                    VentaId = pr.VentaId,
                    Mensaje = mensaje,
                    FechaCreacion = now,
                    FechaProgramada = now,
                    Estatus = "PENDIENTE",
                    Canal = pr.TipoCanal
                };

                await dbContext.Recordatorios.AddAsync(recordatorio, cancellationToken);
                await dbContext.SaveChangesAsync(cancellationToken);

                // Try to send email automatically if email is configured
                if (pr.TipoCanal.ToUpper() == "CORREO" || pr.TipoCanal.ToUpper() == "AMBOS")
                {
                    if (!string.IsNullOrWhiteSpace(pr.Cliente.Correo))
                    {
                        try
                        {
                            await recordatorioService.EnviarCorreoAsync(recordatorio.RecordatorioId, cancellationToken);
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex, "Failed sending automatic email alert for reminder {Id}", recordatorio.RecordatorioId);
                        }
                    }
                }

                // Update rule execution state
                pr.FechaUltimaEjecucion = now;
                if (pr.Frecuencia.ToUpper() == "UNICA")
                {
                    pr.Activo = false;
                }

                dbContext.ProgramacionesRecordatorios.Update(pr);
                await dbContext.SaveChangesAsync(cancellationToken);
            }
        }
    }

    private string GetNormalizedDayOfWeek(DayOfWeek day)
    {
        return day switch
        {
            DayOfWeek.Monday => "LUNES",
            DayOfWeek.Tuesday => "MARTES",
            DayOfWeek.Wednesday => "MIERCOLES",
            DayOfWeek.Thursday => "JUEVES",
            DayOfWeek.Friday => "VIERNES",
            DayOfWeek.Saturday => "SABADO",
            DayOfWeek.Sunday => "DOMINGO",
            _ => ""
        };
    }
}
