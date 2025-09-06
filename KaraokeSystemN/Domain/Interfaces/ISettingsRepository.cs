using KaraokeSystemN.Domain.Entities;
using System.Threading.Tasks;

namespace KaraokeSystemN.Domain.Interfaces
{
    public interface ISettingsRepository
    {
        Task<SystemSetting?> GetSettingByKeyAsync(string key);
        Task UpdateSettingAsync(string key, string value);
    }
}

