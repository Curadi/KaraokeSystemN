using System;
using System.ComponentModel.DataAnnotations;

namespace KaraokeSystemN.Domain.Entities
{
    public class QueueItem
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string UserName { get; set; } = string.Empty; 

        [Required]
        public string SongName { get; set; } = string.Empty; 

        public DateTime RequestedAt { get; set; } = DateTime.UtcNow;
    }
}
