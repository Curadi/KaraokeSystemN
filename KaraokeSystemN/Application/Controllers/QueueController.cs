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

        public class AddToQueueRequest
        {
            public string SongName { get; set; } = string.Empty;
        }

        [HttpPost("add")]
        public async Task<IActionResult> AddToQueue([FromBody] AddToQueueRequest request)
        {
            var userName = User.FindFirst(ClaimTypes.Name)?.Value;
            if (string.IsNullOrEmpty(userName))
            {
                return Unauthorized();
            }

            var success = await _queueService.AddToQueueAsync(userName, request.SongName);
            if (!success)
            {
                return Conflict(new { message = "Você já possui uma música na fila." });
            }
            return Ok(new { message = "Música adicionada à fila com sucesso!" });
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
            if (nextItem == null)
            {
                return Ok(new { });
            }

            // Busca o tempo de confirmação configurado pelo admin
            var confirmationTimeout = await _settingsService.GetConfirmationTimeoutSecondsAsync();

            // Retorna os detalhes da música E o tempo de confirmação
            return Ok(new
            {
                songName = nextItem.SongName,
                userName = nextItem.UserName,
                confirmationTimeout // Envia o tempo para o frontend
            });
        }
    }
}

