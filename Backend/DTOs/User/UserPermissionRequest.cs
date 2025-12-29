using System;

namespace Backend.DTOs.User;

public class UserPermissionRequest
{
    public string permissionId { get; set; } = null!;
    public bool isReadable { get; set; }
    public bool isWritable { get; set; }
    public bool isDeletable { get; set; }
}
