using System;

namespace Backend.DTOs.Role;

public class RoleDto
{
    public Guid roleId { get; set; }
    public string roleName { get; set; } = null!;
}
