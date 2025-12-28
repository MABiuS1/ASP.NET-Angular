using Microsoft.EntityFrameworkCore;
using Backend.Entities;
using Backend.Infrastructure.Data;
using Backend.Interfaces;

namespace Backend.Repositories;

public class RoleRepository : IRoleRepository
{
    private readonly AppDbContext _db;

    public RoleRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<Role>> GetAllAsync()
    {
        return await _db.Roles.ToListAsync();
    }

    public async Task<Role?> GetByIdAsync(Guid id)
    {
        return await _db.Roles.FirstOrDefaultAsync(x => x.Id == id);
    }

    public async Task AddAsync(Role role)
    {
        _db.Roles.Add(role);
        await _db.SaveChangesAsync();
    }

    public async Task UpdateAsync(Role role)
    {
        _db.Roles.Update(role);
        await _db.SaveChangesAsync();
    }

    public async Task DeleteAsync(Role role)
    {
        _db.Roles.Remove(role);
        await _db.SaveChangesAsync();
    }
}
