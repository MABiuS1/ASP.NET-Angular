using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Backend.DTOs.Common;
using Backend.DTOs.Permission;
using Backend.Entities;
using Backend.Interfaces;

namespace Backend.Api.Controllers;

[ApiController]
[Route("api/permissions")]
public class PermissionsController : ControllerBase
{
    private readonly IPermissionRepository _permissionRepo;

    public PermissionsController(IPermissionRepository permissionRepo)
    {
        _permissionRepo = permissionRepo;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var permissions = await _permissionRepo.GetAllAsync();
        var data = permissions
            .Select(MapPermission)
            .ToList();

        return Ok(new ApiResponse<List<PermissionDto>> { data = data });
    }

    [HttpPost]
    public async Task<IActionResult> Create(PermissionRequestDto request)
    {
        var permission = new Permission
        {
            Id = Guid.NewGuid(),
            Name = request.permissionName
        };

        await _permissionRepo.AddAsync(permission);

        var data = MapPermission(permission);

        return Ok(new ApiResponse<PermissionDto> { data = data });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, PermissionRequestDto request)
    {
        var permission = await _permissionRepo.GetByIdAsync(id);
        if (permission == null)
        {
            return NotFound(ApiResponses.NotFound("Permission not found"));
        }

        permission.Name = request.permissionName;
        await _permissionRepo.UpdateAsync(permission);

        var data = MapPermission(permission);

        return Ok(new ApiResponse<PermissionDto> { data = data });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var permission = await _permissionRepo.GetByIdAsync(id);
        if (permission == null)
        {
            return NotFound(ApiResponses.DeleteNotFound("Permission not found"));
        }

        await _permissionRepo.DeleteAsync(permission);

        return Ok(ApiResponses.DeleteSuccess());
    }

    private static PermissionDto MapPermission(Permission permission)
    {
        return new PermissionDto
        {
            permissionId = permission.Id,
            permissionName = permission.Name
        };
    }
}
