using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ClinicManagementSystem.Core.DTOs;
using ClinicManagementSystem.Core.Entities;
using ClinicManagementSystem.Core.Interfaces;
using ClinicManagementSystem.Infrastructure.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace ClinicManagementSystem.Infrastructure.Services
{
	public class AuthService : IAuthService
	{
		private readonly UserManager<User> _userManager;
		private readonly IConfiguration _configuration;
		private readonly ApplicationDbContext _dbContext;
		private readonly IUnitOfWork _unitOfWork;

		public AuthService(
			UserManager<User> userManager,
			IConfiguration configuration,
			ApplicationDbContext dbContext,
			IUnitOfWork unitOfWork)
		{
			_userManager = userManager;
			_configuration = configuration;
			_dbContext = dbContext;
			_unitOfWork = unitOfWork;
		}

		public async Task<LoginResponseDto> LoginAsync(LoginRequestDto loginRequest)
		{
			var user = await _userManager.Users.FirstOrDefaultAsync(u => u.Email == loginRequest.Email);
			if (user == null)
			{
				return new LoginResponseDto();
			}

			var passwordValid = await _userManager.CheckPasswordAsync(user, loginRequest.Password);
			if (!passwordValid)
			{
				return new LoginResponseDto();
			}

			Doctor? doctor = await _dbContext.Doctors
				.Join(_dbContext.UserDoctors, d => d.Id, ud => ud.DoctorId, (d, ud) => new { d, ud })
				.Where(x => x.ud.UserId == user.Id)
				.Select(x => x.d)
				.FirstOrDefaultAsync();

			var userDto = new UserDto
			{
				Id = user.Id,
				Email = user.Email!,
				FirstName = user.FirstName,
				LastName = user.LastName,
				IsActive = user.IsActive
			};

			DoctorDto? doctorDto = doctor == null
				? null
				: new DoctorDto
				{
					Id = doctor.Id,
					FirstName = doctor.FirstName,
					LastName = doctor.LastName,
					Specialization = doctor.Specialization,
					LicenseNumber = doctor.LicenseNumber,
					Email = doctor.Email,
					PhoneNumber = doctor.PhoneNumber,
					ExperienceYears = doctor.ExperienceYears,
					ConsultationFee = doctor.ConsultationFee,
					Biography = doctor.Biography,
					IsActive = true,
					CreatedAt = DateTime.UtcNow
				};

			var token = await GenerateJwtTokenAsync(userDto, doctorDto!);

			return new LoginResponseDto
			{
				Token = token,
				RefreshToken = string.Empty,
				Expiration = DateTime.UtcNow.AddHours(2),
				User = userDto,
				Doctor = doctorDto!
			};
		}

		public Task<bool> LogoutAsync(string userId)
		{
			return Task.FromResult(true);
		}

		public Task<string> GenerateJwtTokenAsync(UserDto user, DoctorDto doctor)
		{
			var jwtSettings = _configuration.GetSection("JwtSettings");
			var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["SecretKey"]!));
			var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

			var claims = new List<Claim>
			{
				new(JwtRegisteredClaimNames.Sub, user.Id),
				new(JwtRegisteredClaimNames.Email, user.Email),
				new("firstName", user.FirstName ?? string.Empty),
				new("lastName", user.LastName ?? string.Empty)
			};

			if (doctor != null)
			{
				claims.Add(new Claim("doctorId", doctor.Id.ToString()));
			}

			var token = new JwtSecurityToken(
				issuer: jwtSettings["Issuer"],
				audience: jwtSettings["Audience"],
				claims: claims,
				expires: DateTime.UtcNow.AddHours(2),
				signingCredentials: creds
			);

			var tokenString = new JwtSecurityTokenHandler().WriteToken(token);
			return Task.FromResult(tokenString);
		}

		public Task<bool> ValidateTokenAsync(string token)
		{
			try
			{
				var jwtSettings = _configuration.GetSection("JwtSettings");
				var tokenHandler = new JwtSecurityTokenHandler();
				var key = Encoding.UTF8.GetBytes(jwtSettings["SecretKey"]!);
				tokenHandler.ValidateToken(token, new TokenValidationParameters
				{
					ValidateIssuerSigningKey = true,
					IssuerSigningKey = new SymmetricSecurityKey(key),
					ValidateIssuer = true,
					ValidateAudience = true,
					ValidIssuer = jwtSettings["Issuer"],
					ValidAudience = jwtSettings["Audience"],
					ClockSkew = TimeSpan.Zero
				}, out _);
				return Task.FromResult(true);
			}
			catch
			{
				return Task.FromResult(false);
			}
		}

		public Task<UserDto?> GetUserFromTokenAsync(string token)
		{
			var handler = new JwtSecurityTokenHandler();
			var jwt = handler.ReadJwtToken(token);
			var id = jwt.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Sub)?.Value;
			var email = jwt.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Email)?.Value;
			if (id == null || email == null) return Task.FromResult<UserDto?>(null);

			return Task.FromResult<UserDto?>(new UserDto
			{
				Id = id,
				Email = email,
				FirstName = jwt.Claims.FirstOrDefault(c => c.Type == "firstName")?.Value,
				LastName = jwt.Claims.FirstOrDefault(c => c.Type == "lastName")?.Value,
				IsActive = true
			});
		}

		public async Task<List<DoctorDto>> GetAvailableDoctorsForUserAsync(string userId)
		{
			var doctors = await _dbContext.Doctors
				.Where(d => d.IsActive)
				.Select(d => new DoctorDto
				{
					Id = d.Id,
					FirstName = d.FirstName,
					LastName = d.LastName,
					Specialization = d.Specialization,
					LicenseNumber = d.LicenseNumber,
					Email = d.Email,
					PhoneNumber = d.PhoneNumber,
					ExperienceYears = d.ExperienceYears,
					ConsultationFee = d.ConsultationFee,
					Biography = d.Biography,
					IsActive = true,
					CreatedAt = DateTime.UtcNow
				})
				.ToListAsync();

			return doctors;
		}
	}
}