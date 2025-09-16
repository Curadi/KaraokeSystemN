using KaraokeSystemN.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;

namespace KaraokeSystemN.Infrastructure.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<KaraokeSystemN.Domain.Entities.User> User { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("users");
            });
        }
        public DbSet<QueueItem> QueueItems { get; set; }
        public DbSet<SystemSetting> SystemSettings { get; set; }
        public DbSet<PlayedSongLog> PlayedSongLogs { get; set; } = null!;
    }
}
