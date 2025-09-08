using KaraokeSystemN.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace KaraokeSystemN.Application.Services
{
    public class VideoService
    {
        private readonly IPlayedSongLogRepository _playedSongLogRepository;
        private readonly SettingsService _settingsService;
        private readonly List<string> _supportedExtensions = new List<string> { ".mp4", ".webm", ".mkv", ".mov", ".avi" };

        public VideoService(IPlayedSongLogRepository playedSongLogRepository, SettingsService settingsService)
        {
            _playedSongLogRepository = playedSongLogRepository;
            _settingsService = settingsService;
        }

        public async Task<Stream?> GetVideoStream(string fileName)
        {
            var originalVideosPath = await _settingsService.GetOriginalVideosPathAsync();
            var convertedVideosPath = await _settingsService.GetConvertedVideosPathAsync();

            var convertedFileName = Path.ChangeExtension(fileName, ".mp4");
            var convertedFilePath = Path.Combine(convertedVideosPath, convertedFileName);
            var originalFilePath = Path.Combine(originalVideosPath, fileName);

            var filePath = File.Exists(convertedFilePath) ? convertedFilePath : originalFilePath;

            return File.Exists(filePath) ? new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.Read) : null;
        }

        public async Task<IEnumerable<string>> GetAvailableVideoFilesAsync()
        {
            var originalVideosPath = await _settingsService.GetOriginalVideosPathAsync();
            // Adicionamos uma verificação extra para garantir que o caminho não é nulo ou vazio
            if (string.IsNullOrEmpty(originalVideosPath) || !Directory.Exists(originalVideosPath))
            {
                return Enumerable.Empty<string>();
            }

            var allVideoFiles = Directory.EnumerateFiles(originalVideosPath)
                .Where(file => _supportedExtensions.Contains(Path.GetExtension(file).ToLowerInvariant()))
                .Select(Path.GetFileName)
                .Where(fileName => fileName != null);

            var cooldownHours = await _settingsService.GetSongCooldownHoursAsync();
            if (cooldownHours <= 0) return allVideoFiles.ToList()!;

            var cooldownThreshold = DateTime.UtcNow.AddHours(-cooldownHours);
            var playedSongs = await _playedSongLogRepository.GetLogsSinceAsync(cooldownThreshold);
            var playedSongNames = new HashSet<string>(playedSongs.Select(p => p.SongName));

            return allVideoFiles.Where(fileName => !playedSongNames.Contains(fileName!)).ToList();
        }
    }
}

