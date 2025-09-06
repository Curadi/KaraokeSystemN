using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using KaraokeSystemN.Domain.Entities;
using KaraokeSystemN.Domain.Interfaces;
using KaraokeSystemN.Infrastructure.Data;

namespace KaraokeSystemN.Infrastructure.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly ApplicationDbContext _context;

        public UserRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<User?> GetByUsernameAsync(string username)
        {
            return await _context.User.FirstOrDefaultAsync(u => u.Username == username);
        }

        // CORREÇÃO: O método agora retorna o usuário adicionado para corresponder à interface.
        public async Task<User> AddAsync(User user)
        {
            _context.User.Add(user);
            await _context.SaveChangesAsync();
            return user; // Retorna a entidade 'user' após salvar.
        }

        public async Task<bool> ExistsByUsernameAsync(string username)
        {
            return await _context.User.AnyAsync(u => u.Username == username);
        }

        public async Task<int> CountAsync()
        {
            return await _context.User.CountAsync();
        }
    }
}

