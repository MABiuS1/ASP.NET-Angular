namespace Backend.DTOs.Common;

public static class ApiResponses
{
    public static ApiResponse<object> NotFound(string description)
    {
        return new ApiResponse<object>
        {
            status = new ApiStatus
            {
                code = "404",
                description = description
            },
            data = new { }
        };
    }

    public static ApiResponse<object> BadRequest(string description)
    {
        return new ApiResponse<object>
        {
            status = new ApiStatus
            {
                code = "400",
                description = description
            },
            data = new { }
        };
    }

    public static ApiResponse<DeleteResultDto> DeleteNotFound(string description)
    {
        return new ApiResponse<DeleteResultDto>
        {
            status = new ApiStatus
            {
                code = "404",
                description = description
            },
            data = new DeleteResultDto
            {
                result = false,
                message = description
            }
        };
    }

    public static ApiResponse<DeleteResultDto> DeleteSuccess()
    {
        return new ApiResponse<DeleteResultDto>
        {
            data = new DeleteResultDto
            {
                result = true,
                message = "Deleted"
            }
        };
    }
}
