using KaraokeSystemN.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace KaraokeSystemN.Application.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class QueueController : ControllerBase
    {
        private readonly QueueService _queueService;
        private readonly SettingsService _settingsService;

        public QueueController(QueueService queueService, SettingsService settingsService)
        {
            _queueService = queueService;
            _settingsService = settingsService;
        }

        // --- ESTE DTO (Data Transfer Object) É USADO PELO NOSSO NOVO MÉTODO ---
        public class SetSongRequest
        {
            public string SongName { get; set; } = string.Empty;
        }

        // --- ESTE É O NOVO ENDPOINT INTELIGENTE ---
        // O frontend irá agora chamar este único endpoint para adicionar OU trocar uma música.
        [HttpPost("set-song")]
        public async Task<IActionResult> SetSong([FromBody] SetSongRequest request)
        {
            var userName = User.FindFirst(ClaimTypes.Name)?.Value;
            if (string.IsNullOrEmpty(userName))
            {
                return Unauthorized();
            }

            // Chamamos o método correto no serviço, que contém toda a lógica.
            await _queueService.SetUserSongAsync(userName, request.SongName);

            return Ok(new { message = "A sua escolha foi registada com sucesso!" });
        }

        [HttpGet]
        public async Task<IActionResult> GetQueue()
        {
            var queueItems = await _queueService.GetQueueAsync();
            var response = queueItems.Select((item, index) => new
            {
                id = item.Id,
                userName = item.UserName,
                songName = item.SongName,
                position = index + 1
            });
            return Ok(response);
        }

        [HttpGet("my-song")]
        public async Task<IActionResult> GetMySongs() // Renomeado para maior clareza
        {
            var userName = User.FindFirst(ClaimTypes.Name)?.Value;
            if (string.IsNullOrEmpty(userName))
            {
                return Unauthorized();
            }

            var songs = await _queueService.GetUserSongsAsync(userName);
            return Ok(songs.Select(s => new { songName = s.SongName }));
        }

        [HttpGet("next")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> GetNextInQueue()
        {
            var nextItem = await _queueService.GetAndRemoveNextAsync();
            if (nextItem == null)
            {
                return Ok(new { });
            }

            var confirmationTimeout = await _settingsService.GetConfirmationTimeoutSecondsAsync();

            return Ok(new
            {
                songName = nextItem.SongName,
                userName = nextItem.UserName,
                confirmationTimeout
            });
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> RemoveFromQueue(int id)
        {
            var success = await _queueService.RemoveByIdAsync(id);
            if (!success)
            {
                return NotFound(new { message = "Item não encontrado na fila." });
            }
            return Ok(new { message = "Item removido da fila com sucesso." });
        }
    }
}

