using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Backend.DTOs.Common;
using Backend.DTOs.Role;
using Backend.Entities;
using Backend.Interfaces;

namespace Backend.Api.Controllers;

[ApiController]
[Route("api/roles")]
public class RolesController : ControllerBase
{
    private readonly IRoleRepository _roleRepo;

    public RolesController(IRoleRepository roleRepo)
    {
        _roleRepo = roleRepo;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var roles = await _roleRepo.GetAllAsync();
        var data = roles
            .Select(MapRole)
            .ToList();

        return Ok(new ApiResponse<List<RoleDto>> { data = data });
    }

    [HttpPost]
    public async Task<IActionResult> Create(RoleRequestDto request)
    {
        var role = new Role
        {
            Id = Guid.NewGuid(),
            Name = request.roleName
        };

        await _roleRepo.AddAsync(role);

        var data = MapRole(role);

        return Ok(new ApiResponse<RoleDto> { data = data });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, RoleRequestDto request)
    {
        var role = await _roleRepo.GetByIdAsync(id);
        if (role == null)
        {
            return NotFound(ApiResponses.NotFound("Role not found"));
        }

        role.Name = request.roleName;
        await _roleRepo.UpdateAsync(role);

        var data = MapRole(role);

        return Ok(new ApiResponse<RoleDto> { data = data });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var role = await _roleRepo.GetByIdAsync(id);
        if (role == null)
        {
            return NotFound(ApiResponses.DeleteNotFound("Role not found"));
        }

        await _roleRepo.DeleteAsync(role);

        return Ok(ApiResponses.DeleteSuccess());
    }

    private static RoleDto MapRole(Role role)
    {
        return new RoleDto
        {
            roleId = role.Id,
            roleName = role.Name
        };
    }
}
