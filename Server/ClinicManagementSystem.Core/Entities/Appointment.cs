using System.ComponentModel.DataAnnotations;

namespace ClinicManagementSystem.Core.Entities
{
    public enum AppointmentType
    {
        Online,
        Offline
    }

    public enum AppointmentStatus
    {
        Scheduled,
        Confirmed,
        InProgress,
        Completed,
        Cancelled,
        Rescheduled
    }

    public class Appointment : BaseEntity
    {
        [Required]
        public int PatientId { get; set; }

        [Required]
        public int DoctorId { get; set; }

        [Required]
        public DateTime AppointmentDateTime { get; set; }

        [Required]
        public AppointmentType AppointmentType { get; set; }

        [Required]
        public AppointmentStatus Status { get; set; } = AppointmentStatus.Scheduled;

        [MaxLength(500)]
        public string? ReasonForVisit { get; set; }

        [MaxLength(500)]
        public string? Notes { get; set; }

        public int Duration { get; set; } = 30; // Duration in minutes

        public DateTime? RescheduledFrom { get; set; }

        [MaxLength(200)]
        public string? CancellationReason { get; set; }

        // Navigation properties
        public virtual Patient Patient { get; set; } = null!;
        public virtual Doctor Doctor { get; set; } = null!;
        public virtual Consultation? Consultation { get; set; }
    }
}