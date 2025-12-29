# ASP.NET and Angular

Full stack sample with an ASP.NET Core backend and an Angular frontend.

## Project structure

- `Backend/` - ASP.NET Core Web API, EF Core, migrations, and seed data.
- `Frontend/` - Angular app with a dev proxy to the backend.
- `ASP.NET&Angular.sln` - Solution file for the backend.

## Prerequisites

- .NET SDK 8.x
- Node.js 20+ and npm (see `Frontend/package.json`)
- SQL Server (local or Docker)

## Configuration

Backend connection string is in `Backend/appsettings.json`:

```
Server=127.0.0.1,1433;Database=MyAppDb;User Id=sa;Password=User1234;TrustServerCertificate=True;Encrypt=False;
```

Update it to match your SQL Server setup if needed.

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

## Notes

- API base path is `/api`.
- User permissions are derived from role permissions and can be overridden per user.
