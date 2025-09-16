using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using KaraokeSystemN.Domain.Interfaces;

namespace KaraokeSystemN.Application.Services
{
    public class VideoService
    {
        private readonly IPlayedSongLogRepository _playedSongLogRepository;
        private readonly SettingsService _settingsService;
        private readonly IQueueRepository _queueRepository;
        private readonly List<string> _supportedExtensions = new List<string> { ".mp4", ".webm", ".mkv", ".mov", ".avi" };

        public VideoService(
            IPlayedSongLogRepository playedSongLogRepository,
            SettingsService settingsService,
            IQueueRepository queueRepository)
        {
            _playedSongLogRepository = playedSongLogRepository;
            _settingsService = settingsService;
            _queueRepository = queueRepository;
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
            if (string.IsNullOrEmpty(originalVideosPath) || !Directory.Exists(originalVideosPath))
            {
                return Enumerable.Empty<string>();
            }

            var allVideoFiles = Directory.EnumerateFiles(originalVideosPath)
                .Where(file => _supportedExtensions.Contains(Path.GetExtension(file).ToLowerInvariant()))
                .Select(Path.GetFileName)
                .Where(fileName => !string.IsNullOrEmpty(fileName));

            var songsInQueue = await _queueRepository.GetQueueAsync();
            var songsInQueueNames = new HashSet<string>(songsInQueue.Select(q => q.SongName));

            var cooldownHours = await _settingsService.GetSongCooldownHoursAsync();
            var playedSongNames = new HashSet<string>();
            if (cooldownHours > 0)
            {
                var cooldownThreshold = DateTime.UtcNow.AddHours(-cooldownHours);
                var playedSongs = await _playedSongLogRepository.GetLogsSinceAsync(cooldownThreshold);
                playedSongNames = new HashSet<string>(playedSongs.Select(p => p.SongName));
                return allVideoFiles
                .Where(fileName => !songsInQueueNames.Contains(fileName!))
                .Where(fileName => !playedSongNames.Contains(fileName!))
                .ToList();
            }
            else
            {
                return allVideoFiles;
            }
        }
    }
}

