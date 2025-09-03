using ClinicManagementSystem.Core.DTOs;
using ClinicManagementSystem.Core.Entities;

namespace ClinicManagementSystem.Core.Interfaces
{
    public interface IAppointmentService
    {
        Task<AppointmentDto> CreateAppointmentAsync(CreateAppointmentDto createAppointmentDto, string userId);
        Task<AppointmentDto> UpdateAppointmentAsync(int appointmentId, UpdateAppointmentDto updateAppointmentDto, string userId);
        Task<bool> CancelAppointmentAsync(int appointmentId, string cancellationReason, string userId);
        Task<bool> RescheduleAppointmentAsync(int appointmentId, DateTime newDateTime, string userId);
        Task<AppointmentDto?> GetAppointmentByIdAsync(int appointmentId, string userId);
        Task<IEnumerable<AppointmentDto>> GetAppointmentsByPatientAsync(int patientId, string userId);
        Task<IEnumerable<AppointmentDto>> GetAppointmentsByDoctorAsync(int doctorId, DateTime? startDate = null, DateTime? endDate = null);
        Task<IEnumerable<AppointmentDto>> GetUpcomingAppointmentsAsync(string userId, int doctorId);
        Task<IEnumerable<DateTime>> GetAvailableTimeSlotsAsync(int doctorId, DateTime date);
        Task<bool> IsTimeSlotAvailableAsync(int doctorId, DateTime dateTime, int duration);
    }
}