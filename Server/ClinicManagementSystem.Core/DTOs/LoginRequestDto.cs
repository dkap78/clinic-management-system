using System.ComponentModel.DataAnnotations;

namespace ClinicManagementSystem.Core.DTOs
{
    public class LoginRequestDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;

        [Required]
        public int DoctorId { get; set; }

        public bool RememberMe { get; set; } = false;
    }
}