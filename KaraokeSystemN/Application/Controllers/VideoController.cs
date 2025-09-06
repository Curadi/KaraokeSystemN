using KaraokeSystemN.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace KaraokeSystemN.Application.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class VideosController : ControllerBase
    {
        private readonly VideoService _videoService;

        public VideosController(VideoService videoService)
        {
            _videoService = videoService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAvailableVideos()
        {
            var videoFiles = await _videoService.GetAvailableVideoFilesAsync();
            return Ok(videoFiles);
        }

        // Este endpoint é para o player obter o ficheiro de vídeo
        [HttpGet("{fileName}")]
        public IActionResult GetVideoStream(string fileName)
        {
            // CORREÇÃO: A chamada agora usa o método correto 'GetVideoStream'
            var videoStream = _videoService.GetVideoStream(fileName);
            if (videoStream == null)
            {
                return NotFound();
            }

            // Retorna o ficheiro como um stream, habilitando o range processing para permitir
            // que o navegador avance e retroceda no vídeo.
            return File(videoStream, "video/mp4", enableRangeProcessing: true);
        }
    }
}

