using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.Entities;

namespace Backend.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByIdAsync(Guid id);
    Task<List<User>> GetAllAsync();
    Task AddAsync(User user);
    Task UpdateAsync(User user);
    Task DeleteAsync(User user);
}