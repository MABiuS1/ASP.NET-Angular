using System;
using System.Collections.Generic;

namespace Backend.Entities;

public class Permission
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;

    public ICollection<UserPermission> UserPermissions { get; set; } = new List<UserPermission>();
    public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
}
