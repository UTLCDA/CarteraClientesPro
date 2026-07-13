using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Linq;
using System.Threading.Tasks;

namespace CarteraClientes.API.Filters;

public class ValidationFilter : IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        foreach (var arg in context.ActionArguments.Values)
        {
            if (arg == null) continue;

            var validatorType = typeof(IValidator<>).MakeGenericType(arg.GetType());
            var validator = context.HttpContext.RequestServices.GetService(validatorType) as IValidator;

            if (validator != null)
            {
                var validationContext = new ValidationContext<object>(arg);
                var result = await validator.ValidateAsync(validationContext);

                if (!result.IsValid)
                {
                    var errors = result.Errors
                        .GroupBy(e => e.PropertyName)
                        .ToDictionary(
                            g => g.Key,
                            g => g.Select(e => e.ErrorMessage).ToArray()
                        );

                    context.Result = new BadRequestObjectResult(new 
                    { 
                        mensaje = "Se presentaron errores de validación.", 
                        errores = errors 
                    });
                    return;
                }
            }
        }

        await next();
    }
}
