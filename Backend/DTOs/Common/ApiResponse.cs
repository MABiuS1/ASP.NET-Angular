namespace Backend.DTOs.Common;

public interface IApiResponse
{
    ApiStatus status { get; set; }
}

public class ApiStatus
{
    public string code { get; set; } = "200";
    public string description { get; set; } = "Success";
}

public class ApiResponse<T> : IApiResponse
{
    public ApiStatus status { get; set; } = new ApiStatus();
    public T data { get; set; } = default!;
}
