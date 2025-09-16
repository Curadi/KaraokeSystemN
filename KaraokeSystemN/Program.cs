using KaraokeSystemN.Application.Services;
using KaraokeSystemN.Domain.Interfaces;
using KaraokeSystemN.Infrastructure.Data;
using KaraokeSystemN.Infrastructure.Repositories;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);
var networkIp = "192.168.1.4";

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddControllers();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowNextJs",
        policy => {
            policy.WithOrigins($"http://localhost:3000", $"http://{networkIp}:3000")
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials();
        });
});

var key = builder.Configuration["Jwt:Key"] ?? "JojosBizarreAdventureStarPlatinumZaWarudo#157931";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuers = new[] { builder.Configuration["Jwt:Issuer"], $"http://{networkIp}:7001" },
        ValidAudiences = new[] { builder.Configuration["Jwt:Audience"], $"http://{networkIp}:3000" },
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key))
    };
});

builder.Services.AddAuthorization();

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    options.UseNpgsql(connectionString);
});

// Injeção de Dependência
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<AuthenticationService>();
builder.Services.AddScoped<IQueueRepository, QueueRepository>();
builder.Services.AddScoped<QueueService>();
builder.Services.AddScoped<VideoService>();
builder.Services.AddScoped<ISettingsRepository, SettingsRepository>();
builder.Services.AddScoped<SettingsService>();
builder.Services.AddScoped<IPlayedSongLogRepository, PlayedSongLogRepository>();
builder.Services.AddScoped<VideoConversionService>();
builder.Services.AddSingleton<PlayerStatusService>();
builder.Services.AddSingleton<ConversionStatusService>();


var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();

    try
    {
        using var scope = app.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        dbContext.Database.Migrate();
    }
    catch (Exception ex)
    {
        Console.WriteLine($"--> OCORREU UM ERRO DURANTE A MIGRAÇÃO: {ex.Message}");
    }
}

app.UseRouting();
app.UseCors("AllowNextJs");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();