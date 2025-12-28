using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Backend.DTOs.Common;

namespace Backend.Filters;

public class ApiResponseStatusFilter : IResultFilter
{
    public void OnResultExecuting(ResultExecutingContext context)
    {
        if (context.Result is ObjectResult objectResult &&
            objectResult.Value is IApiResponse apiResponse)
        {
            var statusCode = objectResult.StatusCode ?? context.HttpContext.Response.StatusCode;
            if (statusCode == 0) statusCode = StatusCodes.Status200OK;

            apiResponse.status.code = statusCode.ToString();
            if (string.IsNullOrWhiteSpace(apiResponse.status.description))
            {
                apiResponse.status.description = GetDefaultDescription(statusCode);
            }
        }
    }

    public void OnResultExecuted(ResultExecutedContext context)
    {
    }

    private static string GetDefaultDescription(int statusCode)
    {
        return statusCode switch
        {
            StatusCodes.Status200OK => "Success",
            StatusCodes.Status400BadRequest => "Bad Request",
            StatusCodes.Status404NotFound => "Not Found",
            StatusCodes.Status500InternalServerError => "Internal Server Error",
            _ => "Success"
        };
    }
}
