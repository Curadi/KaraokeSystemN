using KaraokeSystemN.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace KaraokeSystemN.Application.Controllers
{
    [ApiController]
    [Route("api/settings")]
    [Authorize(Roles = "admin")]
    public class SettingsController : ControllerBase
    {
        private readonly SettingsService _settingsService;
        private readonly VideoConversionService _videoConversionService;
        private readonly ConversionStatusService _statusService;

        public SettingsController(
            SettingsService settingsService,
            VideoConversionService videoConversionService,
            ConversionStatusService statusService) // Adicionado aqui
        {
            _settingsService = settingsService;
            _videoConversionService = videoConversionService;
            // --- CORREÇÃO AQUI ---
            // O serviço de estado agora é inicializado corretamente.
            _statusService = statusService;
        }

        public class UpdateSettingsRequest
        {
            public bool PreventDuplicates { get; set; }
            public int CooldownHours { get; set; }
            public int ConfirmationTimeoutSeconds { get; set; }
            public string OriginalVideosPath { get; set; } = string.Empty;
            public string ConvertedVideosPath { get; set; } = string.Empty;
        }

        [HttpGet]
        public async Task<IActionResult> GetSettings()
        {
            var preventDuplicates = await _settingsService.IsDuplicateUserPreventionEnabledAsync();
            var cooldownHours = await _settingsService.GetSongCooldownHoursAsync();
            var confirmationTimeoutSeconds = await _settingsService.GetConfirmationTimeoutSecondsAsync();
            var originalVideosPath = await _settingsService.GetOriginalVideosPathAsync();
            var convertedVideosPath = await _settingsService.GetConvertedVideosPathAsync();

            return Ok(new { preventDuplicates, cooldownHours, confirmationTimeoutSeconds, originalVideosPath, convertedVideosPath });
        }

        [HttpPost]
        public async Task<IActionResult> UpdateSettings([FromBody] UpdateSettingsRequest request)
        {
            await _settingsService.SetDuplicateUserPreventionAsync(request.PreventDuplicates);
            await _settingsService.SetSongCooldownHoursAsync(request.CooldownHours);
            await _settingsService.SetConfirmationTimeoutSecondsAsync(request.ConfirmationTimeoutSeconds);
            await _settingsService.SetOriginalVideosPathAsync(request.OriginalVideosPath);
            await _settingsService.SetConvertedVideosPathAsync(request.ConvertedVideosPath);

            return Ok(new { message = "Configurações guardadas com sucesso." });
        }

        [HttpPost("convert-videos")]
        public IActionResult ConvertVideos()
        {
            // --- CORREÇÃO AQUI ---
            // Atualizamos o estado imediatamente para evitar a "race condition".
            _statusService.UpdateStatus("Pedido de conversão recebido. A iniciar...");
            _ = _videoConversionService.StartConversionProcessAsync();
            return Ok(new { message = "O processo de conversão de vídeos foi iniciado." });
        }

        [HttpGet("convert-videos/status")]
        public IActionResult GetConversionStatus()
        {
            return Ok(new { status = _statusService.CurrentStatus });
        }
    }
}

