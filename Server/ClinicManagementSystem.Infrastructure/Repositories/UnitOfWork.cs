using ClinicManagementSystem.Core.Entities;
using ClinicManagementSystem.Core.Interfaces;
using ClinicManagementSystem.Infrastructure.Data;
using Microsoft.EntityFrameworkCore.Storage;

namespace ClinicManagementSystem.Infrastructure.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly ApplicationDbContext _context;
        private IDbContextTransaction? _transaction;

        public UnitOfWork(ApplicationDbContext context)
        {
            _context = context;
            Doctors = new Repository<Doctor>(_context);
            Patients = new Repository<Patient>(_context);
            Appointments = new Repository<Appointment>(_context);
            DoctorAvailabilities = new Repository<DoctorAvailability>(_context);
            PatientVitals = new Repository<PatientVitals>(_context);
            Consultations = new Repository<Consultation>(_context);
            LabReports = new Repository<LabReport>(_context);
            DiagnosisTemplates = new Repository<DiagnosisTemplate>(_context);
            PrescriptionTemplates = new Repository<PrescriptionTemplate>(_context);
            UserDoctors = new Repository<UserDoctor>(_context);
        }

        public IRepository<Doctor> Doctors { get; private set; }
        public IRepository<Patient> Patients { get; private set; }
        public IRepository<Appointment> Appointments { get; private set; }
        public IRepository<DoctorAvailability> DoctorAvailabilities { get; private set; }
        public IRepository<PatientVitals> PatientVitals { get; private set; }
        public IRepository<Consultation> Consultations { get; private set; }
        public IRepository<LabReport> LabReports { get; private set; }
        public IRepository<DiagnosisTemplate> DiagnosisTemplates { get; private set; }
        public IRepository<PrescriptionTemplate> PrescriptionTemplates { get; private set; }
        public IRepository<UserDoctor> UserDoctors { get; private set; }

        public async Task<int> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync();
        }

        public async Task BeginTransactionAsync()
        {
            _transaction = await _context.Database.BeginTransactionAsync();
        }

        public async Task CommitTransactionAsync()
        {
            try
            {
                await SaveChangesAsync();
                if (_transaction != null)
                {
                    await _transaction.CommitAsync();
                }
            }
            catch
            {
                await RollbackTransactionAsync();
                throw;
            }
            finally
            {
                if (_transaction != null)
                {
                    await _transaction.DisposeAsync();
                    _transaction = null;
                }
            }
        }

        public async Task RollbackTransactionAsync()
        {
            if (_transaction != null)
            {
                await _transaction.RollbackAsync();
                await _transaction.DisposeAsync();
                _transaction = null;
            }
        }

        public void Dispose()
        {
            _transaction?.Dispose();
            _context.Dispose();
        }
    }
}