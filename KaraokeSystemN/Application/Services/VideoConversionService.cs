using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using System;

namespace KaraokeSystemN.Application.Services
{
    public class VideoConversionService
    {
        private readonly IServiceScopeFactory _scopeFactory;

        public VideoConversionService(IServiceScopeFactory scopeFactory)
        {
            _scopeFactory = scopeFactory;
        }

        public Task StartConversionProcessAsync()
        {
            return Task.Run(async () => await ConvertAllVideos());
        }

        private async Task ConvertAllVideos()
        {
            using (var scope = _scopeFactory.CreateScope())
            {
                var settingsService = scope.ServiceProvider.GetRequiredService<SettingsService>();
                var statusService = scope.ServiceProvider.GetRequiredService<ConversionStatusService>();

                try
                {
                    statusService.UpdateStatus("A verificar pastas e ficheiros...");
                    var originalVideosPath = await settingsService.GetOriginalVideosPathAsync();
                    var convertedVideosPath = await settingsService.GetConvertedVideosPathAsync();

                    if (string.IsNullOrEmpty(originalVideosPath) || !Directory.Exists(originalVideosPath))
                    {
                        statusService.UpdateStatus("Erro: A pasta de vídeos originais não foi encontrada.");
                        return;
                    }

                    if (!Directory.Exists(convertedVideosPath))
                    {
                        Directory.CreateDirectory(convertedVideosPath);
                    }

                    var filesToConvert = Directory.EnumerateFiles(originalVideosPath)
                        .Where(file => !File.Exists(Path.Combine(convertedVideosPath, Path.ChangeExtension(Path.GetFileName(file), ".mp4"))))
                        .ToList();

                    if (filesToConvert.Count == 0)
                    {
                        statusService.UpdateStatus("Concluído: Nenhum vídeo novo para converter.");
                        return;
                    }

                    // --- CORREÇÃO DEFINITIVA DE CAMINHOS ---
                    const string ffmpegPath = "/usr/bin/ffmpeg";
                    if (!File.Exists(ffmpegPath))
                    {
                        statusService.UpdateStatus("Erro Crítico: O executável do FFmpeg não foi encontrado em /usr/bin/ffmpeg.");
                        return;
                    }

                    int processedCount = 0;
                    foreach (var originalFile in filesToConvert)
                    {
                        processedCount++;
                        var fileName = Path.GetFileName(originalFile);
                        var convertedFilePath = Path.Combine(convertedVideosPath, Path.ChangeExtension(fileName, ".mp4"));

                        statusService.UpdateStatus($"A converter {processedCount}/{filesToConvert.Count}: {fileName}");

                        var processStartInfo = new ProcessStartInfo
                        {
                            FileName = ffmpegPath, // Usamos o caminho absoluto para o FFmpeg
                            Arguments = $"-i \"{originalFile}\" -c:v libx264 -c:a aac -preset fast -y \"{convertedFilePath}\"",
                            RedirectStandardError = true,
                            UseShellExecute = false,
                            CreateNoWindow = true,
                        };

                        using var process = new Process { StartInfo = processStartInfo };
                        process.Start();

                        string errors = await process.StandardError.ReadToEndAsync();
                        await process.WaitForExitAsync();

                        if (process.ExitCode != 0)
                        {
                            statusService.UpdateStatus($"Erro ao converter {fileName}.");
                            Console.WriteLine($"--> ERRO FFmpeg: {errors}");
                        }
                    }
                    statusService.UpdateStatus("Processo de conversão concluído.");
                }
                catch (Exception ex)
                {
                    statusService.UpdateStatus($"Erro crítico durante a conversão: {ex.Message}");
                    Console.WriteLine($"--> ERRO CRÍTICO: {ex.ToString()}");
                }
            }
        }
    }
}

