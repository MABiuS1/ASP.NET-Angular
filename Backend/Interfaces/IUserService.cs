using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.DTOs.User;

namespace Backend.Interfaces;

public interface IUserService
{
    Task<List<UserResponseDto>> GetAllAsync();
    Task<UserResponseDto?> GetByIdAsync(Guid id);
    Task<DataTableResponse<UserResponseDto>> GetDataTableAsync(DataTableRequest request);
    Task<UserResponseDto?> CreateAsync(UserCreateRequest request);
    Task<UserResponseDto?> UpdateAsync(Guid id, UserUpdateRequest request);
    Task<bool> DeleteAsync(Guid id);
}
