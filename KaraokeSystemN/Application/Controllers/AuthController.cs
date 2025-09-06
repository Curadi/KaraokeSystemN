using KaraokeSystemN.Application.Services;
using KaraokeSystemN.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace KaraokeSystemN.Application.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AuthenticationService _authService;

        public AuthController(AuthenticationService authService)
        {
            _authService = authService;
        }

        // DTOs para os requests
        public class RegisterRequest
        {
            public string Username { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
        }

        public class LoginRequest
        {
            public string Username { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterRequest request)
        {
            var user = await _authService.RegisterAsync(request.Username, request.Password);

            if (user == null)
            {
                return BadRequest(new { message = "Nome de usuário já existe." });
            }

            return Ok(new { message = "Usuário registrado com sucesso." });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequest request)
        {
            var (user, token) = await _authService.AuthenticateAsync(request.Username, request.Password);

            if (user == null || token == null)
            {
                return Unauthorized(new { message = "Nome de usuário ou senha inválidos." });
            }

            return Ok(new { token, username = user.Username });
        }
    }
}

