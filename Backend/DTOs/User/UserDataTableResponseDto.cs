using System;
using System.Collections.Generic;
using Backend.DTOs.Permission;
using Backend.DTOs.Role;

namespace Backend.DTOs.User;

public class UserDataTableResponseDto
{
    public Guid userId { get; set; }
    public string firstName { get; set; } = null!;
    public string lastName { get; set; } = null!;
    public string email { get; set; } = null!;
    public string username { get; set; } = null!;
    public RoleDto role { get; set; } = new RoleDto();
    public List<PermissionDto> permissions { get; set; } = new List<PermissionDto>();
    public DateTime createdDate { get; set; }
}
