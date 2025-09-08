# Etapa 1: Construir a aplicação
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build-env
WORKDIR /app

# --- ESTA É A CORREÇÃO PRINCIPAL ---
# Usamos 'apt-get' para atualizar os pacotes e instalar o FFmpeg no ambiente de build.
RUN apt-get update && apt-get install -y ffmpeg

# Copia o ficheiro do projeto e restaura as dependências
COPY *.csproj ./
RUN dotnet restore

# Copia o resto do código fonte
COPY . ./

# Publica a aplicação em modo de "release"
RUN dotnet publish -c Release -o out

# Etapa 2: Executar a aplicação
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build-env /app/out .

# --- CORREÇÃO APLICADA AQUI TAMBÉM ---
# Garante que o FFmpeg também está disponível no ambiente de execução final.
RUN apt-get update && apt-get install -y ffmpeg

# Expõe a porta que a aplicação irá usar
EXPOSE 8080

# O comando para iniciar a aplicação
ENTRYPOINT ["dotnet", "KaraokeSystemN.dll"]