
using Microsoft.EntityFrameworkCore;
using SalonPOS.API.Data;

var builder = WebApplication.CreateBuilder(args);

// Connect the API to SQL Server
var connectionString = builder.Configuration
    .GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<SalonDbContext>(options =>
    options.UseSqlServer(connectionString));

// Register OpenAPI
builder.Services.AddOpenApi();

builder.Services.AddControllers();
var app = builder.Build();

// Configure OpenAPI
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

// Home endpoint
app.MapGet("/", () => "Salon POS API is running!");

// Test database connection
app.MapGet("/api/test-db", async (SalonDbContext db) =>
{
    try
    {
        bool connected = await db.Database.CanConnectAsync();

        return Results.Ok(new
        {
            success = connected,
            message = connected
                ? "Database connection successful!"
                : "Could not connect to the database."
        });
    }
    catch (Exception ex)
    {
        return Results.Problem(
            detail: ex.Message,
            statusCode: 500
        );
    }
});

app.MapControllers();
app.Run();
