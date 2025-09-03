using System.ComponentModel.DataAnnotations;

namespace ClinicManagementSystem.Core.Entities
{
    public class UserDoctor : BaseEntity
    {
        [Required]
        public string UserId { get; set; } = string.Empty;

        [Required]
        public int DoctorId { get; set; }

        // Navigation properties
        public virtual User User { get; set; } = null!;
        public virtual Doctor Doctor { get; set; } = null!;
    }
}