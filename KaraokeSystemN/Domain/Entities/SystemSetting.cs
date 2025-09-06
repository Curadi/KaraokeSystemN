using System.ComponentModel.DataAnnotations;

namespace KaraokeSystemN.Domain.Entities
{
    public class SystemSetting
    {
        // A "chave" da configuração, ex: "PreventDuplicateUserInQueue"
        [Key]
        [Required]
        public string Key { get; set; } = string.Empty;

        // O valor da configuração, ex: "true" ou "false"
        [Required]
        public string Value { get; set; } = string.Empty;
    }
}
