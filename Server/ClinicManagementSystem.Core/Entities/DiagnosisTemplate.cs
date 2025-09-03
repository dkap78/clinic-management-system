using System.ComponentModel.DataAnnotations;

namespace ClinicManagementSystem.Core.Entities
{
    public class DiagnosisTemplate : BaseEntity
    {
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [MaxLength(2000)]
        public string Description { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? Category { get; set; }

        [MaxLength(100)]
        public string? ICDCode { get; set; } // International Classification of Diseases code

        [MaxLength(1000)]
        public string? Symptoms { get; set; }

        [MaxLength(1000)]
        public string? TreatmentGuidelines { get; set; }

        public bool IsGlobal { get; set; } = false; // Available to all doctors if true

        public int? DoctorId { get; set; } // If not global, specific to this doctor

        // Navigation properties
        public virtual Doctor? Doctor { get; set; }
    }
}