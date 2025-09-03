using ClinicManagementSystem.Core.Entities;

namespace ClinicManagementSystem.Core.DTOs
{
    public class AppointmentDto
    {
        public int Id { get; set; }
        public int PatientId { get; set; }
        public int DoctorId { get; set; }
        public DateTime AppointmentDateTime { get; set; }
        public AppointmentType AppointmentType { get; set; }
        public AppointmentStatus Status { get; set; }
        public string? ReasonForVisit { get; set; }
        public string? Notes { get; set; }
        public int Duration { get; set; }
        public DateTime? RescheduledFrom { get; set; }
        public string? CancellationReason { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }

        // Navigation properties
        public PatientDto? Patient { get; set; }
        public DoctorDto? Doctor { get; set; }
    }

    public class CreateAppointmentDto
    {
        public int PatientId { get; set; }
        public int DoctorId { get; set; }
        public DateTime AppointmentDateTime { get; set; }
        public AppointmentType AppointmentType { get; set; }
        public string? ReasonForVisit { get; set; }
        public string? Notes { get; set; }
        public int Duration { get; set; } = 30;
    }

    public class UpdateAppointmentDto
    {
        public DateTime? AppointmentDateTime { get; set; }
        public AppointmentType? AppointmentType { get; set; }
        public AppointmentStatus? Status { get; set; }
        public string? ReasonForVisit { get; set; }
        public string? Notes { get; set; }
        public int? Duration { get; set; }
        public string? CancellationReason { get; set; }
    }
}