namespace KaraokeSystemN.Domain.Interfaces
{
    public interface IUserRepository
    {
        Task<KaraokeSystemN.Domain.Entities.User?> GetByUsernameAsync(string username);
        Task<KaraokeSystemN.Domain.Entities.User> AddAsync(KaraokeSystemN.Domain.Entities.User user);
        Task<bool> ExistsByUsernameAsync(string username);
        Task<int> CountAsync();
    }
}
