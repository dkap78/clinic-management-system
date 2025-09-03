using ClinicManagementSystem.Core.DTOs;

namespace ClinicManagementSystem.Core.Interfaces
{
    public interface IAuthService
    {
        Task<LoginResponseDto> LoginAsync(LoginRequestDto loginRequest);
        Task<bool> LogoutAsync(string userId);
        Task<string> GenerateJwtTokenAsync(UserDto user, DoctorDto doctor);
        Task<bool> ValidateTokenAsync(string token);
        Task<UserDto?> GetUserFromTokenAsync(string token);
        Task<List<DoctorDto>> GetAvailableDoctorsForUserAsync(string userId);
    }
}