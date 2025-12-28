using System;
using System.Collections.Generic;
using Backend.DTOs.Role;
using Backend.DTOs.Permission;

namespace Backend.DTOs.User;

public class UserResponseDto
{
    public Guid id { get; set; }
    public string firstName { get; set; } = null!;
    public string lastName { get; set; } = null!;
    public string email { get; set; } = null!;
    public string username { get; set; } = null!;
    public string? phone { get; set; }
    public RoleDto role { get; set; } = new RoleDto();
    public List<PermissionDto> permissions { get; set; } = new List<PermissionDto>();
}
