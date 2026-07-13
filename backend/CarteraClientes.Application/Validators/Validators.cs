using FluentValidation;
using CarteraClientes.Application.DTOs;
using System;

namespace CarteraClientes.Application.Validators;

public class ClienteCreateUpdateDtoValidator : AbstractValidator<ClienteCreateUpdateDto>
{
    public ClienteCreateUpdateDtoValidator()
    {
        RuleFor(c => c.Nombre)
            .NotEmpty().WithMessage("El nombre es obligatorio.")
            .MaximumLength(100).WithMessage("El nombre no debe exceder 100 caracteres.");

        RuleFor(c => c.ApellidoPaterno)
            .MaximumLength(80).WithMessage("El apellido paterno no debe exceder 80 caracteres.");

        RuleFor(c => c.ApellidoMaterno)
            .MaximumLength(80).WithMessage("El apellido materno no debe exceder 80 caracteres.");

        RuleFor(c => c.Telefono)
            .MaximumLength(20).WithMessage("El teléfono no debe exceder 20 caracteres.");

        RuleFor(c => c.Correo)
            .EmailAddress().WithMessage("El correo electrónico no es válido.")
            .MaximumLength(150).WithMessage("El correo electrónico no debe exceder 150 caracteres.")
            .When(c => !string.IsNullOrEmpty(c.Correo));

        RuleFor(c => c.Direccion)
            .MaximumLength(250).WithMessage("La dirección no debe exceder 250 caracteres.");
    }
}

public class VentaCreateDtoValidator : AbstractValidator<VentaCreateDto>
{
    public VentaCreateDtoValidator()
    {
        RuleFor(v => v.ClienteId)
            .GreaterThan(0).WithMessage("El cliente seleccionado no es válido.");

        RuleFor(v => v.DescripcionProducto)
            .NotEmpty().WithMessage("La descripción del producto es obligatoria.")
            .MaximumLength(250).WithMessage("La descripción del producto no debe exceder 250 caracteres.");

        RuleFor(v => v.Cantidad)
            .GreaterThan(0).WithMessage("La cantidad debe ser mayor que cero.");

        RuleFor(v => v.PrecioUnitario)
            .GreaterThan(0).WithMessage("El precio unitario debe ser mayor que cero.");

        RuleFor(v => v.FechaInicioDeuda)
            .NotEmpty().WithMessage("La fecha de inicio de la deuda es obligatoria.");

        RuleFor(v => v.FechaLimitePago)
            .GreaterThanOrEqualTo(v => v.FechaInicioDeuda)
            .WithMessage("La fecha límite de pago no puede ser menor que la fecha de inicio de la deuda.")
            .When(v => v.FechaLimitePago.HasValue);
    }
}

public class PagoCreateDtoValidator : AbstractValidator<PagoCreateDto>
{
    public PagoCreateDtoValidator()
    {
        RuleFor(p => p.VentaId)
            .GreaterThan(0).WithMessage("La venta seleccionada no es válida.");

        RuleFor(p => p.MontoPago)
            .GreaterThan(0).WithMessage("El monto del pago debe ser mayor que cero.");

        RuleFor(p => p.FechaPago)
            .NotEmpty().WithMessage("La fecha de pago es obligatoria.");

        RuleFor(p => p.FormaPago)
            .MaximumLength(30).WithMessage("La forma de pago no debe exceder 30 caracteres.");

        RuleFor(p => p.Referencia)
            .MaximumLength(100).WithMessage("La referencia no debe exceder 100 caracteres.");

        RuleFor(p => p.Observaciones)
            .MaximumLength(250).WithMessage("Las observaciones no deben exceder 250 caracteres.");
    }
}

public class MovimientoAjusteDtoValidator : AbstractValidator<MovimientoAjusteDto>
{
    public MovimientoAjusteDtoValidator()
    {
        RuleFor(m => m.VentaId)
            .GreaterThan(0).WithMessage("La venta seleccionada no es válida.");

        RuleFor(m => m.Monto)
            .GreaterThan(0).WithMessage("El monto del ajuste debe ser mayor que cero.");

        RuleFor(m => m.Descripcion)
            .NotEmpty().WithMessage("La descripción del ajuste es obligatoria.")
            .MaximumLength(250).WithMessage("La descripción del ajuste no debe exceder 250 caracteres.");
    }
}
