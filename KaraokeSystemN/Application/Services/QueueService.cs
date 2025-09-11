using KaraokeSystemN.Domain.Entities;
using KaraokeSystemN.Domain.Interfaces;
using System.Collections.Generic;
using System.Linq; // Importante: Adicionar esta referência para usar .FirstOrDefault()
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

        // Este é o método inteligente que o frontend usa para adicionar ou trocar
        public async Task SetUserSongAsync(string userName, string songName)
        {
            var isDuplicatePreventionEnabled = await _settingsService.IsDuplicateUserPreventionEnabledAsync();
            var userQueueItems = await _queueRepository.GetByUsernameAsync(userName);
            var firstItem = userQueueItems.FirstOrDefault();

            if (firstItem != null && isDuplicatePreventionEnabled)
            {
                // Se a regra de duplicados estiver ativa, troca a primeira música
                firstItem.SongName = songName;
                await _queueRepository.UpdateAsync(firstItem);
            }
            else
            {
                // Se a regra estiver inativa, ou se o utilizador não tiver músicas, adiciona uma nova
                var newItem = new QueueItem { UserName = userName, SongName = songName };
                await _queueRepository.AddToQueueAsync(newItem);
            }
        }

        public async Task<IEnumerable<QueueItem>> GetUserSongsAsync(string userName)
        {
            return await _queueRepository.GetByUsernameAsync(userName);
        }

        // --- ESTE É O MÉTODO CORRIGIDO DA SUA IMAGEM ---
        public async Task<bool> ChangeSongAsync(string userName, string newSongName)
        {
            // Busca a LISTA de músicas do utilizador.
            var userQueueItems = await _queueRepository.GetByUsernameAsync(userName);
            // Pega o primeiro item da lista para o atualizar.
            var itemToChange = userQueueItems.FirstOrDefault();

            if (itemToChange != null)
            {
                itemToChange.SongName = newSongName;
                await _queueRepository.UpdateAsync(itemToChange);
                return true; // Sucesso
            }
            return false; // Utilizador não encontrado na fila
        }

        // Outros métodos de serviço que já tínhamos implementado
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

