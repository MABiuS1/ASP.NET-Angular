using System.Collections.Generic;

namespace Backend.DTOs.User;

public class DataTableResponse<T>
{
    public List<T> dataSource { get; set; } = new List<T>();
    public int page { get; set; }
    public int pageSize { get; set; }
    public int totalCount { get; set; }
}
