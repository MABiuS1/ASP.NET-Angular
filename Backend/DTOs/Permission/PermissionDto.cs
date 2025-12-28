using System;

namespace Backend.DTOs.Permission;

public class PermissionDto
{
    public Guid permissionId { get; set; }
    public string permissionName { get; set; } = null!;
}
