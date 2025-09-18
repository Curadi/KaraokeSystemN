using KaraokeSystemN.Domain.Interfaces;
using System.Threading.Tasks;

namespace KaraokeSystemN.Application.Services
{
    public class SettingsService
    {
        private readonly ISettingsRepository _settingsRepository;
        private const string PreventDuplicatesKey = "PreventDuplicateUserInQueue";
        private const string SongCooldownKey = "SongCooldownHours";
        private const string ConfirmationTimeoutKey = "ConfirmationTimeoutSeconds";
        private const string OriginalVideosPathKey = "OriginalVideosPath";
        private const string ConvertedVideosPathKey = "ConvertedVideosPath";
        private const string MenuPathKey = "MenuPath";

        public SettingsService(ISettingsRepository settingsRepository)
        {
            _settingsRepository = settingsRepository;
        }

        public async Task<bool> IsDuplicateUserPreventionEnabledAsync()
        {
            var setting = await _settingsRepository.GetSettingByKeyAsync(PreventDuplicatesKey);
            if (setting == null) return true;
            return bool.TryParse(setting.Value, out var isEnabled) && isEnabled;
        }

        public async Task SetDuplicateUserPreventionAsync(bool isEnabled)
        {
            await _settingsRepository.UpdateSettingAsync(PreventDuplicatesKey, isEnabled.ToString().ToLower());
        }

        public async Task<int> GetSongCooldownHoursAsync()
        {
            var setting = await _settingsRepository.GetSettingByKeyAsync(SongCooldownKey);
            if (setting == null || !int.TryParse(setting.Value, out var hours))
            {
                return 0;
            }
            return hours;
        }

        public async Task SetSongCooldownHoursAsync(int hours)
        {
            await _settingsRepository.UpdateSettingAsync(SongCooldownKey, hours.ToString());
        }

        public async Task<int> GetConfirmationTimeoutSecondsAsync()
        {
            var setting = await _settingsRepository.GetSettingByKeyAsync(ConfirmationTimeoutKey);
            if (setting == null || !int.TryParse(setting.Value, out var seconds))
            {
                return 20;
            }
            return seconds;
        }

        public async Task SetConfirmationTimeoutSecondsAsync(int seconds)
        {
            await _settingsRepository.UpdateSettingAsync(ConfirmationTimeoutKey, seconds.ToString());
        }
        public async Task<string> GetOriginalVideosPathAsync()
        {
            var setting = await _settingsRepository.GetSettingByKeyAsync(OriginalVideosPathKey);
            return setting?.Value ?? "/app/videos";
        }

        public async Task<string> GetConvertedVideosPathAsync()
        {
            var setting = await _settingsRepository.GetSettingByKeyAsync(ConvertedVideosPathKey);
            return setting?.Value ?? "/app/videos/converted";
        }

        public async Task SetOriginalVideosPathAsync(string path)
        {
            await _settingsRepository.UpdateSettingAsync(OriginalVideosPathKey, path);
        }

        public async Task SetConvertedVideosPathAsync(string path)
        {
            await _settingsRepository.UpdateSettingAsync(ConvertedVideosPathKey, path);
        }
        public async Task<string> GetMenuPathAsync()
        {
            var setting = await _settingsRepository.GetSettingByKeyAsync(MenuPathKey);
            return setting?.Value ?? "/app/assets";
        }

        public async Task SetMenuPathAsync(string path)
        {
            await _settingsRepository.UpdateSettingAsync(MenuPathKey, path);
        }
    }
}

