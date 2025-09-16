using KaraokeSystemN.Domain.Entities;
using KaraokeSystemN.Domain.Interfaces;
using KaraokeSystemN.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace KaraokeSystemN.Infrastructure.Repositories
{
    public class PlayedSongLogRepository : IPlayedSongLogRepository
    {
        private readonly ApplicationDbContext _context;

        public PlayedSongLogRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(PlayedSongLog log)
        {
            await _context.PlayedSongLogs.AddAsync(log);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<PlayedSongLog>> GetLogsSinceAsync(DateTime timestamp)
        {
            return await _context.PlayedSongLogs
                .Where(log => log.PlayedAt >= timestamp)
                .ToListAsync();
        }
    }
}

