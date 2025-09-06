using KaraokeSystemN.Domain.Entities;
using KaraokeSystemN.Domain.Interfaces;
using KaraokeSystemN.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace KaraokeSystemN.Infrastructure.Repositories
{
    public class SettingsRepository : ISettingsRepository
    {
        private readonly ApplicationDbContext _context;

        public SettingsRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<SystemSetting?> GetSettingByKeyAsync(string key)
        {
            return await _context.SystemSettings
                .FirstOrDefaultAsync(s => s.Key == key);
        }

        public async Task UpdateSettingAsync(string key, string value)
        {
            var setting = await GetSettingByKeyAsync(key);

            if (setting != null)
            {
                setting.Value = value;
            }
            else
            {
                setting = new SystemSetting { Key = key, Value = value };
                _context.SystemSettings.Add(setting);
            }

            await _context.SaveChangesAsync();
        }
    }
}

