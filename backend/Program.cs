using backend.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.WithOrigins("http://localhost:5173") // Vite default port
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

var jwtKey = builder.Configuration["Jwt:Key"] ?? "SecretKey";
var jwtIssuer = builder.Configuration["Jwt:Issuer"];
var jwtAudience = builder.Configuration["Jwt:Audience"];

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

builder.Services.AddAuthorization();

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("AllowFrontend");

app.UseStaticFiles();

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Create Database & Seed Admin User
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    context.Database.EnsureCreated();
    EnsureQuestionGroupSchema(context);

    if (!context.Users.Any(u => u.Username == "admin"))
    {
        context.Users.Add(new backend.Models.User
        {
            Name = "Administrator",
            Username = "admin",
            Email = "admin@imkp.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
            Role = "Admin",
            IsActive = true
        });
        context.SaveChanges();
    }
}

app.Run();

static void EnsureQuestionGroupSchema(ApplicationDbContext context)
{
    context.Database.ExecuteSqlRaw("""
        IF OBJECT_ID(N'[QuestionGroups]', N'U') IS NULL
        BEGIN
            CREATE TABLE [QuestionGroups] (
                [Id] int NOT NULL IDENTITY,
                [Name] nvarchar(max) NOT NULL,
                [Description] nvarchar(max) NOT NULL,
                [IsActive] bit NOT NULL,
                [CreatedAt] datetime2 NOT NULL,
                CONSTRAINT [PK_QuestionGroups] PRIMARY KEY ([Id])
            );
        END;

        IF COL_LENGTH(N'[Users]', N'NomorPekerja') IS NULL
        BEGIN
            ALTER TABLE [Users] ADD [NomorPekerja] nvarchar(max) NULL;
        END;

        IF COL_LENGTH(N'[Questions]', N'QuestionGroupId') IS NULL
        BEGIN
            ALTER TABLE [Questions] ADD [QuestionGroupId] int NULL;
        END;

        IF NOT EXISTS (
            SELECT 1
            FROM sys.foreign_keys
            WHERE name = N'FK_Questions_QuestionGroups_QuestionGroupId'
        )
        BEGIN
            ALTER TABLE [Questions]
            ADD CONSTRAINT [FK_Questions_QuestionGroups_QuestionGroupId]
                FOREIGN KEY ([QuestionGroupId]) REFERENCES [QuestionGroups] ([Id])
                ON DELETE CASCADE;
        END;
        IF COL_LENGTH(N'[Questions]', N'ImageUrl') IS NULL
        BEGIN
            ALTER TABLE [Questions] ADD [ImageUrl] nvarchar(max) NULL;
        END;
        """);
}
