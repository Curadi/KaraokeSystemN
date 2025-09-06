using KaraokeSystemN.Domain.Interfaces;
using System.Threading.Tasks;

namespace KaraokeSystemN.Application.Services
{
    public class SettingsService
    {
        private readonly ISettingsRepository _settingsRepository;
        private const string PreventDuplicatesKey = "PreventDuplicateUserInQueue";
        private const string SongCooldownKey = "SongCooldownHours";
        // Nova constante para a chave de configuração
        private const string ConfirmationTimeoutKey = "ConfirmationTimeoutSeconds";

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

        // --- NOVO MÉTODO PARA OBTER O TEMPO DE CONFIRMAÇÃO ---
        public async Task<int> GetConfirmationTimeoutSecondsAsync()
        {
            var setting = await _settingsRepository.GetSettingByKeyAsync(ConfirmationTimeoutKey);
            // Se a configuração não existir, retorna 20 como padrão.
            if (setting == null || !int.TryParse(setting.Value, out var seconds))
            {
                return 20;
            }
            return seconds;
        }

        // --- NOVO MÉTODO PARA DEFINIR O TEMPO DE CONFIRMAÇÃO ---
        public async Task SetConfirmationTimeoutSecondsAsync(int seconds)
        {
            await _settingsRepository.UpdateSettingAsync(ConfirmationTimeoutKey, seconds.ToString());
        }
    }
}

