using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using CarteraClientes.Application.DTOs;
using CarteraClientes.Domain.Entities;
using CarteraClientes.Domain.Repositories;

namespace CarteraClientes.Application.Services;

public class RecordatorioService : IRecordatorioService
{
    private readonly IRecordatorioRepository _recordatorioRepository;
    private readonly IVwCarteraClientesRepository _vwCarteraClientesRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IConfiguration _configuration;
    private readonly ILogger<RecordatorioService> _logger;

    public RecordatorioService(
        IRecordatorioRepository recordatorioRepository,
        IVwCarteraClientesRepository vwCarteraClientesRepository,
        IUnitOfWork unitOfWork,
        IConfiguration configuration,
        ILogger<RecordatorioService> logger)
    {
        _recordatorioRepository = recordatorioRepository;
        _vwCarteraClientesRepository = vwCarteraClientesRepository;
        _unitOfWork = unitOfWork;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<RecordatorioDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var recordatorio = await _recordatorioRepository.GetByIdAsync(id, cancellationToken);
        if (recordatorio == null) return null;

        return MapToDto(recordatorio);
    }

    public async Task<IEnumerable<RecordatorioDto>> GetByFiltrosAsync(string? estatus, string? canal, DateTime? fechaDesde, CancellationToken cancellationToken = default)
    {
        var recordatorios = await _recordatorioRepository.GetByFiltrosAsync(estatus, canal, fechaDesde, cancellationToken);
        return recordatorios.Select(MapToDto);
    }

    public async Task<RecordatorioGenerarResultDto> GenerarRecordatoriosSemanalesAsync(CancellationToken cancellationToken = default)
    {
        // 1. Get all active credit sales with pending balances from view
        var ventasPendientes = await _vwCarteraClientesRepository.GetFilteredAsync(
            clienteId: null,
            estatus: "PENDIENTE",
            fechaInicio: null,
            fechaFin: null,
            productoText: null,
            cancellationToken: cancellationToken
        );

        // Filter out items with 0 balance (just in case)
        var deudores = ventasPendientes.Where(v => v.SaldoPendiente > 0).ToList();

        // 2. Fetch reminders created in the last 6 days to prevent duplicates
        var fechaReciente = DateTime.Today.AddDays(-6);
        var recordatoriosRecientes = await _recordatorioRepository.GetByFiltrosAsync(
            estatus: null,
            canal: null,
            fechaDesde: fechaReciente,
            cancellationToken: cancellationToken
        );

        var ventasConRecordatorioReciente = recordatoriosRecientes
            .Select(r => r.VentaId)
            .ToHashSet();

        int generados = 0;
        int saltados = 0;

        foreach (var deudor in deudores)
        {
            if (ventasConRecordatorioReciente.Contains(deudor.VentaId))
            {
                saltados++;
                continue;
            }

            // Create customized message
            string nombreFormateado = $"{deudor.NombreCliente}";
            string saldoFormateado = deudor.SaldoPendiente.ToString("C");
            string fechaVentaFormateada = deudor.FechaInicioDeuda.ToString("dd/MM/yyyy");

            string mensaje = $"Hola {nombreFormateado}, le recordamos de manera atenta que tiene un saldo pendiente de {saldoFormateado} por la compra de '{deudor.DescripcionProducto}' realizada el {fechaVentaFormateada}. Le sugerimos realizar su abono a la brevedad para mantener su cuenta al corriente. ¡Muchas gracias y excelente día!";

            // Determine canal
            string canal = "WHATSAPP";
            if (!string.IsNullOrWhiteSpace(deudor.Correo))
            {
                canal = "AMBOS"; // If they have email, we can send email AND offer WhatsApp
            }

            var recordatorio = new Recordatorio
            {
                ClienteId = deudor.ClienteId,
                VentaId = deudor.VentaId,
                Mensaje = mensaje,
                FechaCreacion = DateTime.Now,
                Estatus = "PENDIENTE",
                Canal = canal
            };

            await _recordatorioRepository.AddAsync(recordatorio, cancellationToken);
            generados++;
        }

        if (generados > 0)
        {
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }

        return new RecordatorioGenerarResultDto
        {
            TotalGenerados = generados,
            TotalSaltados = saltados
        };
    }

