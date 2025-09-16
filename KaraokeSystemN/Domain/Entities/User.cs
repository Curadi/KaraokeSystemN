using System.ComponentModel.DataAnnotations;

namespace KaraokeSystemN.Domain.Entities
{
    public class User
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Username { get; set; } = string.Empty; 

        [Required]
        public string PasswordHash { get; set; } = string.Empty; 

        [Required]
        public string Role { get; set; } = "user";
    }
}

