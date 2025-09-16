using KaraokeSystemN.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.IO;
using System.Threading.Tasks;

namespace KaraokeSystemN.Application.Controllers
{
    [ApiController]
    [Route("api/videos")] 
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
        public async Task<IActionResult> GetVideoStream(string fileName)
        {
            var videoStream = await _videoService.GetVideoStream(fileName);
            if (videoStream == null)
            {
                return NotFound();
            }

            var contentType = "video/mp4";
            return File(videoStream, contentType, enableRangeProcessing: true);
        }

        private string GetContentType(string fileName)
        {
            var ext = Path.GetExtension(fileName).ToLowerInvariant();
            return ext switch
            {
                ".mp4" => "video/mp4",
                ".webm" => "video/webm",
                ".mkv" => "video/x-matroska",
                ".mov" => "video/quicktime",
                _ => "application/octet-stream", 
            };
        }
    }
}

