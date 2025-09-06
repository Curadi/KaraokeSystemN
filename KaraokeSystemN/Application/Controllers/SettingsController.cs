using KaraokeSystemN.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace KaraokeSystemN.Application.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "admin")] // Protege todos os endpoints neste controller
    public class SettingsController : ControllerBase
    {
        private readonly SettingsService _settingsService;

        public SettingsController(SettingsService settingsService)
        {
            _settingsService = settingsService;
        }

        // DTO para o request de atualização de configurações
        public class UpdateSettingsRequest
        {
            public bool PreventDuplicates { get; set; }
            public int CooldownHours { get; set; }
        }

        [HttpGet]
        public async Task<IActionResult> GetSettings()
        {
            var preventDuplicates = await _settingsService.IsDuplicateUserPreventionEnabledAsync();
            var cooldownHours = await _settingsService.GetSongCooldownHoursAsync();

            return Ok(new { preventDuplicates, cooldownHours });
        }

        [HttpPost]
        public async Task<IActionResult> UpdateSettings([FromBody] UpdateSettingsRequest request)
        {
            // Usa os nomes de método corretos do SettingsService
            await _settingsService.SetDuplicateUserPreventionAsync(request.PreventDuplicates);
            await _settingsService.SetSongCooldownHoursAsync(request.CooldownHours);

            return Ok(new { message = "Configurações guardadas com sucesso." });
        }
    }
}




