using System;

namespace Backend.DTOs.User;

public class UserPermissionRequest
{
    public Guid permissionId { get; set; }
    public bool isReadable { get; set; }
    public bool isWritable { get; set; }
    public bool isDeletable { get; set; }
}
