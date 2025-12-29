using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using Backend.Interfaces;
using Backend.DTOs.User;
using Backend.DTOs.Role;
using Backend.DTOs.Permission;
using Backend.Entities;

namespace Backend.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepo;
    private readonly IRoleRepository _roleRepo;
    private readonly IPermissionRepository _permissionRepo;

    public UserService(
        IUserRepository userRepo,
        IRoleRepository roleRepo,
        IPermissionRepository permissionRepo)
    {
        _userRepo = userRepo;
        _roleRepo = roleRepo;
        _permissionRepo = permissionRepo;
    }

    public async Task<UserResponseDto?> GetByIdAsync(Guid id)
    {
        var user = await _userRepo.GetByIdAsync(id);
        if (user == null) return null;

        return MapUser(user);
    }

    public async Task<List<UserResponseDto>> GetAllAsync()
    {
        var users = await _userRepo.GetAllAsync();
        return users
            .OrderBy(u => u.CreatedDate)
            .Select(MapUser)
            .ToList();
    }

    public async Task<DataTableResponse<UserResponseDto>> GetDataTableAsync(DataTableRequest request)
    {
        var users = await _userRepo.GetAllAsync();

        var query = users.AsQueryable();
        if (!string.IsNullOrWhiteSpace(request.search))
        {
            var search = request.search.Trim();
            query = query.Where(u =>
                u.FirstName.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                u.LastName.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                u.Email.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                u.Username.Contains(search, StringComparison.OrdinalIgnoreCase));
        }

        var orderBy = request.orderBy?.ToLowerInvariant();
        var isDescending = string.Equals(request.orderDirection, "desc", StringComparison.OrdinalIgnoreCase);

        query = orderBy switch
        {
            "firstname" => isDescending
                ? query.OrderByDescending(u => u.FirstName)
                : query.OrderBy(u => u.FirstName),
            "lastname" => isDescending
                ? query.OrderByDescending(u => u.LastName)
                : query.OrderBy(u => u.LastName),
            "email" => isDescending
                ? query.OrderByDescending(u => u.Email)
                : query.OrderBy(u => u.Email),
            "username" => isDescending
                ? query.OrderByDescending(u => u.Username)
                : query.OrderBy(u => u.Username),
            "createddate" => isDescending
                ? query.OrderByDescending(u => u.CreatedDate)
                : query.OrderBy(u => u.CreatedDate),
            _ => query.OrderBy(u => u.CreatedDate)
        };

        var total = query.Count();
        var pageNumber = request.pageNumber < 1 ? 1 : request.pageNumber;
        var pageSize = request.pageSize < 1 ? 10 : request.pageSize;

        var paged = query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(MapUser)
            .ToList();

        return new DataTableResponse<UserResponseDto>
        {
            dataSource = paged,
            page = pageNumber,
            pageSize = pageSize,
            totalCount = total
        };
    }

    public async Task<UserResponseDto?> CreateAsync(UserCreateRequest request)
    {
        var resolved = await ResolveRoleAndOverridesAsync(request.roleId, request.permissions);
        if (resolved == null) return null;
        var (role, overrides) = resolved.Value;

        var user = new User
        {
            Id = request.id ?? Guid.NewGuid(),
            FirstName = request.firstName,
            LastName = request.lastName,
            Email = request.email,
            Username = request.username,
            Phone = request.phone ?? string.Empty,
            RoleId = role.Id,
            CreatedDate = DateTime.UtcNow
        };
        user.UserPermissions = overrides
            .Select(p => new UserPermission
            {
                UserId = user.Id,
                PermissionId = p.PermissionId,
                IsAllowed = p.IsAllowed
            })
            .ToList();

        await _userRepo.AddAsync(user);

        var created = await _userRepo.GetByIdAsync(user.Id);
        return created == null ? null : MapUser(created);
    }

    public async Task<UserResponseDto?> UpdateAsync(Guid id, UserUpdateRequest request)
    {
        var user = await _userRepo.GetByIdAsync(id);
        if (user == null) return null;

        var resolved = await ResolveRoleAndOverridesAsync(request.roleId, request.permissions);
        if (resolved == null) return null;
        var (role, overrides) = resolved.Value;

        user.FirstName = request.firstName;
        user.LastName = request.lastName;
        user.Email = request.email;
        user.Username = request.username;
        user.Phone = request.phone ?? string.Empty;
        user.RoleId = role.Id;
        user.UserPermissions = overrides
            .Select(p => new UserPermission
            {
                UserId = user.Id,
                PermissionId = p.PermissionId,
                IsAllowed = p.IsAllowed
            })
            .ToList();

        await _userRepo.UpdateAsync(user);

        var updated = await _userRepo.GetByIdAsync(user.Id);
        return updated == null ? null : MapUser(updated);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var user = await _userRepo.GetByIdAsync(id);
        if (user == null) return false;

        await _userRepo.DeleteAsync(user);
        return true;
    }

    private static UserResponseDto MapUser(User user)
    {
        var effectivePermissions = BuildEffectivePermissions(user);
        return new UserResponseDto
        {
            id = user.Id,
            firstName = user.FirstName,
            lastName = user.LastName,
            email = user.Email,
            username = user.Username,
            phone = string.IsNullOrWhiteSpace(user.Phone) ? null : user.Phone,
            role = new RoleDto
            {
                roleId = user.Role.Id,
                roleName = user.Role.Name
            },
            permissions = effectivePermissions
                .Select(p => new PermissionDto
                {
                    permissionId = p.Id,
                    permissionName = p.Name
                })
                .ToList(),
            createdDate = user.CreatedDate
        };
    }

    private static List<Permission> BuildEffectivePermissions(User user)
    {
        var rolePermissions = user.Role.RolePermissions
            .Select(rp => rp.Permission)
            .ToList();

        var allowedOverrides = user.UserPermissions
            .Where(p => p.IsAllowed)
            .Select(p => p.Permission)
            .ToList();

        var deniedIds = user.UserPermissions
            .Where(p => !p.IsAllowed)
            .Select(p => p.PermissionId)
            .ToHashSet();

        return rolePermissions
            .Concat(allowedOverrides)
            .Where(p => !deniedIds.Contains(p.Id))
            .GroupBy(p => p.Id)
            .Select(g => g.First())
            .ToList();
    }

    private async Task<(Role role, List<UserPermission> overrides)?> ResolveRoleAndOverridesAsync(
        Guid roleId,
        List<UserPermissionRequest>? permissionRequests)
    {
        var role = await _roleRepo.GetByIdAsync(roleId);
        if (role == null) return null;

        var requests = permissionRequests ?? new List<UserPermissionRequest>();
        if (requests.Count == 0)
        {
            return (role, new List<UserPermission>());
        }

        var distinctRequests = requests
            .GroupBy(p => p.permissionId)
            .Select(g => g.Last())
            .ToList();

        var permissionIds = distinctRequests
            .Select(p => p.permissionId)
            .Distinct()
            .ToList();

        if (permissionIds.Count == 0)
        {
            return (role, new List<UserPermission>());
        }

        var permissions = await _permissionRepo.GetByIdsAsync(permissionIds);
        if (permissions.Count != permissionIds.Count) return null;

        var desiredPermissionIds = distinctRequests
            .Where(IsPermissionAllowed)
            .Select(p => p.permissionId)
            .ToHashSet();

        var rolePermissionIds = role.RolePermissions
            .Select(rp => rp.PermissionId)
            .ToHashSet();

        var overrides = new List<UserPermission>();

        foreach (var permissionId in desiredPermissionIds)
        {
            if (!rolePermissionIds.Contains(permissionId))
            {
                overrides.Add(new UserPermission
                {
                    PermissionId = permissionId,
                    IsAllowed = true
                });
            }
        }

        foreach (var permissionId in rolePermissionIds)
        {
            if (!desiredPermissionIds.Contains(permissionId))
            {
                overrides.Add(new UserPermission
                {
                    PermissionId = permissionId,
                    IsAllowed = false
                });
            }
        }

        return (role, overrides);
    }

    private static bool IsPermissionAllowed(UserPermissionRequest request)
    {
        return request.isReadable || request.isWritable || request.isDeletable;
    }
}
