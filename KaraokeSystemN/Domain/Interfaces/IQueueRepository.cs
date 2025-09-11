using KaraokeSystemN.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace KaraokeSystemN.Domain.Interfaces
{
    public interface IQueueRepository
    {
        Task<IEnumerable<QueueItem>> GetQueueAsync();
        Task AddToQueueAsync(QueueItem item);
        Task<bool> ExistsByUsernameAsync(string username);
        Task<QueueItem?> GetNextAsync();
        Task RemoveAsync(QueueItem item);
        Task<QueueItem?> GetByIdAsync(int id);
        // --- MÉTODO ATUALIZADO ---
        // Agora busca uma LISTA de músicas por nome de utilizador.
        Task<IEnumerable<QueueItem>> GetByUsernameAsync(string username);
        Task UpdateAsync(QueueItem item);
    }
}