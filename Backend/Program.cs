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
    if (!db.Roles.Any())
    {
        db.Roles.AddRange(
            new Role { Id = Guid.NewGuid(), Name = "Admin" },
            new Role { Id = Guid.NewGuid(), Name = "Manager" },
            new Role { Id = Guid.NewGuid(), Name = "User" }
        );
        db.SaveChanges();
    }

    if (!db.Permissions.Any())
    {
        db.Permissions.AddRange(
            new Permission { Id = Guid.NewGuid(), Name = "User.Read" },
            new Permission { Id = Guid.NewGuid(), Name = "User.Write" },
            new Permission { Id = Guid.NewGuid(), Name = "Role.Read" },
            new Permission { Id = Guid.NewGuid(), Name = "Role.Write" }
        );
        db.SaveChanges();
    }

    if (!db.Users.Any())
    {
        var adminRole = db.Roles.First(r => r.Name == "Admin");
        var permissions = db.Permissions.ToList();

        var adminUser = new User
        {
            Id = Guid.NewGuid(),
            FirstName = "System",
            LastName = "Admin",
            Email = "admin@example.com",
            Username = "admin",
            Phone = "",
            RoleId = adminRole.Id,
            CreatedDate = DateTime.UtcNow,
            UserPermissions = permissions.Select(p => new UserPermission
            {
                PermissionId = p.Id
            }).ToList()
        };

        db.Users.Add(adminUser);
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
