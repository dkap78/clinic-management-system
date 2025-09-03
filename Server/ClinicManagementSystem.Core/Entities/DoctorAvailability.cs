using System.ComponentModel.DataAnnotations;

namespace ClinicManagementSystem.Core.Entities
{
    public class DoctorAvailability : BaseEntity
    {
        [Required]
        public int DoctorId { get; set; }

        [Required]
        public DayOfWeek DayOfWeek { get; set; }

        [Required]
        public TimeSpan StartTime { get; set; }

        [Required]
        public TimeSpan EndTime { get; set; }

        public bool IsAvailable { get; set; } = true;

        // For specific date overrides
        public DateTime? SpecificDate { get; set; }

        [MaxLength(200)]
        public string? Notes { get; set; }

        // Navigation properties
        public virtual Doctor Doctor { get; set; } = null!;
    }
}