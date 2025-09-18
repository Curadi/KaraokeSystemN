using KaraokeSystemN.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace KaraokeSystemN.Application.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Protege o acesso aos assets, garantindo que apenas utilizadores logados os vejam
    public class AssetsController : ControllerBase
    {
        private readonly SettingsService _settingsService;

        public AssetsController(SettingsService settingsService)
        {
            _settingsService = settingsService;
        }

        [HttpGet("menu")]
        public async Task<IActionResult> GetMenuPdf()
        {
            var menuPath = await _settingsService.GetMenuPathAsync();

            if (string.IsNullOrEmpty(menuPath) || !Directory.Exists(menuPath))
            {
                return NotFound("A pasta do cardápio não está configurada ou não foi encontrada.");
            }

            // Encontra o primeiro ficheiro .pdf na pasta configurada
            var pdfFile = Directory.EnumerateFiles(menuPath, "*.pdf").FirstOrDefault();

            if (pdfFile == null)
            {
                return NotFound("Nenhum ficheiro PDF de cardápio foi encontrado na pasta configurada.");
            }

            var stream = new FileStream(pdfFile, FileMode.Open, FileAccess.Read);
            return new FileStreamResult(stream, "application/pdf");
        }
    }
}
