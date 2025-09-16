using KaraokeSystemN.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace KaraokeSystemN.Application.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "admin")]
    public class PlayerController : ControllerBase
    {
        private readonly PlayerStatusService _playerStatus;
        private readonly QueueService _queueService;
        private readonly SettingsService _settingsService;

        public PlayerController(PlayerStatusService playerStatus, QueueService queueService, SettingsService settingsService)
        {
            _playerStatus = playerStatus;
            _queueService = queueService;
            _settingsService = settingsService;
        }

        // Endpoint para o player "espiar" a próxima música
        [HttpGet("peek-next")]
        public async Task<IActionResult> PeekNext()
        {
            if (_playerStatus.IsPlaying())
            {
                return Ok(new { }); // Se um vídeo já estiver a tocar, não faz nada
            }

            var nextItem = await _queueService.GetNextAsync(); // Apenas busca, não remove
            if (nextItem == null)
            {
                return Ok(new { }); // A fila está vazia
            }

            var confirmationTimeout = await _settingsService.GetConfirmationTimeoutSecondsAsync();
            return Ok(new
            {
                songName = nextItem.SongName,
                userName = nextItem.UserName,
                confirmationTimeout
            });
        }

        // Endpoint para confirmar e tocar a próxima música
        [HttpPost("play-next")]
        public async Task<IActionResult> PlayNext()
        {
            if (_playerStatus.IsPlaying())
            {
                return Conflict(new { message = "Um vídeo já está a ser reproduzido." });
            }

            var itemToPlay = await _queueService.GetAndRemoveNextAsync(); // Agora, busca E remove
            if (itemToPlay == null)
            {
                return NotFound(new { message = "A fila está vazia." });
            }

            _playerStatus.SetIsPlaying(true); // Bloqueia o player
            return Ok(itemToPlay);
        }

        // Endpoint para informar que o player está livre novamente
        [HttpPost("finished")]
        public IActionResult MarkAsFinished()
        {
            _playerStatus.SetIsPlaying(false); // Liberta o player
            return Ok();
        }
    }
}

