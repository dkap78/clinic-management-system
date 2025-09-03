using ClinicManagementSystem.Core.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagementSystem.Infrastructure.Data
{
    public class ApplicationDbContext : IdentityDbContext<User>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<Doctor> Doctors { get; set; }
        public DbSet<Patient> Patients { get; set; }
        public DbSet<UserDoctor> UserDoctors { get; set; }
        public DbSet<DoctorAvailability> DoctorAvailabilities { get; set; }
        public DbSet<Appointment> Appointments { get; set; }
        public DbSet<PatientVitals> PatientVitals { get; set; }
        public DbSet<Consultation> Consultations { get; set; }
        public DbSet<LabReport> LabReports { get; set; }
        public DbSet<DiagnosisTemplate> DiagnosisTemplates { get; set; }
        public DbSet<PrescriptionTemplate> PrescriptionTemplates { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // User configuration
            builder.Entity<User>(entity =>
            {
                entity.Property(e => e.FirstName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.LastName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Address).HasMaxLength(200);
                entity.Property(e => e.Gender).HasMaxLength(10);
            });

            // Doctor configuration
            builder.Entity<Doctor>(entity =>
            {
                entity.Property(e => e.FirstName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.LastName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Specialization).IsRequired().HasMaxLength(100);
                entity.Property(e => e.LicenseNumber).IsRequired().HasMaxLength(50);
                entity.Property(e => e.PhoneNumber).HasMaxLength(20);
                entity.Property(e => e.Email).HasMaxLength(100);
                entity.Property(e => e.Address).HasMaxLength(200);
                entity.Property(e => e.Biography).HasMaxLength(500);
                entity.Property(e => e.ProfileImagePath).HasMaxLength(200);
                entity.Property(e => e.ConsultationFee).HasColumnType("decimal(18,2)");
                
                entity.HasIndex(e => e.LicenseNumber).IsUnique();
            });

            // Patient configuration
            builder.Entity<Patient>(entity =>
            {
                entity.Property(e => e.FirstName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.LastName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Gender).IsRequired().HasMaxLength(10);
                entity.Property(e => e.PhoneNumber).HasMaxLength(20);
                entity.Property(e => e.Email).HasMaxLength(100);
                entity.Property(e => e.Address).HasMaxLength(200);
                entity.Property(e => e.BloodGroup).HasMaxLength(50);
                entity.Property(e => e.EmergencyContact).HasMaxLength(500);
                entity.Property(e => e.Allergies).HasMaxLength(1000);
                entity.Property(e => e.MedicalHistory).HasMaxLength(1000);

                entity.HasOne(e => e.User)
                      .WithMany(e => e.Patients)
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // UserDoctor configuration
            builder.Entity<UserDoctor>(entity =>
            {
                entity.HasOne(e => e.User)
                      .WithMany(e => e.UserDoctors)
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Doctor)
                      .WithMany(e => e.UserDoctors)
                      .HasForeignKey(e => e.DoctorId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => new { e.UserId, e.DoctorId }).IsUnique();
            });

            // DoctorAvailability configuration
            builder.Entity<DoctorAvailability>(entity =>
            {
                entity.HasOne(e => e.Doctor)
                      .WithMany(e => e.DoctorAvailabilities)
                      .HasForeignKey(e => e.DoctorId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.Property(e => e.Notes).HasMaxLength(200);
            });

            // Appointment configuration
            builder.Entity<Appointment>(entity =>
            {
                entity.HasOne(e => e.Patient)
                      .WithMany(e => e.Appointments)
                      .HasForeignKey(e => e.PatientId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Doctor)
                      .WithMany(e => e.Appointments)
                      .HasForeignKey(e => e.DoctorId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.Property(e => e.ReasonForVisit).HasMaxLength(500);
                entity.Property(e => e.Notes).HasMaxLength(500);
                entity.Property(e => e.CancellationReason).HasMaxLength(200);
            });

            // PatientVitals configuration
            builder.Entity<PatientVitals>(entity =>
            {
                entity.HasOne(e => e.Patient)
                      .WithMany(e => e.PatientVitals)
                      .HasForeignKey(e => e.PatientId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Consultation)
                      .WithMany(e => e.PatientVitals)
                      .HasForeignKey(e => e.ConsultationId)
                      .OnDelete(DeleteBehavior.SetNull);

                entity.Property(e => e.Height).HasColumnType("decimal(5,2)");
                entity.Property(e => e.Weight).HasColumnType("decimal(5,2)");
                entity.Property(e => e.BMI).HasColumnType("decimal(4,2)");
                entity.Property(e => e.Temperature).HasColumnType("decimal(4,1)");
                entity.Property(e => e.OxygenSaturation).HasColumnType("decimal(5,2)");
                entity.Property(e => e.BloodPressure).HasMaxLength(20);
                entity.Property(e => e.Notes).HasMaxLength(500);
            });

            // Consultation configuration
            builder.Entity<Consultation>(entity =>
            {
                entity.HasOne(e => e.Appointment)
                      .WithOne(e => e.Consultation)
                      .HasForeignKey<Consultation>(e => e.AppointmentId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Patient)
                      .WithMany(e => e.Consultations)
                      .HasForeignKey(e => e.PatientId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Doctor)
                      .WithMany(e => e.Consultations)
                      .HasForeignKey(e => e.DoctorId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.Property(e => e.ChiefComplaint).HasMaxLength(1000);
                entity.Property(e => e.HistoryOfPresentIllness).HasMaxLength(2000);
                entity.Property(e => e.PhysicalExamination).HasMaxLength(1000);
                entity.Property(e => e.Diagnosis).HasMaxLength(1000);
                entity.Property(e => e.Treatment).HasMaxLength(2000);
                entity.Property(e => e.Prescription).HasMaxLength(1000);
                entity.Property(e => e.FollowUpInstructions).HasMaxLength(500);
                entity.Property(e => e.DoctorNotes).HasMaxLength(500);
                entity.Property(e => e.AISuggestions).HasMaxLength(1000);
            });

            // LabReport configuration
            builder.Entity<LabReport>(entity =>
            {
                entity.HasOne(e => e.Patient)
                      .WithMany(e => e.LabReports)
                      .HasForeignKey(e => e.PatientId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Consultation)
                      .WithMany()
                      .HasForeignKey(e => e.ConsultationId)
                      .OnDelete(DeleteBehavior.SetNull);

                entity.Property(e => e.TestName).IsRequired().HasMaxLength(200);
                entity.Property(e => e.LabName).HasMaxLength(100);
                entity.Property(e => e.ReportNumber).HasMaxLength(50);
                entity.Property(e => e.Results).HasMaxLength(2000);
                entity.Property(e => e.ReferenceRange).HasMaxLength(500);
                entity.Property(e => e.Interpretation).HasMaxLength(500);
                entity.Property(e => e.FilePath).HasMaxLength(200);
                entity.Property(e => e.OrderedBy).HasMaxLength(100);
            });

            // DiagnosisTemplate configuration
            builder.Entity<DiagnosisTemplate>(entity =>
            {
                entity.HasOne(e => e.Doctor)
                      .WithMany(e => e.DiagnosisTemplates)
                      .HasForeignKey(e => e.DoctorId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Description).IsRequired().HasMaxLength(2000);
                entity.Property(e => e.Category).HasMaxLength(100);
                entity.Property(e => e.ICDCode).HasMaxLength(100);
                entity.Property(e => e.Symptoms).HasMaxLength(1000);
                entity.Property(e => e.TreatmentGuidelines).HasMaxLength(1000);
            });

            // PrescriptionTemplate configuration
            builder.Entity<PrescriptionTemplate>(entity =>
            {
                entity.HasOne(e => e.Doctor)
                      .WithMany(e => e.PrescriptionTemplates)
                      .HasForeignKey(e => e.DoctorId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
                entity.Property(e => e.MedicineName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.GenericName).HasMaxLength(100);
                entity.Property(e => e.Dosage).HasMaxLength(50);
                entity.Property(e => e.Frequency).HasMaxLength(100);
                entity.Property(e => e.Duration).HasMaxLength(50);
                entity.Property(e => e.Instructions).HasMaxLength(200);
                entity.Property(e => e.SideEffects).HasMaxLength(500);
                entity.Property(e => e.Contraindications).HasMaxLength(500);
                entity.Property(e => e.Interactions).HasMaxLength(500);
            });

            // Configure enums
            builder.Entity<Appointment>()
                .Property(e => e.AppointmentType)
                .HasConversion<string>();

            builder.Entity<Appointment>()
                .Property(e => e.Status)
                .HasConversion<string>();
        }
    }
}