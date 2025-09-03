using ClinicManagementSystem.Core.Entities;

namespace ClinicManagementSystem.Core.Interfaces
{
    public interface IUnitOfWork : IDisposable
    {
        IRepository<Doctor> Doctors { get; }
        IRepository<Patient> Patients { get; }
        IRepository<Appointment> Appointments { get; }
        IRepository<DoctorAvailability> DoctorAvailabilities { get; }
        IRepository<PatientVitals> PatientVitals { get; }
        IRepository<Consultation> Consultations { get; }
        IRepository<LabReport> LabReports { get; }
        IRepository<DiagnosisTemplate> DiagnosisTemplates { get; }
        IRepository<PrescriptionTemplate> PrescriptionTemplates { get; }
        IRepository<UserDoctor> UserDoctors { get; }

        Task<int> SaveChangesAsync();
        Task BeginTransactionAsync();
        Task CommitTransactionAsync();
        Task RollbackTransactionAsync();
    }
}