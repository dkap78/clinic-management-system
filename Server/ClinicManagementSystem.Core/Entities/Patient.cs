using System.ComponentModel.DataAnnotations;

namespace ClinicManagementSystem.Core.Entities
{
    public class Patient : BaseEntity
    {
        [Required]
        [MaxLength(100)]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string LastName { get; set; } = string.Empty;

        [Required]
        public DateTime DateOfBirth { get; set; }

        [Required]
        [MaxLength(10)]
        public string Gender { get; set; } = string.Empty;

        [MaxLength(20)]
        public string? PhoneNumber { get; set; }

        [MaxLength(100)]
        public string? Email { get; set; }

        [MaxLength(200)]
        public string? Address { get; set; }

        [MaxLength(50)]
        public string? BloodGroup { get; set; }

        [MaxLength(500)]
        public string? EmergencyContact { get; set; }

        [MaxLength(1000)]
        public string? Allergies { get; set; }

        [MaxLength(1000)]
        public string? MedicalHistory { get; set; }

        [Required]
        public string UserId { get; set; } = string.Empty;

        // Navigation properties
        public virtual User User { get; set; } = null!;
        public virtual ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
        public virtual ICollection<PatientVitals> PatientVitals { get; set; } = new List<PatientVitals>();
        public virtual ICollection<LabReport> LabReports { get; set; } = new List<LabReport>();
        public virtual ICollection<Consultation> Consultations { get; set; } = new List<Consultation>();
    }
}