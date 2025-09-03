using System.ComponentModel.DataAnnotations;

namespace ClinicManagementSystem.Core.Entities
{
    public class Doctor : BaseEntity
    {
        [Required]
        [MaxLength(100)]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string LastName { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Specialization { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string LicenseNumber { get; set; } = string.Empty;

        [MaxLength(20)]
        public string? PhoneNumber { get; set; }

        [MaxLength(100)]
        public string? Email { get; set; }

        [MaxLength(200)]
        public string? Address { get; set; }

        public int ExperienceYears { get; set; }

        [MaxLength(500)]
        public string? Biography { get; set; }

        [MaxLength(200)]
        public string? ProfileImagePath { get; set; }

        public decimal ConsultationFee { get; set; }

        // Navigation properties
        public virtual ICollection<UserDoctor> UserDoctors { get; set; } = new List<UserDoctor>();
        public virtual ICollection<DoctorAvailability> DoctorAvailabilities { get; set; } = new List<DoctorAvailability>();
        public virtual ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
        public virtual ICollection<DiagnosisTemplate> DiagnosisTemplates { get; set; } = new List<DiagnosisTemplate>();
        public virtual ICollection<PrescriptionTemplate> PrescriptionTemplates { get; set; } = new List<PrescriptionTemplate>();
        public virtual ICollection<Consultation> Consultations { get; set; } = new List<Consultation>();
    }
}