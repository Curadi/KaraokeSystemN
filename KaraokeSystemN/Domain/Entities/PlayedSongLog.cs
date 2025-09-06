using System;
using System.ComponentModel.DataAnnotations;

namespace KaraokeSystemN.Domain.Entities
{
    public class PlayedSongLog
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string SongName { get; set; } = string.Empty;

        [Required]
        public DateTime PlayedAt { get; set; }
    }
}

