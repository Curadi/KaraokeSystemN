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
        private static bool _isPlaying = false;
        private readonly QueueService _queueService;

        public PlayerController(QueueService queueService)
        {
            _queueService = queueService;
        }

        // Endpoint para o player verificar se deve buscar uma nova música
        [HttpGet("next")]
        public async Task<IActionResult> GetNextSong()
        {
            // Se já houver um vídeo a tocar, não faz nada.
            if (_isPlaying)
            {
                return Ok(new { }); // Retorna um objeto vazio
            }

            var nextItem = await _queueService.GetAndRemoveNextAsync();
            if (nextItem == null)
            {
                return Ok(new { }); // Fila vazia
            }

            _isPlaying = true; // Marca que um vídeo está prestes a tocar
            return Ok(nextItem);
        }

        // Endpoint para o player informar que o vídeo terminou
        [HttpPost("finished")]
        public IActionResult MarkAsFinished()
        {
            _isPlaying = false; // Libera o player para a próxima música
            return Ok();
        }
    }
}
