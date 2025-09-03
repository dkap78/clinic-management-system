namespace ClinicManagementSystem.Core.DTOs
{
    public class LoginResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
        public DateTime Expiration { get; set; }
        public UserDto User { get; set; } = null!;
        public DoctorDto Doctor { get; set; } = null!;
    }
}