using System;
using System.Collections.Generic;

namespace Backend.DTOs.User;

public class UserUpdateRequest
{
    public string firstName { get; set; } = null!;
    public string lastName { get; set; } = null!;
    public string email { get; set; } = null!;
    public string? phone { get; set; }
    public Guid roleId { get; set; }
    public string username { get; set; } = null!;
    public string? password { get; set; }
    public List<UserPermissionRequest> permission { get; set; } = new List<UserPermissionRequest>();
}
