using System;
using System.Collections.Generic;

namespace Backend.Entities;

public class User
{
    public Guid Id { get; set; }

    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Username { get; set; } = null!;
    public string Phone { get; set; } = null!;

    public Guid RoleId { get; set; }
    public Role Role { get; set; } = null!;

    public ICollection<UserPermission> UserPermissions { get; set; } = new List<UserPermission>();

    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
}
