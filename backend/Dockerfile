# Build Stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build-env
WORKDIR /app

# Copy all project files and restore dependencies
COPY CarteraClientes.Domain/CarteraClientes.Domain.csproj CarteraClientes.Domain/
COPY CarteraClientes.Application/CarteraClientes.Application.csproj CarteraClientes.Application/
COPY CarteraClientes.Infrastructure/CarteraClientes.Infrastructure.csproj CarteraClientes.Infrastructure/
COPY CarteraClientes.API/CarteraClientes.API.csproj CarteraClientes.API/
RUN dotnet restore CarteraClientes.API/CarteraClientes.API.csproj

# Copy the rest of the source code and publish the build
COPY . .
RUN dotnet publish CarteraClientes.API/CarteraClientes.API.csproj -c Release -o out

# Runtime Stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build-env /app/out .

# Render exposes and proxies traffic to port 8080 by default
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "CarteraClientes.API.dll"]
