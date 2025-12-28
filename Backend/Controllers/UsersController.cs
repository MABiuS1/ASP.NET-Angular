using Microsoft.AspNetCore.Mvc;
using Backend.DTOs.Common;
using Backend.DTOs.User;
using Backend.Interfaces;
using System.Threading.Tasks;
using System;
using System.Collections.Generic;

namespace Backend.Api.Controllers;

[ApiController]
[Route("api/users")]
public class UsersController : ControllerBase
{
    private readonly IUserService _service;

    public UsersController(IUserService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _service.GetAllAsync();
        return Ok(new ApiResponse<List<UserResponseDto>> { data = result });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(Guid id)
    {
        var result = await _service.GetByIdAsync(id);
        if (result == null)
        {
            return NotFound(ApiResponses.NotFound("User not found"));
        }

        return Ok(new ApiResponse<UserResponseDto> { data = result });
    }

    [HttpPost("datatable")]
    public async Task<IActionResult> DataTable(DataTableRequest request)
    {
        var result = await _service.GetDataTableAsync(request);
        return Ok(new ApiResponse<DataTableResponse<UserResponseDto>> { data = result });
    }

    [HttpPost]
    public async Task<IActionResult> Create(UserCreateRequest request)
    {
        var created = await _service.CreateAsync(request);
        if (created == null)
        {
            return BadRequest(ApiResponses.BadRequest("Invalid role or permissions"));
        }

        return Ok(new ApiResponse<UserResponseDto> { data = created });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, UserUpdateRequest request)
    {
        var existing = await _service.GetByIdAsync(id);
        if (existing == null)
        {
            return NotFound(ApiResponses.NotFound("User not found"));
        }

        var updated = await _service.UpdateAsync(id, request);
        if (updated == null)
        {
            return BadRequest(ApiResponses.BadRequest("Invalid role or permissions"));
        }

        return Ok(new ApiResponse<UserResponseDto> { data = updated });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var deleted = await _service.DeleteAsync(id);
        if (!deleted)
        {
            return NotFound(ApiResponses.DeleteNotFound("User not found"));
        }

        return Ok(ApiResponses.DeleteSuccess());
    }
}
