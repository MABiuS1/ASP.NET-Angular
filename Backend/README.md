# Backend (ASP.NET Core 8)

This backend is a small RBAC (role based access control) API built with ASP.NET Core 8 and EF Core. It exposes CRUD endpoints for Users, Roles, and Permissions, plus a DataTable endpoint for paged user listings. The code is structured in layers (Controllers -> Services -> Repositories -> Data) so responsibilities stay clear and testable.

## Tech stack
- .NET 8, ASP.NET Core Web API
- EF Core 8 with SQL Server provider
- Swagger / OpenAPI via Swashbuckle

Package versions are defined in `Backend.csproj`.

## Project structure and responsibilities
- `Controllers/`:
  - HTTP layer only. Converts HTTP input into DTOs, returns API responses.
  - Uses ApiController model binding and automatic validation.
- `Services/`:
  - Business logic and mapping between Entities and DTOs.
  - Example: permission resolution rules, search/paging logic.
- `Repositories/`:
  - EF Core data access and query composition.
  - Keeps controllers/services independent from EF details.
- `Entities/`:
  - Database models for EF Core.
- `DTOs/`:
  - Request and response contracts to keep API stable and JSON friendly.
- `Data/`:
  - `AppDbContext` defines DbSets and relationship configuration.
- `Filters/`:
  - Response filter to normalize `status.code` and `status.description` in API responses.
- `Migrations/`:
  - EF Core migrations for database schema evolution.

## Runtime flow (request path)
1. Controller receives HTTP request and binds it to a DTO.
2. Service executes business rules and mapping.
3. Repository performs the database operations using EF Core.
4. Controller wraps data into `ApiResponse<T>`.
5. `ApiResponseStatusFilter` injects the HTTP status code into the response body.

Reasoning: This separation keeps controllers thin, makes rules testable, and prevents EF Core from leaking into the HTTP layer.

## Database model
Tables and relationships are defined by `Entities/` + `Migrations/`.

- `Users`
  - Required fields: FirstName, LastName, Email, Username, Phone, RoleId
  - Relationship: many Users -> one Role
- `Roles`
  - Relationship: many Roles -> many Permissions (via RolePermissions)
- `Permissions`
  - Names are expected in `Module.Action` format, e.g. `User.Read`.
- `RolePermissions` (join table)
  - Composite key: (RoleId, PermissionId)
- `UserPermissions` (join table for per-user overrides)
  - Composite key: (UserId, PermissionId)
  - `IsAllowed` flag supports both allow and deny overrides

Cascade delete behavior (from migrations):
- Deleting a Role cascades to Users (RoleId is required).
- Deleting a User or Permission cascades to UserPermissions.
- Deleting a Role or Permission cascades to RolePermissions.

Reasoning: join tables keep many-to-many relations normalized and allow fine-grained overrides without duplicating permission data.

## Permission model and resolution
Effective permissions are computed in `Services/UserService.cs`.

Sources:
- Role permissions: the default set from the assigned Role.
- User overrides: explicit allow or deny in `UserPermissions`.

Rules:
- Start with all Role permissions.
- Add any user-level allowed permissions.
- Remove any user-level denied permissions.
- De-duplicate by PermissionId.

Reasoning: This gives a clean default (Role) while still supporting per-user exceptions without creating a new Role for every edge case.

### User permission request format
`UserPermissionRequest.permissionId` accepts either:
- A Permission GUID, or
- A name such as `User.Read` or a module like `User`.

The service extracts the module name and combines it with `isReadable`, `isWritable`, and `isDeletable` to compute the desired permission set.

Reasoning: The client can describe permissions at the module level without needing to send every permission GUID explicitly.

## API response envelope
Most endpoints return:
```json
{
  "status": { "code": "200", "description": "Success" },
  "data": { }
}
```

`Filters/ApiResponseStatusFilter.cs` ensures `status.code` always matches the real HTTP status, and fills in default descriptions when missing.

Reasoning: The front end gets a consistent envelope for success and error handling, regardless of endpoint.

Note: The DataTable endpoint returns `DataTableResponse<T>` directly (no `ApiResponse<T>` wrapper).

## Endpoints
Base routes:
- `api/users`
- `api/roles`
- `api/permissions`

### Users
- `GET /api/users`
  - Returns all users ordered by CreatedDate.
- `GET /api/users/{id}`
  - 404 if user not found.
