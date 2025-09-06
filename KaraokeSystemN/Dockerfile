# Dockerfile para a aplicação ASP.NET Core (Backend)

# Etapa 1: Build da aplicação
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build-env
WORKDIR /app

# Copia e restaura as dependências do projeto
COPY *.csproj ./
RUN dotnet restore

# Copia todo o código fonte da aplicação
COPY . .

# Publica a aplicação em modo de "release"
RUN dotnet publish -c Release -o out

# Etapa 2: Executar a aplicação
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build-env /app/out .

# Expõe a porta que a aplicação vai escutar
EXPOSE 8080

# Inicia a aplicação. Define a URL de escuta
ENTRYPOINT ["dotnet", "KaraokeSystemN.dll", "--urls", "http://0.0.0.0:8080"]