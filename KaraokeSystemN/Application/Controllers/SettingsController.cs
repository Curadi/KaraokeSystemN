using KaraokeSystemN.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace KaraokeSystemN.Application.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "admin")]
    public class SettingsController : ControllerBase
    {
        private readonly SettingsService _settingsService;

        public SettingsController(SettingsService settingsService)
        {
            _settingsService = settingsService;
        }

        public class UpdateSettingsRequest
        {
            public bool PreventDuplicates { get; set; }
            public int CooldownHours { get; set; }
            // Nova propriedade para o tempo de confirmação
            public int ConfirmationTimeoutSeconds { get; set; }
        }

        [HttpGet]
        public async Task<IActionResult> GetSettings()
        {
            var preventDuplicates = await _settingsService.IsDuplicateUserPreventionEnabledAsync();
            var cooldownHours = await _settingsService.GetSongCooldownHoursAsync();
            var confirmationTimeoutSeconds = await _settingsService.GetConfirmationTimeoutSecondsAsync();

            return Ok(new { preventDuplicates, cooldownHours, confirmationTimeoutSeconds });
        }

        [HttpPost]
        public async Task<IActionResult> UpdateSettings([FromBody] UpdateSettingsRequest request)
        {
            await _settingsService.SetDuplicateUserPreventionAsync(request.PreventDuplicates);
            await _settingsService.SetSongCooldownHoursAsync(request.CooldownHours);
            await _settingsService.SetConfirmationTimeoutSecondsAsync(request.ConfirmationTimeoutSeconds);

            return Ok(new { message = "Configurações guardadas com sucesso." });
        }
    }
}

