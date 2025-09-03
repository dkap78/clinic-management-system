using System.ComponentModel.DataAnnotations;

namespace ClinicManagementSystem.Core.Entities
{
    public class PatientVitals : BaseEntity
    {
        [Required]
        public int PatientId { get; set; }

        public DateTime RecordedDate { get; set; } = DateTime.UtcNow;

        public decimal? Height { get; set; } // in cm

        public decimal? Weight { get; set; } // in kg

        public decimal? BMI { get; set; }

        [MaxLength(20)]
        public string? BloodPressure { get; set; } // e.g., "120/80"

        public decimal? Temperature { get; set; } // in Celsius

        public int? HeartRate { get; set; } // beats per minute

        public int? RespiratoryRate { get; set; } // breaths per minute

        public decimal? OxygenSaturation { get; set; } // percentage

        [MaxLength(500)]
        public string? Notes { get; set; }

        public int? ConsultationId { get; set; }

        // Navigation properties
        public virtual Patient Patient { get; set; } = null!;
        public virtual Consultation? Consultation { get; set; }
    }
}