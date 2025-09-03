using ClinicManagementSystem.Core.Entities;
using ClinicManagementSystem.Core.Interfaces;
using ClinicManagementSystem.Infrastructure.Data;
using ClinicManagementSystem.Infrastructure.Repositories;
using ClinicManagementSystem.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Configure Swagger with JWT support
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo 
    { 
        Title = "Clinic Management System API", 
        Version = "v1",
        Description = "A comprehensive clinic management system with appointment scheduling, patient records, and AI-assisted diagnosis."
    });
    
    // Add JWT authentication to Swagger
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token in the text input below.",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    
    c.AddSecurityRequirement(new OpenApiSecurityRequirement()
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                },
                Scheme = "oauth2",
                Name = "Bearer",
                In = ParameterLocation.Header,
            },
            new List<string>()
        }
    });
});

// Configure Entity Framework
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Configure Identity
builder.Services.AddIdentity<User, IdentityRole>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequiredLength = 6;
    options.User.RequireUniqueEmail = true;
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();

// Configure JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["SecretKey"]!)),
        ClockSkew = TimeSpan.Zero
    };
});

// Configure Authorization
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("Admin", policy => policy.RequireRole("Admin"));
    options.AddPolicy("Doctor", policy => policy.RequireRole("Doctor", "Admin"));
    options.AddPolicy("User", policy => policy.RequireRole("User", "Doctor", "Admin"));
});

// Register services
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<IAuthService, AuthService>();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// Configure AutoMapper
builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Clinic Management System API v1");
        c.RoutePrefix = string.Empty; // Set Swagger UI at the app's root
    });
}

app.UseHttpsRedirection();
app.UseCors("AllowAngularApp");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Create database and seed data
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
    
    try
    {
        await context.Database.EnsureCreatedAsync();
        await SeedDataAsync(userManager, roleManager, context);
    }
    catch (Exception ex)
    {
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while seeding the database.");
    }
}

app.Run();

static async Task SeedDataAsync(UserManager<User> userManager, RoleManager<IdentityRole> roleManager, ApplicationDbContext context)
{
    // Create roles
    string[] roles = { "Admin", "Doctor", "User" };
    foreach (var role in roles)
    {
        if (!await roleManager.RoleExistsAsync(role))
        {
            await roleManager.CreateAsync(new IdentityRole(role));
        }
    }

    // Create admin user
    if (await userManager.FindByEmailAsync("admin@clinic.com") == null)
    {
        var adminUser = new User
        {
            UserName = "admin@clinic.com",
            Email = "admin@clinic.com",
            FirstName = "System",
            LastName = "Administrator",
            EmailConfirmed = true,
            IsActive = true
        };

        var result = await userManager.CreateAsync(adminUser, "Admin@123");
        if (result.Succeeded)
        {
            await userManager.AddToRoleAsync(adminUser, "Admin");
        }
    }

    // Create sample doctor
    if (!context.Doctors.Any())
    {
        var doctor = new ClinicManagementSystem.Core.Entities.Doctor
        {
            FirstName = "John",
            LastName = "Smith",
            Specialization = "General Medicine",
            LicenseNumber = "MD001",
            Email = "dr.smith@clinic.com",
            PhoneNumber = "+1234567890",
            ExperienceYears = 15,
            ConsultationFee = 150.00m,
            Biography = "Experienced general practitioner with 15 years of practice.",
            IsActive = true
        };

        context.Doctors.Add(doctor);
        await context.SaveChangesAsync();
    }

    // Create sample user
    if (await userManager.FindByEmailAsync("user@clinic.com") == null)
    {
        var user = new User
        {
            UserName = "user@clinic.com",
            Email = "user@clinic.com",
            FirstName = "Jane",
            LastName = "Doe",
            EmailConfirmed = true,
            IsActive = true
        };

        var result = await userManager.CreateAsync(user, "User@123");
        if (result.Succeeded)
        {
            await userManager.AddToRoleAsync(user, "User");
            
            // Link user to doctor
            var doctor = context.Doctors.First();
            var userDoctor = new ClinicManagementSystem.Core.Entities.UserDoctor
            {
                UserId = user.Id,
                DoctorId = doctor.Id,
                IsActive = true
            };
            
            context.UserDoctors.Add(userDoctor);
            await context.SaveChangesAsync();
        }
    }
}