using KaraokeSystemN.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.IO; // Necessário para Path.GetExtension
using System.Threading.Tasks;

namespace KaraokeSystemN.Application.Controllers
{
    [ApiController]
    [Route("api/videos")] // Rota corrigida para o plural
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

        [HttpGet("{fileName}")]
        public IActionResult GetVideoStream(string fileName)
        {
            var videoStream = _videoService.GetVideoStream(fileName);
            if (videoStream == null)
            {
                return NotFound();
            }

            // --- ESTA É A LÓGICA DE CORREÇÃO ---
            // Determina o tipo de conteúdo com base na extensão do ficheiro.
            var contentType = GetContentType(fileName);
            return File(videoStream, contentType, enableRangeProcessing: true);
        }

        // Função auxiliar para obter o MIME type correto para cada formato de vídeo.
        private string GetContentType(string fileName)
        {
            var ext = Path.GetExtension(fileName).ToLowerInvariant();
            return ext switch
            {
                ".mp4" => "video/mp4",
                ".webm" => "video/webm",
                ".mkv" => "video/x-matroska",
                ".mov" => "video/quicktime",
                _ => "application/octet-stream", // Tipo genérico para outros casos
            };
        }
    }
}

