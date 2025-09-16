using KaraokeSystemN.Domain.Entities;
using KaraokeSystemN.Domain.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace KaraokeSystemN.Application.Services
{
    public class QueueService
    {
        private readonly IQueueRepository _queueRepository;
        private readonly SettingsService _settingsService;

        public QueueService(IQueueRepository queueRepository, SettingsService settingsService)
        {
            _queueRepository = queueRepository;
            _settingsService = settingsService;
        }

        public async Task<bool> AddToQueueAsync(string userName, string songName)
        {
            var isDuplicatePreventionEnabled = await _settingsService.IsDuplicateUserPreventionEnabledAsync();
            if (isDuplicatePreventionEnabled)
            {
                var userHasSong = await _queueRepository.ExistsByUsernameAsync(userName);
                if (userHasSong) return false;
            }

            var newItem = new QueueItem { UserName = userName, SongName = songName };
            await _queueRepository.AddToQueueAsync(newItem);
            return true;
        }

        public async Task<bool> ChangeSpecificSongAsync(int queueItemId, string newSongName, string requesterUserName)
        {
            var itemToChange = await _queueRepository.GetByIdAsync(queueItemId);
            if (itemToChange != null && itemToChange.UserName == requesterUserName)
            {
                itemToChange.SongName = newSongName;
                await _queueRepository.UpdateAsync(itemToChange);
                return true;
            }
            return false;
        }

        public async Task SetUserSongAsync(string userName, string songName)
        {
            var isDuplicatePreventionEnabled = await _settingsService.IsDuplicateUserPreventionEnabledAsync();
            var userQueueItems = await _queueRepository.GetByUsernameAsync(userName);
            var firstItem = userQueueItems.FirstOrDefault();

            if (firstItem != null && isDuplicatePreventionEnabled)
            {
                firstItem.SongName = songName;
                await _queueRepository.UpdateAsync(firstItem);
            }
            else
            {
                var newItem = new QueueItem { UserName = userName, SongName = songName };
                await _queueRepository.AddToQueueAsync(newItem);
            }
        }

        public Task<IEnumerable<QueueItem>> GetQueueAsync()
        {
            return _queueRepository.GetQueueAsync();
        }

        public async Task<IEnumerable<QueueItem>> GetUserSongsAsync(string userName)
        {
            return await _queueRepository.GetByUsernameAsync(userName);
        }
        public async Task<QueueItem?> GetNextAsync()
        {
            return await _queueRepository.GetNextAsync();
        }

        public async Task<QueueItem?> GetAndRemoveNextAsync()
        {
            var nextItem = await _queueRepository.GetNextAsync();
            if (nextItem != null)
            {
                await _queueRepository.RemoveAsync(nextItem);
            }
            return nextItem;
        }

        public async Task<bool> RemoveByIdAsync(int id)
        {
            var itemToRemove = await _queueRepository.GetByIdAsync(id);
            if (itemToRemove != null)
            {
                await _queueRepository.RemoveAsync(itemToRemove);
                return true;
            }
            return false;
        }

    }
}

