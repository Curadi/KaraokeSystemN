using KaraokeSystemN.Domain.Interfaces;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace KaraokeSystemN.Application.Services
{
    public class VideoService
    {
        private readonly string _videoFolderPath;
        private readonly List<string> _supportedExtensions = new() { ".mp4", ".mkv", ".avi", ".mov", ".wmv" };
        private readonly SettingsService _settingsService;
        private readonly IPlayedSongLogRepository _playedSongLogRepository;

        public VideoService(IConfiguration configuration, SettingsService settingsService, IPlayedSongLogRepository playedSongLogRepository)
        {
            _videoFolderPath = configuration.GetValue<string>("VideoSettings:FolderPath") ?? string.Empty;
            _settingsService = settingsService;
            _playedSongLogRepository = playedSongLogRepository;
        }

        public async Task<IEnumerable<string>> GetAvailableVideoFilesAsync()
        {
            if (string.IsNullOrEmpty(_videoFolderPath) || !Directory.Exists(_videoFolderPath))
            {
                return Enumerable.Empty<string>();
            }

            // 1. Obter a lista completa de todos os ficheiros de vídeo na pasta.
            var allVideoFiles = Directory.EnumerateFiles(_videoFolderPath)
                .Where(file => _supportedExtensions.Contains(Path.GetExtension(file).ToLowerInvariant()))
                .Select(file => Path.GetFileName(file)!)
                .ToList();

            // 2. Obter o tempo de cooldown (em horas) das configurações.
            var cooldownHours = await _settingsService.GetSongCooldownHoursAsync();

            // Se o cooldown for 0 ou menor, a regra está desligada, então retornamos todas as músicas.
            if (cooldownHours <= 0)
            {
                return allVideoFiles;
            }

            // 3. Calcular o ponto de corte no tempo.
            var cooldownThreshold = DateTime.UtcNow.AddHours(-cooldownHours);

            // 4. Pedir ao repositório todas as músicas que tocaram DEPOIS desse ponto de corte.
            var recentlyPlayedLogs = await _playedSongLogRepository.GetLogsSinceAsync(cooldownThreshold);
            var recentlyPlayedSongs = new HashSet<string>(recentlyPlayedLogs.Select(log => log.SongName));

            // 5. Filtrar a lista completa, removendo as músicas que estão na lista de "tocadas recentemente".
            var availableSongs = allVideoFiles.Where(song => !recentlyPlayedSongs.Contains(song)).ToList();

            return availableSongs;
        }

        public Stream? GetVideoStream(string fileName)
        {
            var filePath = Path.Combine(_videoFolderPath, fileName);
            if (!File.Exists(filePath))
            {
                return null;
            }
            return new FileStream(filePath, FileMode.Open, FileAccess.Read);
        }
    }
}

