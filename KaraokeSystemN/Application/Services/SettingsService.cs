using KaraokeSystemN.Domain.Interfaces;
using System.Threading.Tasks;

namespace KaraokeSystemN.Application.Services
{
    public class SettingsService
    {
        private readonly ISettingsRepository _settingsRepository;
        private const string PreventDuplicatesKey = "PreventDuplicateUserInQueue";
        private const string SongCooldownHoursKey = "SongCooldownHours";

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

        // --- MÉTODO QUE ESTAVA EM FALTA ---
        public async Task<int> GetSongCooldownHoursAsync()
        {
            var setting = await _settingsRepository.GetSettingByKeyAsync(SongCooldownHoursKey);
            // Se não estiver definido, o padrão é 0 (sem cooldown)
            if (setting == null) return 0;
            return int.TryParse(setting.Value, out var hours) ? hours : 0;
        }

        public async Task SetSongCooldownHoursAsync(int hours)
        {
            await _settingsRepository.UpdateSettingAsync(SongCooldownHoursKey, hours.ToString());
        }
    }
}

