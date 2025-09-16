using KaraokeSystemN.Domain.Entities;
using KaraokeSystemN.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace KaraokeSystemN.Application.Controllers
{
    [ApiController]
    [Route("api/played-song-log")]
    [Authorize]
    public class PlayedSongLogController : ControllerBase
    {
        private readonly IPlayedSongLogRepository _playedSongLogRepository;

        public PlayedSongLogController(IPlayedSongLogRepository playedSongLogRepository)
        {
            _playedSongLogRepository = playedSongLogRepository;
        }

        public class LogRequest
        {
            public string SongName { get; set; } = string.Empty;
        }

        // Este endpoint é chamado pelo player de desktop quando um vídeo termina
        [HttpPost("log")]
        [Authorize(Roles = "admin")] // Apenas o player (controlado por um admin) pode registar uma música
        public async Task<IActionResult> LogPlayedSong([FromBody] LogRequest request)
        {
            if (string.IsNullOrEmpty(request.SongName))
            {
                return BadRequest("O nome da música é obrigatório.");
            }

            var log = new PlayedSongLog
            {
                SongName = request.SongName,
                PlayedAt = DateTime.UtcNow
            };

            await _playedSongLogRepository.AddAsync(log);
            return Ok(new { message = "Música registada no log com sucesso." });
        }
    }
}

