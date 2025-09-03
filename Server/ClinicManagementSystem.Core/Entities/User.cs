using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace ClinicManagementSystem.Core.Entities
{
    public class User : IdentityUser
    {
        [Required]
        [MaxLength(100)]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string LastName { get; set; } = string.Empty;

        [MaxLength(200)]
        public string? Address { get; set; }

        public DateTime? DateOfBirth { get; set; }

        [MaxLength(10)]
        public string? Gender { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public bool IsActive { get; set; } = true;

        // Navigation properties
        public virtual ICollection<UserDoctor> UserDoctors { get; set; } = new List<UserDoctor>();
        public virtual ICollection<Patient> Patients { get; set; } = new List<Patient>();
    }
}