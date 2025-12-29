using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using Backend.Infrastructure.Data;
using Backend.Entities;
using Backend.Repositories;
using Backend.Interfaces;
using Backend.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers(options =>
{
    options.Filters.Add<Backend.Filters.ApiResponseStatusFilter>();
});
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"))
);

builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IRoleRepository, RoleRepository>();
builder.Services.AddScoped<IPermissionRepository, PermissionRepository>();
builder.Services.AddScoped<IUserService, UserService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json","API v1"));
}

app.UseHttpsRedirection();
app.MapControllers();

var isDesignTime = Environment.GetEnvironmentVariable("EFCORE_DESIGNTIME") == "1";
if (!isDesignTime)
{
    using (var scope = app.Services.CreateScope())
    {
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        db.Database.Migrate();
        SeedData(db);
    }

    app.Run();
}

static void SeedData(AppDbContext db)
{
    var requiredRoles = new[] { "Super Admin", "Admin", "Employee" };
    var roles = db.Roles.ToList();
    var roleLookup = roles
        .GroupBy(r => r.Name)
        .ToDictionary(g => g.Key, g => g.First());

    var newRoles = new List<Role>();
    foreach (var roleName in requiredRoles)
    {
        if (!roleLookup.ContainsKey(roleName))
        {
            var role = new Role { Id = Guid.NewGuid(), Name = roleName };
            newRoles.Add(role);
            roleLookup[roleName] = role;
            roles.Add(role);
        }
    }

    if (newRoles.Count > 0)
    {
        db.Roles.AddRange(newRoles);
        db.SaveChanges();
    }

    var requiredPermissions = new[]
    {
        "User.Read",
        "User.Write",
        "User.Delete",
        "Role.Read",
        "Role.Write",
        "Role.Delete"
    };
    var permissions = db.Permissions.ToList();
    var permissionLookup = permissions
        .GroupBy(p => p.Name)
        .ToDictionary(g => g.Key, g => g.First());

    var newPermissions = new List<Permission>();
    foreach (var permissionName in requiredPermissions)
    {
        if (!permissionLookup.ContainsKey(permissionName))
        {
            var permission = new Permission { Id = Guid.NewGuid(), Name = permissionName };
            newPermissions.Add(permission);
            permissionLookup[permissionName] = permission;
            permissions.Add(permission);
        }
    }

    if (newPermissions.Count > 0)
    {
        db.Permissions.AddRange(newPermissions);
        db.SaveChanges();
    }

    var existingRolePermissions = db.RolePermissions
        .Select(rp => new { rp.RoleId, rp.PermissionId })
        .ToList();
    var rolePermissionKeys = new HashSet<(Guid RoleId, Guid PermissionId)>(
        existingRolePermissions.Select(rp => (rp.RoleId, rp.PermissionId))
    );
    var rolePermissionsToAdd = new List<RolePermission>();

    if (roleLookup.TryGetValue("Super Admin", out var superAdminRole))
    {
        foreach (var permission in permissions)
        {
            var key = (superAdminRole.Id, permission.Id);
            if (rolePermissionKeys.Add(key))
            {
                rolePermissionsToAdd.Add(new RolePermission
                {
                    RoleId = superAdminRole.Id,
                    PermissionId = permission.Id
                });
            }
        }
    }

    if (roleLookup.TryGetValue("Admin", out var adminRole))
    {
        var adminPermissions = new[]
        {
            "User.Read",
            "User.Write",
            "User.Delete",
            "Role.Read",
            "Role.Write"
        };
        foreach (var permissionName in adminPermissions)
        {
            if (permissionLookup.TryGetValue(permissionName, out var permission))
            {
                var key = (adminRole.Id, permission.Id);
                if (rolePermissionKeys.Add(key))
                {
                    rolePermissionsToAdd.Add(new RolePermission
                    {
                        RoleId = adminRole.Id,
                        PermissionId = permission.Id
                    });
                }
            }
        }
    }

    if (roleLookup.TryGetValue("Employee", out var employeeRole))
    {
        var employeePermissions = new[] { "User.Read" };
        foreach (var permissionName in employeePermissions)
        {
            if (permissionLookup.TryGetValue(permissionName, out var permission))
            {
                var key = (employeeRole.Id, permission.Id);
                if (rolePermissionKeys.Add(key))
                {
                    rolePermissionsToAdd.Add(new RolePermission
                    {
                        RoleId = employeeRole.Id,
                        PermissionId = permission.Id
                    });
                }
            }
        }
    }

    if (rolePermissionsToAdd.Count > 0)
    {
        db.RolePermissions.AddRange(rolePermissionsToAdd);
        db.SaveChanges();
    }

    var existingUsernames = new HashSet<string>(
        db.Users.Select(u => u.Username).ToList(),
        StringComparer.OrdinalIgnoreCase
    );
    var users = new List<User>();

    if (roleLookup.TryGetValue("Super Admin", out var superAdminRoleForUsers) &&
        !existingUsernames.Contains("superadmin"))
    {
        users.Add(new User
        {
            Id = Guid.NewGuid(),
            FirstName = "Super",
            LastName = "Admin",
            Email = "super.admin@example.com",
            Username = "superadmin",
            Phone = "0800000001",
            RoleId = superAdminRoleForUsers.Id,
            CreatedDate = DateTime.UtcNow,
            UserPermissions = new List<UserPermission>()
        });
    }

    if (roleLookup.TryGetValue("Admin", out var adminRoleForUsers) &&
        !existingUsernames.Contains("admin"))
    {
        users.Add(new User
        {
            Id = Guid.NewGuid(),
            FirstName = "System",
            LastName = "Admin",
            Email = "admin@example.com",
            Username = "admin",
            Phone = "0800000002",
            RoleId = adminRoleForUsers.Id,
            CreatedDate = DateTime.UtcNow,
            UserPermissions = new List<UserPermission>()
        });
    }

    if (roleLookup.TryGetValue("Employee", out var employeeRoleForUsers) &&
        !existingUsernames.Contains("employee"))
    {
        users.Add(new User
        {
            Id = Guid.NewGuid(),
            FirstName = "Sample",
            LastName = "Employee",
            Email = "employee@example.com",
            Username = "employee",
            Phone = "0800000003",
            RoleId = employeeRoleForUsers.Id,
            CreatedDate = DateTime.UtcNow,
            UserPermissions = new List<UserPermission>()
        });
    }

    if (users.Count > 0)
    {
        db.Users.AddRange(users);
        db.SaveChanges();
    }
}

public partial class Program
{
    public static IHostBuilder CreateHostBuilder(string[] args) =>
        Host.CreateDefaultBuilder(args)
            .ConfigureServices((context, services) =>
            {
                services.AddDbContext<AppDbContext>(options =>
                    options.UseSqlServer(context.Configuration.GetConnectionString("DefaultConnection")));
            });
}
