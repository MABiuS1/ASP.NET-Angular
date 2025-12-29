# ASP.NET and Angular

Full stack sample with an ASP.NET Core backend and an Angular frontend.

## Overview

- Admin dashboard UI for managing users, roles, and permissions.
- REST API with CRUD endpoints for users/roles/permissions.
- Role-based permissions with optional per-user overrides.
- No authentication/authorization is implemented (API is open by default).

## Tech stack

- ASP.NET Core 8 Web API
- EF Core 8 + SQL Server
- Angular (see `Frontend/package.json` for version)

## Project structure

- `Backend/` - ASP.NET Core Web API, EF Core, migrations, and seed data.
- `Frontend/` - Angular app with a dev proxy to the backend.
- `ASP.NET&Angular.sln` - Solution file for the backend.

## Prerequisites

- .NET SDK 8.x
- Node.js 20+ and npm (see `Frontend/package.json`)
- SQL Server (local or Docker)

If you want a local SQL Server via Docker:

```
docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=User1234" -p 1433:1433 --name sqlserver -d mcr.microsoft.com/mssql/server:2022-latest
```

## Configuration

Backend connection string is in `Backend/appsettings.json`:

```
Server=127.0.0.1,1433;Database=MyAppDb;User Id=sa;Password=User1234;TrustServerCertificate=True;Encrypt=False;
```

Update it to match your SQL Server setup if needed.

Frontend dev proxy is in `Frontend/proxy.conf.json`. Update the `target` if the backend host or port changes.

## Run the backend

```
cd Backend
dotnet restore
dotnet run
```

The API starts on `http://localhost:5079` (see `Backend/Properties/launchSettings.json`).
Swagger is available at `http://localhost:5079/swagger`.

## Run the frontend

```
cd Frontend
npm install
npm start
```

The Angular app runs on `http://localhost:4200`. The dev server proxies `/api`
to `http://localhost:5079` using `Frontend/proxy.conf.json`.

## Build for production

Backend:

```
cd Backend
dotnet publish -c Release
```

Frontend:

```
cd Frontend
npm run build
```

## Database and migrations

On startup, the backend runs `db.Database.Migrate()` and applies migrations
automatically. If the database does not exist, it will be created.

## Seed data

Seed runs at startup and is idempotent.

Roles:
- Super Admin
- Admin
- Employee

Permissions:
- User.Read
- User.Write
- User.Delete
- Role.Read
- Role.Write
- Role.Delete

Sample users:
- superadmin (role: Super Admin)
- admin (role: Admin)
- employee (role: Employee)

Passwords: not applicable (no authentication is implemented).

## API examples

Get users:

```
curl -s http://localhost:5079/api/users
```

Response:

```json
{
  "status": {
    "code": "200",
    "description": "Success"
  },
  "data": [
    {
      "id": "7a4b7c23-1a3a-4b0a-9b9f-111111111111",
      "firstName": "Super",
      "lastName": "Admin",
      "email": "super.admin@example.com",
      "username": "superadmin",
      "phone": "0800000001",
      "role": {
        "roleId": "2a111111-2222-3333-4444-555555555555",
        "roleName": "Super Admin"
      },
      "permissions": [
        {
          "permissionId": "3b111111-2222-3333-4444-555555555555",
          "permissionName": "User.Read"
        }
      ],
      "createdDate": "2024-01-01T00:00:00Z"
    }
  ]
}
```

Create user (use a role ID from `/api/roles`; permissions can be empty to use role defaults):

```
curl -s -X POST http://localhost:5079/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Doe",
    "email": "jane.doe@example.com",
    "phone": "0800000004",
    "roleId": "2a111111-2222-3333-4444-555555555555",
    "username": "jane.doe",
    "permissions": []
  }'
```

Response:

```json
{
  "status": {
    "code": "200",
    "description": "Success"
  },
  "data": {
    "id": "9c8d7e6f-5a4b-3c2d-1e0f-666666666666",
    "firstName": "Jane",
    "lastName": "Doe",
    "email": "jane.doe@example.com",
    "username": "jane.doe",
    "phone": "0800000004",
    "role": {
      "roleId": "2a111111-2222-3333-4444-555555555555",
      "roleName": "Admin"
    },
    "permissions": [
      {
        "permissionId": "3b111111-2222-3333-4444-555555555555",
        "permissionName": "User.Read"
      }
    ],
    "createdDate": "2024-01-01T00:00:00Z"
  }
}
```

## Tests

No automated tests are included.

## Notes

- API base path is `/api`.
- User permissions are derived from role permissions and can be overridden per user.
- The frontend has a single Admin Dashboard page; only Users/Roles/Permissions CRUD is wired to the backend. Other widgets and sections are mock data in `Frontend/src/app/pages/admin-dashboard/admin-dashboard.page.ts`.

## Troubleshooting

- If the API cannot connect to SQL Server, verify the connection string and that SQL Server is running on port `1433`.
- If the Angular app cannot reach the API, confirm `Backend` is running and that `Frontend/proxy.conf.json` targets `http://localhost:5079`.
