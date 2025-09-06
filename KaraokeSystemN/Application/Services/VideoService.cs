using KaraokeSystemN.Domain.Interfaces;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace KaraokeSystemN.Application.Services
{
    public class VideoService
    {
        private readonly string _videoFolderPath;
        // --- LISTA DE EXTENSÕES ATUALIZADA ---
        // Adicionamos os formatos .webm e .mkv, que são comuns na web.
        // Removemos .avi e .wmv, que não são suportados pelos navegadores.
        private readonly List<string> _supportedExtensions = new List<string> { ".mp4", ".webm", ".mkv", ".mov" };
        private readonly IPlayedSongLogRepository _playedSongLogRepository;
        private readonly SettingsService _settingsService;

        public VideoService(IConfiguration configuration, IPlayedSongLogRepository playedSongLogRepository, SettingsService settingsService)
        {
            _videoFolderPath = configuration.GetValue<string>("VideoSettings:FolderPath") ?? string.Empty;
            _playedSongLogRepository = playedSongLogRepository;
            _settingsService = settingsService;
        }

        private string? GetVideoPath(string fileName)
        {
            if (string.IsNullOrEmpty(_videoFolderPath) || !Directory.Exists(_videoFolderPath))
            {
                return null;
            }
            // Constrói o caminho completo e verifica se o ficheiro existe para evitar erros.
            var filePath = Path.Combine(_videoFolderPath, fileName);
            return File.Exists(filePath) ? filePath : null;
        }

        public Stream? GetVideoStream(string fileName)
        {
            var filePath = GetVideoPath(fileName);
            if (filePath == null)
            {
                return null;
            }
            return new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.Read);
        }

        public async Task<IEnumerable<string>> GetAvailableVideoFilesAsync()
        {
            if (string.IsNullOrEmpty(_videoFolderPath) || !Directory.Exists(_videoFolderPath))
            {
                return Enumerable.Empty<string>();
            }

            var allVideoFiles = Directory.EnumerateFiles(_videoFolderPath)
                .Where(file => _supportedExtensions.Contains(Path.GetExtension(file).ToLowerInvariant()))
                .Select(Path.GetFileName);

            var cooldownHours = await _settingsService.GetSongCooldownHoursAsync();
            if (cooldownHours <= 0)
            {
                return allVideoFiles.ToList();
            }

            var cooldownThreshold = DateTime.UtcNow.AddHours(-cooldownHours);
            var playedSongs = await _playedSongLogRepository.GetLogsSinceAsync(cooldownThreshold);
            var playedSongNames = new HashSet<string>(playedSongs.Select(p => p.SongName));

            return allVideoFiles.Where(fileName => !playedSongNames.Contains(fileName)).ToList();
        }
    }
}

