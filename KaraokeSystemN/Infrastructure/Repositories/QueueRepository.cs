using KaraokeSystemN.Domain.Entities;
using KaraokeSystemN.Domain.Interfaces;
using KaraokeSystemN.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace KaraokeSystemN.Infrastructure.Repositories
{
    public class QueueRepository : IQueueRepository
    {
        private readonly ApplicationDbContext _context;

        public QueueRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<QueueItem>> GetQueueAsync()
        {
            return await _context.QueueItems.OrderBy(q => q.RequestedAt).ToListAsync();
        }

        public async Task AddToQueueAsync(QueueItem item)
        {
            await _context.QueueItems.AddAsync(item);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> ExistsByUsernameAsync(string username)
        {
            return await _context.QueueItems.AnyAsync(q => q.UserName == username);
        }

        public async Task<QueueItem?> GetNextAsync()
        {
            return await _context.QueueItems.OrderBy(q => q.RequestedAt).FirstOrDefaultAsync();
        }

        public async Task RemoveAsync(QueueItem item)
        {
            _context.QueueItems.Remove(item);
            await _context.SaveChangesAsync();
        }
        public async Task<QueueItem?> GetByIdAsync(int id)
        {
            return await _context.QueueItems.FindAsync(id);
        }

        public async Task<IEnumerable<QueueItem>> GetByUsernameAsync(string username)
        {
            return await _context.QueueItems
                .Where(q => q.UserName == username)
                .OrderBy(q => q.RequestedAt)
                .ToListAsync();
        }

        public async Task UpdateAsync(QueueItem item)
        {
            _context.QueueItems.Update(item);
            await _context.SaveChangesAsync();
        }

    }
}

