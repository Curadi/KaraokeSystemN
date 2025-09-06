using KaraokeSystemN.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace KaraokeSystemN.Domain.Interfaces
{
    public interface IPlayedSongLogRepository
    {
        Task AddAsync(PlayedSongLog log);
        Task<IEnumerable<PlayedSongLog>> GetLogsSinceAsync(DateTime timestamp);
    }
}