- `POST /api/users`
  - Creates a user and resolves role + permissions.
  - 400 if role or permissions are invalid.
- `PUT /api/users/{id}`
  - Updates a user and permissions.
  - 404 if user not found; 400 if role or permissions are invalid.
- `DELETE /api/users/{id}`
  - 404 if user not found.
  - Returns `DeleteResultDto` with `result` and `message`.
- `POST /api/users/datatable`
  - Body: `DataTableRequest` (search, sort, page).
  - Response: `DataTableResponse<UserDataTableResponseDto>`.

### Roles
- `GET /api/roles`
- `POST /api/roles`
- `PUT /api/roles/{id}`
- `DELETE /api/roles/{id}`

### Permissions
- `GET /api/permissions`
- `POST /api/permissions`
- `PUT /api/permissions/{id}`
- `DELETE /api/permissions/{id}`

Reasoning: Standard CRUD routes keep the API simple and predictable for Angular or any REST client.

## DataTable behavior
`UserService.GetDataTableAsync`:
- Filters by search text (first name, last name, email, username).
- Supports ordering by: firstname, lastname, email, username, createddate.
- Applies paging with `pageNumber` and `pageSize` (defaults to 1 and 10).

Note: Filtering and ordering are done in memory after loading all users.
Reasoning: Simple implementation and predictable behavior for small datasets. If data grows, move this logic into EF queries to avoid loading everything.

## Startup, migrations, and seeding
On application startup (except design-time runs):
- Applies migrations via `db.Database.Migrate()`.
- Seeds base data if missing:
  - Roles: Super Admin, Admin, Employee
  - Permissions: User.Read, User.Write, User.Delete, Role.Read, Role.Write, Role.Delete
  - Role permissions:
    - Super Admin: all permissions
    - Admin: User.Read/Write/Delete, Role.Read/Write
    - Employee: User.Read
  - Sample users: superadmin, admin, employee

Seed logic is idempotent and uses lookups to avoid duplicates.

Reasoning: New environments become usable immediately without manual SQL or seed scripts.

## Configuration
`appsettings.json`:
- `ConnectionStrings:DefaultConnection` is required for SQL Server.
- `AllowedHosts` and logging defaults.

`appsettings.Development.json`:
- Overrides logging levels for local development.

`Properties/launchSettings.json`:
- Local URLs: http://localhost:5079 and https://localhost:7261
- `ASPNETCORE_ENVIRONMENT=Development`

Security note: Do not commit real production credentials in `appsettings.json`.

## Running locally
Prerequisites:
- .NET 8 SDK
- SQL Server accessible at the configured connection string

Steps:
1. Update `ConnectionStrings:DefaultConnection` if needed.
2. From `Backend/`, run:
   - `dotnet run`
3. Open Swagger UI:
   - `https://localhost:7261/swagger` (Development only)

## Migrations (manual)
The app auto-applies migrations on startup, but you can run them explicitly.

If running `dotnet ef` commands, set `EFCORE_DESIGNTIME=1` to prevent the app from starting and seeding:
```bash
EFCORE_DESIGNTIME=1 dotnet ef migrations add <Name>
EFCORE_DESIGNTIME=1 dotnet ef database update
```

Reasoning: Design-time builds should not run the HTTP server or mutate data.

## Design decisions and reasons (FAQ-ready)
- Layered architecture (Controller, Service, Repository): reduces coupling and keeps business rules out of the HTTP layer.
- DTOs separate from Entities: prevents accidental over-posting and keeps API contracts stable even if the database changes.
- CamelCase DTO properties: matches typical JavaScript/Angular conventions without extra JSON configuration.
- GUIDs as primary keys: safe for distributed systems and client-generated IDs.
- ApiResponse + filter: enforces a consistent response envelope and moves status-code mapping to one place.
- RolePermissions + UserPermissions: supports RBAC defaults with per-user exceptions.
- `IsAllowed` on UserPermissions: allows both allow-list and deny-list without extra tables.
- Auto-migration + seeding on startup: reduces setup friction for new environments.
- `CreateHostBuilder` in `Program`: enables EF Core design-time tooling in a minimal hosting model.

## Known gaps and intentional scope limits
- No authentication/authorization middleware is implemented yet.
- `password` exists in user request DTOs but is not stored or used by the current service layer.
- No CORS policy is defined in `Program.cs`.
- `Backend.http` still points to `/weatherforecast` and does not match current endpoints.

These are common follow-up areas if you plan to harden the API for production.
