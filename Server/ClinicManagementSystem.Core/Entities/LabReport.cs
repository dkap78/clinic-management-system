using System.ComponentModel.DataAnnotations;

namespace ClinicManagementSystem.Core.Entities
{
    public class LabReport : BaseEntity
    {
        [Required]
        public int PatientId { get; set; }

        [Required]
        [MaxLength(200)]
        public string TestName { get; set; } = string.Empty;

        [Required]
        public DateTime TestDate { get; set; }

        [MaxLength(100)]
        public string? LabName { get; set; }

        [MaxLength(50)]
        public string? ReportNumber { get; set; }

        [MaxLength(2000)]
        public string? Results { get; set; }

        [MaxLength(500)]
        public string? ReferenceRange { get; set; }

        [MaxLength(500)]
        public string? Interpretation { get; set; }

        [MaxLength(200)]
        public string? FilePath { get; set; } // Path to uploaded report file

        [MaxLength(100)]
        public string? OrderedBy { get; set; } // Doctor who ordered the test

        public int? ConsultationId { get; set; }

        // Navigation properties
        public virtual Patient Patient { get; set; } = null!;
        public virtual Consultation? Consultation { get; set; }
    }
}