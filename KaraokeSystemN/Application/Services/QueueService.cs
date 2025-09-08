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

        public Task<IEnumerable<QueueItem>> GetQueueAsync()
        {
            return _queueRepository.GetQueueAsync();
        }

        public async Task<bool> AddToQueueAsync(string userName, string songName)
        {
            var isDuplicatePreventionEnabled = await _settingsService.IsDuplicateUserPreventionEnabledAsync();
            var userAlreadyInQueue = await _queueRepository.ExistsByUsernameAsync(userName);

            if (isDuplicatePreventionEnabled && userAlreadyInQueue)
            {
                return false;
            }

            var newItem = new QueueItem
            {
                UserName = userName,
                SongName = songName
            };
            await _queueRepository.AddToQueueAsync(newItem);

            return true;
        }

        // --- MÉTODO CORRIGIDO E REINTRODUZIDO ---
        // Este método agora contém a lógica completa para buscar e remover
        // o próximo item da fila, como o controller espera.
        public async Task<QueueItem?> GetAndRemoveNextAsync()
        {
            // Primeiro, busca o próximo item do repositório
            var nextItem = await _queueRepository.GetNextAsync();

            // Se um item for encontrado, remove-o do repositório
            if (nextItem != null)
            {
                await _queueRepository.RemoveAsync(nextItem);
            }

            // Retorna o item que foi encontrado (ou nulo se a fila estiver vazia)
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

