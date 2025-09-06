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

        public QueueController(QueueService queueService)
        {
            _queueService = queueService;
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
                Id = item.Id,
                UserName = item.UserName,
                SongName = item.SongName,
                Position = index + 1
            });
            return Ok(response);
        }
    }
}

