using System.ComponentModel.DataAnnotations;

namespace ClinicManagementSystem.Core.Entities
{
    public class PrescriptionTemplate : BaseEntity
    {
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string MedicineName { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? GenericName { get; set; }

        [MaxLength(50)]
        public string? Dosage { get; set; }

        [MaxLength(100)]
        public string? Frequency { get; set; }

        [MaxLength(50)]
        public string? Duration { get; set; }

        [MaxLength(200)]
        public string? Instructions { get; set; }

        [MaxLength(500)]
        public string? SideEffects { get; set; }

        [MaxLength(500)]
        public string? Contraindications { get; set; }

        [MaxLength(500)]
        public string? Interactions { get; set; }

        public bool IsGlobal { get; set; } = false; // Available to all doctors if true

        public int? DoctorId { get; set; } // If not global, specific to this doctor

        // Navigation properties
        public virtual Doctor? Doctor { get; set; }
    }
}