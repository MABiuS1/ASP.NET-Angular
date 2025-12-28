using Microsoft.EntityFrameworkCore;
using System.Linq;
using Backend.Infrastructure.Data;
using Backend.Entities;
using Backend.Interfaces;

namespace Backend.Repositories;

public class UserRepository : IUserRepository
{
    private readonly AppDbContext _db;

    public UserRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<User?> GetByIdAsync(Guid id)
    {
        return await BuildUserQuery()
            .FirstOrDefaultAsync(x => x.Id == id);
    }

    public async Task<List<User>> GetAllAsync()
    {
        return await BuildUserQuery().ToListAsync();
    }

    public async Task AddAsync(User user)
    {
        _db.Users.Add(user);
        await _db.SaveChangesAsync();
    }

    public async Task UpdateAsync(User user)
    {
        var existingPermissions = _db.UserPermissions.Where(x => x.UserId == user.Id);
        _db.UserPermissions.RemoveRange(existingPermissions);
        _db.UserPermissions.AddRange(user.UserPermissions);
        _db.Users.Update(user);
        await _db.SaveChangesAsync();
    }

    public async Task DeleteAsync(User user)
    {
        _db.Users.Remove(user);
        await _db.SaveChangesAsync();
    }

    private IQueryable<User> BuildUserQuery()
    {
        return _db.Users
            .Include(x => x.Role)
            .Include(x => x.UserPermissions)
                .ThenInclude(x => x.Permission);
    }
}
