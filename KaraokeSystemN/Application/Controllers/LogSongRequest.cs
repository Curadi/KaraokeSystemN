using KaraokeSystemN.Domain.Entities;
using KaraokeSystemN.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace KaraokeSystemN.Application.Controllers
{
    public class LogSongRequest
    {
        public string SongName { get; set; } = string.Empty;
    }

    [ApiController]
    [Route("api/log")]
    [Authorize(Roles = "admin")]
    public class PlayedSongLogController : ControllerBase
    {
        private readonly IPlayedSongLogRepository _playedSongLogRepository;

        public PlayedSongLogController(IPlayedSongLogRepository playedSongLogRepository)
        {
            _playedSongLogRepository = playedSongLogRepository;
        }

        [HttpPost("played")]
        public async Task<IActionResult> LogAsPlayed([FromBody] LogSongRequest request)
        {
            if (string.IsNullOrEmpty(request.SongName))
            {
                return BadRequest("SongName é obrigatório.");
            }

            var log = new PlayedSongLog
            {
                SongName = request.SongName,
                PlayedAt = DateTime.UtcNow
            };

            await _playedSongLogRepository.AddAsync(log);
            return Ok(new { message = "Música registada com sucesso." });
        }
    }
}
