using System.ComponentModel.DataAnnotations;

namespace ClinicManagementSystem.Core.Entities
{
    public class Consultation : BaseEntity
    {
        [Required]
        public int AppointmentId { get; set; }

        [Required]
        public int PatientId { get; set; }

        [Required]
        public int DoctorId { get; set; }

        public DateTime ConsultationDate { get; set; } = DateTime.UtcNow;

        [MaxLength(1000)]
        public string? ChiefComplaint { get; set; }

        [MaxLength(2000)]
        public string? HistoryOfPresentIllness { get; set; }

        [MaxLength(1000)]
        public string? PhysicalExamination { get; set; }

        [MaxLength(1000)]
        public string? Diagnosis { get; set; }

        [MaxLength(2000)]
        public string? Treatment { get; set; }

        [MaxLength(1000)]
        public string? Prescription { get; set; }

        [MaxLength(500)]
        public string? FollowUpInstructions { get; set; }

        public DateTime? NextAppointmentDate { get; set; }

        [MaxLength(500)]
        public string? DoctorNotes { get; set; }

        // AI-generated suggestions
        [MaxLength(1000)]
        public string? AISuggestions { get; set; }

        // Navigation properties
        public virtual Appointment Appointment { get; set; } = null!;
        public virtual Patient Patient { get; set; } = null!;
        public virtual Doctor Doctor { get; set; } = null!;
        public virtual ICollection<PatientVitals> PatientVitals { get; set; } = new List<PatientVitals>();
    }
}