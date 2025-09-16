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

        public class AddToQueueRequest { public string SongName { get; set; } = string.Empty; }
        public class ChangeSongRequest { public string SongName { get; set; } = string.Empty; }
        public class SetSongRequest { public string SongName { get; set; } = string.Empty; }

        [HttpPost("add")]
        public async Task<IActionResult> AddSong([FromBody] AddToQueueRequest request)
        {
            var userName = User.FindFirst(ClaimTypes.Name)?.Value;
            if (string.IsNullOrEmpty(userName)) return Unauthorized();

            var success = await _queueService.AddToQueueAsync(userName, request.SongName);
            if (!success) return Conflict(new { message = "Não foi possível adicionar a música. Verifique as regras do sistema." });

            return Ok(new { message = "Música adicionada com sucesso!" });
        }

        [HttpPost("set-song")]
        public async Task<IActionResult> SetSong([FromBody] SetSongRequest request)
        {
            var userName = User.FindFirst(ClaimTypes.Name)?.Value;
            if (string.IsNullOrEmpty(userName)) return Unauthorized();

            await _queueService.SetUserSongAsync(userName, request.SongName);
            return Ok(new { message = "A sua escolha foi registada com sucesso!" });
        }

        [HttpGet("my-songs")]
        public async Task<IActionResult> GetMySongs()
        {
            var userName = User.FindFirst(ClaimTypes.Name)?.Value;
            if (string.IsNullOrEmpty(userName)) return Unauthorized();

            var songs = await _queueService.GetUserSongsAsync(userName);
            var queue = (await _queueService.GetQueueAsync()).ToList();

            var userSongsWithPosition = songs.Select(s => {
                var queueItem = queue.FirstOrDefault(q => q.Id == s.Id);
                var position = queueItem != null ? queue.IndexOf(queueItem) + 1 : 0;
                return new { id = s.Id, songName = s.SongName, position };
            });

            return Ok(userSongsWithPosition);
        }

        [HttpPut("change/{id}")]
        public async Task<IActionResult> ChangeSpecificSong(int id, [FromBody] ChangeSongRequest request)
        {
            var userName = User.FindFirst(ClaimTypes.Name)?.Value;
            if (string.IsNullOrEmpty(userName)) return Unauthorized();

            var success = await _queueService.ChangeSpecificSongAsync(id, request.SongName, userName);
            if (!success) return Forbid("Não foi possível trocar a música.");

            return Ok(new { message = "Música trocada com sucesso!" });
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

        [HttpGet("next")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> GetNextInQueue()
        {
            var nextItem = await _queueService.GetAndRemoveNextAsync();
            if (nextItem == null) return Ok(new { });

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
            if (!success) return NotFound(new { message = "Usuário não encontrado na fila." });

            return Ok(new { message = "Usuário removido da fila com sucesso." });
        }
    }
}




