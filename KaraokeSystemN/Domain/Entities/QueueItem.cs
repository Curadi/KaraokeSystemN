using System;
using System.ComponentModel.DataAnnotations;

namespace KaraokeSystemN.Domain.Entities
{
    public class QueueItem
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string UserName { get; set; } = string.Empty; // Inicializado para remover o aviso

        [Required]
        public string SongName { get; set; } = string.Empty; // Inicializado para remover o aviso

        public DateTime RequestedAt { get; set; } = DateTime.UtcNow;
    }
}
