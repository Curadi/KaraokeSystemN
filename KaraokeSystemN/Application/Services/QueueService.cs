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

        // --- MÉTODO EM FALTA ADICIONADO AQUI ---
        public async Task<bool> ChangeSpecificSongAsync(int queueItemId, string newSongName, string requesterUserName)
        {
            var itemToChange = await _queueRepository.GetByIdAsync(queueItemId);
            // Verifica se o item existe E se pertence ao utilizador que fez o pedido
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
                // Cenário 1: Utilizador está na fila e a regra está ATIVA -> TROCA a música
                firstItem.SongName = songName;
                await _queueRepository.UpdateAsync(firstItem);
            }
            else
            {
                // Cenário 2: Utilizador não está na fila, OU a regra está INATIVA -> ADICIONA uma nova música
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

