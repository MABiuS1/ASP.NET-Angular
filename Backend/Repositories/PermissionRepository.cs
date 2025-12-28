using Microsoft.EntityFrameworkCore;
using Backend.Entities;
using Backend.Infrastructure.Data;
using Backend.Interfaces;

namespace Backend.Repositories;

public class PermissionRepository : IPermissionRepository
{
    private readonly AppDbContext _db;

    public PermissionRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<Permission>> GetAllAsync()
    {
        return await _db.Permissions.ToListAsync();
    }

    public async Task<Permission?> GetByIdAsync(Guid id)
    {
        return await _db.Permissions.FirstOrDefaultAsync(x => x.Id == id);
    }

    public async Task<List<Permission>> GetByIdsAsync(IEnumerable<Guid> ids)
    {
        var idList = ids.Distinct().ToList();
        if (idList.Count == 0)
        {
            return new List<Permission>();
        }

        return await _db.Permissions.Where(x => idList.Contains(x.Id)).ToListAsync();
    }

    public async Task AddAsync(Permission permission)
    {
        _db.Permissions.Add(permission);
        await _db.SaveChangesAsync();
    }

    public async Task UpdateAsync(Permission permission)
    {
        _db.Permissions.Update(permission);
        await _db.SaveChangesAsync();
    }

    public async Task DeleteAsync(Permission permission)
    {
        _db.Permissions.Remove(permission);
        await _db.SaveChangesAsync();
    }
}