    public async Task<bool> EnviarCorreoAsync(int id, CancellationToken cancellationToken = default)
    {
        var recordatorio = await _recordatorioRepository.GetByIdAsync(id, cancellationToken);
        if (recordatorio == null) return false;

        if (string.IsNullOrWhiteSpace(recordatorio.Cliente.Correo))
        {
            recordatorio.Estatus = "FALLIDO";
            _recordatorioRepository.Update(recordatorio);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            _logger.LogWarning("Cannot send email for reminder {Id} because client has no email address.", id);
            return false;
        }

        bool enviado = false;

        // Retrieve SMTP settings
        var server = _configuration["SmtpSettings:Server"];
        var portStr = _configuration["SmtpSettings:Port"];
        var username = _configuration["SmtpSettings:Username"];
        var password = _configuration["SmtpSettings:Password"];
        var enableSslStr = _configuration["SmtpSettings:EnableSsl"];
        var senderName = _configuration["SmtpSettings:SenderName"] ?? "Cartera Clientes Pro";
        var senderEmail = _configuration["SmtpSettings:SenderEmail"];

        if (string.IsNullOrWhiteSpace(server) || string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
        {
            // Simulation Mode (Default if no credentials are configured)
            _logger.LogInformation("SMTP not configured. SIMULATED EMAIL SENT to {Email} for Reminder {Id}. Body: {Message}", 
                recordatorio.Cliente.Correo, id, recordatorio.Mensaje);
            
            enviado = true;
        }
        else
        {
            try
            {
                int port = int.TryParse(portStr, out int p) ? p : 587;
                bool enableSsl = !bool.TryParse(enableSslStr, out bool ssl) || ssl;

                using var mailMessage = new MailMessage
                {
                    From = new MailAddress(senderEmail ?? username, senderName),
                    Subject = "Recordatorio de Pago Pendiente - Cartera Clientes",
                    Body = recordatorio.Mensaje,
                    IsBodyHtml = false,
                };
                mailMessage.To.Add(recordatorio.Cliente.Correo);

                using var smtpClient = new SmtpClient(server, port)
                {
                    Credentials = new NetworkCredential(username, password),
                    EnableSsl = enableSsl,
                };

                await smtpClient.SendMailAsync(mailMessage, cancellationToken);
                _logger.LogInformation("Real email successfully sent to {Email} for Reminder {Id}", recordatorio.Cliente.Correo, id);
                enviado = true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send SMTP email to {Email} for Reminder {Id}", recordatorio.Cliente.Correo, id);
                recordatorio.Estatus = "FALLIDO";
                _recordatorioRepository.Update(recordatorio);
                await _unitOfWork.SaveChangesAsync(cancellationToken);
                return false;
            }
        }

        if (enviado)
        {
            recordatorio.Estatus = "ENVIADO";
            recordatorio.FechaEnvio = DateTime.Now;
            _recordatorioRepository.Update(recordatorio);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return true;
        }

        return false;
    }

    public async Task<bool> MarcarComoEnviadoAsync(int id, CancellationToken cancellationToken = default)
    {
        var recordatorio = await _recordatorioRepository.GetByIdAsync(id, cancellationToken);
        if (recordatorio == null) return false;

        recordatorio.Estatus = "ENVIADO";
        recordatorio.FechaEnvio = DateTime.Now;
        
        _recordatorioRepository.Update(recordatorio);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }

    private RecordatorioDto MapToDto(Recordatorio r)
    {
        return new RecordatorioDto
        {
            RecordatorioId = r.RecordatorioId,
            ClienteId = r.ClienteId,
            NombreCliente = $"{r.Cliente.Nombre} {r.Cliente.ApellidoPaterno ?? ""} {r.Cliente.ApellidoMaterno ?? ""}".Trim(),
            TelefonoCliente = r.Cliente.Telefono ?? string.Empty,
            CorreoCliente = r.Cliente.Correo ?? string.Empty,
            VentaId = r.VentaId,
            DescripcionProducto = r.Venta.DescripcionProducto,
            Mensaje = r.Mensaje,
            FechaCreacion = r.FechaCreacion,
            FechaEnvio = r.FechaEnvio,
            Estatus = r.Estatus,
            Canal = r.Canal
        };
    }
}
