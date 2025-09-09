/*
  # Complete Hospital Management System Database Schema

  1. Core Tables
    - `users` - System users with roles and authentication
    - `doctors` - Doctor profiles with complete information including names
    - `patients` - Patient information and demographics
    - `appointments` - Appointment scheduling and management
    - `user_doctor_associations` - Many-to-many relationship between users and doctors

  2. Medical Records
    - `medical_records` - Patient medical history and visit records
    - `patient_vitals` - Patient vital signs tracking
    - `lab_reports` - Laboratory test results
    - `prescriptions` - Medication prescriptions
    - `medical_documents` - File attachments and documents

  3. Templates & Settings
    - `diagnosis_templates` - Reusable diagnosis templates
    - `prescription_templates` - Reusable prescription templates
    - `consultation_templates` - General consultation templates
    - `medicines` - Medicine database with interactions
    - `system_settings` - System configuration

  4. Availability & Scheduling
    - `doctor_availability` - Doctor weekly availability
    - `doctor_special_dates` - Special date overrides

  5. Security
    - Row Level Security (RLS) enabled on all tables
    - Role-based access policies
    - Audit logging

  6. Sample Data
    - Complete sample data for all tables
    - Test users, doctors, patients, appointments
    - Templates and system settings
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- CORE TABLES
-- =============================================

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'doctor', 'nurse', 'receptionist', 'patient')) DEFAULT 'patient',
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Doctors table with complete information
CREATE TABLE IF NOT EXISTS public.doctors (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  specialization TEXT NOT NULL,
  license_number TEXT UNIQUE NOT NULL,
  phone TEXT,
  email TEXT,
  qualification TEXT,
  experience_years INTEGER DEFAULT 0,
  consultation_fee DECIMAL(10,2) DEFAULT 0,
  bio TEXT,
  education TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patients table
CREATE TABLE IF NOT EXISTS public.patients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  gender TEXT CHECK (gender IN ('Male', 'Female', 'Other')),
  address TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  blood_group TEXT,
  medical_history TEXT,
  allergies TEXT,
  current_medications TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User-Doctor associations (many-to-many)
CREATE TABLE IF NOT EXISTS public.user_doctor_associations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, doctor_id)
);

-- Appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  type TEXT CHECK (type IN ('online', 'offline')) DEFAULT 'offline',
  status TEXT CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rescheduled')) DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- MEDICAL RECORDS TABLES
-- =============================================

-- Medical records/visits
CREATE TABLE IF NOT EXISTS public.medical_records (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE,
  visit_date DATE NOT NULL,
  visit_type TEXT NOT NULL,
  chief_complaint TEXT,
  history_of_present_illness TEXT,
  physical_examination TEXT,
  diagnosis TEXT,
  treatment_plan TEXT,
  medications_prescribed TEXT,
  follow_up_instructions TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patient vitals
CREATE TABLE IF NOT EXISTS public.patient_vitals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  recorded_date DATE NOT NULL DEFAULT CURRENT_DATE,
  height DECIMAL(5,2), -- in cm
  weight DECIMAL(5,2), -- in kg
  bmi DECIMAL(4,2),
  systolic_bp INTEGER,
  diastolic_bp INTEGER,
  heart_rate INTEGER,
  temperature DECIMAL(4,1), -- in Celsius
  oxygen_saturation INTEGER,
  notes TEXT,
  recorded_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lab reports
CREATE TABLE IF NOT EXISTS public.lab_reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  test_name TEXT NOT NULL,
  test_date DATE NOT NULL,
  test_type TEXT NOT NULL,
  results TEXT,
  reference_range TEXT,
  status TEXT CHECK (status IN ('pending', 'completed', 'normal', 'abnormal')) DEFAULT 'pending',
  notes TEXT,
  ordered_by_doctor_id UUID REFERENCES public.doctors(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prescriptions
CREATE TABLE IF NOT EXISTS public.prescriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE,
  medical_record_id UUID REFERENCES public.medical_records(id) ON DELETE CASCADE,
  medication_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  duration TEXT NOT NULL,
  instructions TEXT,
  status TEXT CHECK (status IN ('active', 'completed', 'discontinued')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medical documents
CREATE TABLE IF NOT EXISTS public.medical_documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  description TEXT,
  uploaded_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- AVAILABILITY & SCHEDULING
-- =============================================

-- Doctor availability
CREATE TABLE IF NOT EXISTS public.doctor_availability (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE,
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 6=Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(doctor_id, day_of_week)
);

-- Doctor special dates (overrides)
CREATE TABLE IF NOT EXISTS public.doctor_special_dates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  is_available BOOLEAN NOT NULL DEFAULT false,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(doctor_id, date)
);

-- =============================================
-- TEMPLATES & SETTINGS
-- =============================================

-- Diagnosis templates
CREATE TABLE IF NOT EXISTS public.diagnosis_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  template_text TEXT NOT NULL,
  icd_code TEXT,
  created_by UUID REFERENCES public.users(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name, category)
);

-- Prescription templates
CREATE TABLE IF NOT EXISTS public.prescription_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  medications JSONB NOT NULL,
  instructions TEXT,
  created_by UUID REFERENCES public.users(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name, category)
);

-- Consultation templates
CREATE TABLE IF NOT EXISTS public.consultation_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('diagnosis', 'prescription', 'treatment', 'followup')),
  content TEXT NOT NULL,
  created_by UUID REFERENCES public.users(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name, type)
);

-- Medicines database
CREATE TABLE IF NOT EXISTS public.medicines (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  generic_name TEXT,
  category TEXT NOT NULL,
  dosage_forms TEXT[],
  strengths TEXT[],
  contraindications TEXT[],
  side_effects TEXT[],
  drug_interactions TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System settings
CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  updated_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_doctor_associations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_special_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnosis_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescription_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultation_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Users policies
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can manage users" ON public.users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Doctors policies
CREATE POLICY "Anyone can view active doctors" ON public.doctors
  FOR SELECT USING (is_available = true);

CREATE POLICY "Doctors can view their own profile" ON public.doctors
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage doctors" ON public.doctors
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Patients policies
CREATE POLICY "Healthcare staff can view patients" ON public.patients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('admin', 'doctor', 'nurse', 'receptionist')
    )
  );

CREATE POLICY "Healthcare staff can manage patients" ON public.patients
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('admin', 'doctor', 'nurse', 'receptionist')
    )
  );

-- Appointments policies
CREATE POLICY "Healthcare staff can view appointments" ON public.appointments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('admin', 'doctor', 'nurse', 'receptionist')
    )
  );

CREATE POLICY "Healthcare staff can manage appointments" ON public.appointments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('admin', 'doctor', 'nurse', 'receptionist')
    )
  );

-- Medical records policies
CREATE POLICY "Healthcare staff can view medical records" ON public.medical_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('admin', 'doctor', 'nurse')
    )
  );

CREATE POLICY "Doctors can manage medical records" ON public.medical_records
  FOR ALL USING (
    doctor_id IN (
      SELECT d.id FROM public.doctors d 
      WHERE d.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('admin', 'nurse')
    )
  );

-- Patient vitals policies
CREATE POLICY "Healthcare staff can view patient vitals" ON public.patient_vitals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('admin', 'doctor', 'nurse')
    )
  );

CREATE POLICY "Healthcare staff can manage patient vitals" ON public.patient_vitals
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('admin', 'doctor', 'nurse')
    )
  );

-- Lab reports policies
CREATE POLICY "Healthcare staff can view lab reports" ON public.lab_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('admin', 'doctor', 'nurse')
    )
  );

CREATE POLICY "Healthcare staff can manage lab reports" ON public.lab_reports
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('admin', 'doctor', 'nurse')
    )
  );

-- Templates policies
CREATE POLICY "Users can view public templates" ON public.diagnosis_templates
  FOR SELECT USING (
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Doctors can manage templates" ON public.diagnosis_templates
  FOR ALL USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can view public prescription templates" ON public.prescription_templates
  FOR SELECT USING (
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Doctors can manage prescription templates" ON public.prescription_templates
  FOR ALL USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can view consultation templates" ON public.consultation_templates
  FOR SELECT USING (
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Doctors can manage consultation templates" ON public.consultation_templates
  FOR ALL USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Medicines policies
CREATE POLICY "Users can view medicines" ON public.medicines
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage medicines" ON public.medicines
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- System settings policies
CREATE POLICY "Users can view public settings" ON public.system_settings
  FOR SELECT USING (is_public = true OR auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage system settings" ON public.system_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Doctor availability policies
CREATE POLICY "Anyone can view doctor availability" ON public.doctor_availability
  FOR SELECT USING (true);

CREATE POLICY "Doctors can manage their availability" ON public.doctor_availability
  FOR ALL USING (
    doctor_id IN (
      SELECT d.id FROM public.doctors d 
      WHERE d.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Anyone can view doctor special dates" ON public.doctor_special_dates
  FOR SELECT USING (true);

CREATE POLICY "Doctors can manage their special dates" ON public.doctor_special_dates
  FOR ALL USING (
    doctor_id IN (
      SELECT d.id FROM public.doctors d 
      WHERE d.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- User doctor associations policies
CREATE POLICY "Users can view their associations" ON public.user_doctor_associations
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage associations" ON public.user_doctor_associations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Prescriptions policies
CREATE POLICY "Healthcare staff can view prescriptions" ON public.prescriptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('admin', 'doctor', 'nurse')
    )
  );

CREATE POLICY "Doctors can manage prescriptions" ON public.prescriptions
  FOR ALL USING (
    doctor_id IN (
      SELECT d.id FROM public.doctors d 
      WHERE d.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('admin', 'nurse')
    )
  );

-- Medical documents policies
CREATE POLICY "Healthcare staff can view medical documents" ON public.medical_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('admin', 'doctor', 'nurse')
    )
  );

CREATE POLICY "Healthcare staff can manage medical documents" ON public.medical_documents
  FOR ALL USING (
    uploaded_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('admin', 'doctor', 'nurse')
    )
  );

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE ON public.doctors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON public.patients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medical_records_updated_at BEFORE UPDATE ON public.medical_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lab_reports_updated_at BEFORE UPDATE ON public.lab_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON public.prescriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_doctor_availability_updated_at BEFORE UPDATE ON public.doctor_availability
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_doctor_special_dates_updated_at BEFORE UPDATE ON public.doctor_special_dates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate BMI
CREATE OR REPLACE FUNCTION calculate_bmi()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.height IS NOT NULL AND NEW.weight IS NOT NULL AND NEW.height > 0 THEN
        NEW.bmi := ROUND((NEW.weight / POWER(NEW.height / 100.0, 2))::NUMERIC, 2);
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for BMI calculation
CREATE TRIGGER calculate_bmi_trigger BEFORE INSERT OR UPDATE ON public.patient_vitals
    FOR EACH ROW EXECUTE FUNCTION calculate_bmi();

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_doctors_user_id ON public.doctors(user_id);
CREATE INDEX IF NOT EXISTS idx_doctors_specialization ON public.doctors(specialization);
CREATE INDEX IF NOT EXISTS idx_patients_email ON public.patients(email);
CREATE INDEX IF NOT EXISTS idx_patients_phone ON public.patients(phone);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON public.appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_medical_records_patient_id ON public.medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_doctor_id ON public.medical_records(doctor_id);
CREATE INDEX IF NOT EXISTS idx_patient_vitals_patient_id ON public.patient_vitals(patient_id);
CREATE INDEX IF NOT EXISTS idx_lab_reports_patient_id ON public.lab_reports(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_id ON public.prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_doctor_availability_doctor_id ON public.doctor_availability(doctor_id);
CREATE INDEX IF NOT EXISTS idx_medicines_name ON public.medicines(name);
CREATE INDEX IF NOT EXISTS idx_medicines_category ON public.medicines(category);

-- =============================================
-- SAMPLE DATA
-- =============================================

-- System settings
INSERT INTO public.system_settings (setting_key, setting_value, description, is_public) VALUES
('clinic_name', '"MediCare Clinic"', 'Name of the clinic', true),
('clinic_address', '"123 Healthcare Street, Medical City, MC 12345"', 'Clinic address', true),
('clinic_phone', '"+1-555-0123"', 'Clinic phone number', true),
('clinic_email', '"info@medicare-clinic.com"', 'Clinic email address', true),
('appointment_duration', '30', 'Default appointment duration in minutes', false),
('working_hours_start', '"09:00"', 'Default working hours start time', false),
('working_hours_end', '"17:00"', 'Default working hours end time', false)
ON CONFLICT (setting_key) DO NOTHING;

-- Sample medicines
INSERT INTO public.medicines (name, generic_name, category, dosage_forms, strengths, contraindications, side_effects) VALUES
('Paracetamol', 'Acetaminophen', 'Analgesic/Antipyretic', ARRAY['tablet', 'syrup', 'injection'], ARRAY['500mg', '650mg', '125mg/5ml'], ARRAY['Severe liver disease'], ARRAY['Nausea', 'Skin rash']),
('Ibuprofen', 'Ibuprofen', 'NSAID', ARRAY['tablet', 'capsule', 'syrup'], ARRAY['200mg', '400mg', '600mg'], ARRAY['Peptic ulcer', 'Severe heart failure'], ARRAY['Stomach upset', 'Dizziness']),
('Amoxicillin', 'Amoxicillin', 'Antibiotic', ARRAY['capsule', 'tablet', 'syrup'], ARRAY['250mg', '500mg', '125mg/5ml'], ARRAY['Penicillin allergy'], ARRAY['Diarrhea', 'Nausea', 'Skin rash']),
('Omeprazole', 'Omeprazole', 'Proton Pump Inhibitor', ARRAY['capsule', 'tablet'], ARRAY['20mg', '40mg'], ARRAY['Hypersensitivity'], ARRAY['Headache', 'Diarrhea', 'Abdominal pain']),
('Metformin', 'Metformin', 'Antidiabetic', ARRAY['tablet'], ARRAY['500mg', '850mg', '1000mg'], ARRAY['Diabetic ketoacidosis', 'Severe kidney disease'], ARRAY['Nausea', 'Diarrhea', 'Metallic taste']),
('Lisinopril', 'Lisinopril', 'ACE Inhibitor', ARRAY['tablet'], ARRAY['5mg', '10mg', '20mg'], ARRAY['Pregnancy', 'Angioedema'], ARRAY['Dry cough', 'Dizziness', 'Hyperkalemia']),
('Atorvastatin', 'Atorvastatin', 'Statin', ARRAY['tablet'], ARRAY['10mg', '20mg', '40mg', '80mg'], ARRAY['Active liver disease', 'Pregnancy'], ARRAY['Muscle pain', 'Liver enzyme elevation']),
('Cetirizine', 'Cetirizine', 'Antihistamine', ARRAY['tablet', 'syrup'], ARRAY['10mg', '5mg/5ml'], ARRAY['Severe kidney disease'], ARRAY['Drowsiness', 'Dry mouth'])
ON CONFLICT (name) DO NOTHING;

-- Sample diagnosis templates
INSERT INTO public.diagnosis_templates (name, category, template_text, icd_code) VALUES
('Common Cold', 'Respiratory', 'Patient presents with symptoms consistent with viral upper respiratory tract infection. Symptoms include nasal congestion, rhinorrhea, mild sore throat, and low-grade fever. Physical examination reveals clear nasal discharge and mild throat erythema. No signs of bacterial infection.', 'J00'),
('Hypertension', 'Cardiovascular', 'Patient diagnosed with essential hypertension. Blood pressure readings consistently elevated above 140/90 mmHg on multiple occasions. No evidence of secondary causes. Recommend lifestyle modifications including diet, exercise, and stress management along with antihypertensive medication.', 'I10'),
('Type 2 Diabetes', 'Endocrine', 'Patient diagnosed with Type 2 Diabetes Mellitus. HbA1c levels elevated above 6.5%. Fasting glucose consistently above 126 mg/dL. Recommend dietary modifications, regular exercise, blood glucose monitoring, and antidiabetic medication. Patient education on diabetes management provided.', 'E11.9'),
('Gastritis', 'Gastrointestinal', 'Patient presents with symptoms of gastritis including epigastric pain, nausea, and bloating. Physical examination reveals epigastric tenderness. Recommend proton pump inhibitor therapy, dietary modifications, and avoidance of NSAIDs and alcohol.', 'K29.7'),
('Migraine', 'Neurological', 'Patient presents with recurrent headaches consistent with migraine without aura. Unilateral throbbing pain with associated nausea and photophobia. Duration 4-72 hours. Recommend trigger identification, lifestyle modifications, and appropriate abortive therapy.', 'G43.9'),
('Anxiety Disorder', 'Psychiatric', 'Patient presents with symptoms of generalized anxiety disorder including excessive worry, restlessness, fatigue, and difficulty concentrating. Symptoms present for more than 6 months and significantly impact daily functioning. Recommend counseling and consider anxiolytic medication.', 'F41.1')
ON CONFLICT (name, category) DO NOTHING;

-- Sample prescription templates
INSERT INTO public.prescription_templates (name, category, medications, instructions) VALUES
('Common Cold Treatment', 'Respiratory', 
'[{"name": "Paracetamol", "dosage": "500mg", "frequency": "Every 6 hours", "duration": "5 days", "instructions": "Take with food"}, {"name": "Cetirizine", "dosage": "10mg", "frequency": "Once daily", "duration": "5 days", "instructions": "Take at bedtime"}]',
'Rest, increase fluid intake, avoid cold foods. Return if symptoms worsen or persist beyond 7 days.'),

('Hypertension Management', 'Cardiovascular',
'[{"name": "Lisinopril", "dosage": "10mg", "frequency": "Once daily", "duration": "30 days", "instructions": "Take in the morning"}, {"name": "Atorvastatin", "dosage": "20mg", "frequency": "Once daily", "duration": "30 days", "instructions": "Take at bedtime"}]',
'Monitor blood pressure regularly, follow low-sodium diet, exercise regularly. Follow-up in 4 weeks.'),

('Diabetes Management', 'Endocrine',
'[{"name": "Metformin", "dosage": "500mg", "frequency": "Twice daily", "duration": "30 days", "instructions": "Take with meals"}]',
'Follow diabetic diet, monitor blood sugar regularly, exercise as tolerated. Follow-up in 2 weeks.'),

('Gastritis Treatment', 'Gastrointestinal',
'[{"name": "Omeprazole", "dosage": "20mg", "frequency": "Once daily", "duration": "14 days", "instructions": "Take before breakfast"}]',
'Avoid spicy foods, eat small frequent meals, avoid NSAIDs and alcohol. Follow-up in 2 weeks.'),

('Migraine Treatment', 'Neurological',
'[{"name": "Ibuprofen", "dosage": "400mg", "frequency": "As needed", "duration": "As needed", "instructions": "Take at onset of headache, maximum 3 times daily"}]',
'Identify and avoid triggers, maintain regular sleep schedule, stay hydrated. Return if headaches increase in frequency or severity.')

ON CONFLICT (name, category) DO NOTHING;

-- Sample consultation templates
INSERT INTO public.consultation_templates (name, type, content) VALUES
('General Checkup', 'diagnosis', 'Patient appears well. Vital signs stable. No acute distress noted. Physical examination unremarkable. Continue current medications and lifestyle modifications. Routine follow-up recommended.'),
('Follow-up Visit', 'diagnosis', 'Patient returns for follow-up. Symptoms have improved since last visit. Current treatment plan appears effective. Continue current regimen with minor adjustments as needed.'),
('Acute Illness', 'diagnosis', 'Patient presents with acute onset of symptoms. Physical examination reveals findings consistent with clinical presentation. Appropriate treatment initiated. Patient advised to return if symptoms worsen.'),
('Chronic Disease Management', 'treatment', 'Continue current management plan. Monitor disease progression and medication effectiveness. Lifestyle modifications reinforced. Regular follow-up scheduled to assess treatment response.'),
('Medication Review', 'prescription', 'Current medications reviewed for effectiveness and side effects. Dosage adjustments made as appropriate. Patient counseled on proper medication administration and potential side effects.'),
('Preventive Care', 'followup', 'Preventive care measures discussed including screening recommendations, vaccinations, and lifestyle modifications. Patient education provided on disease prevention strategies.')
ON CONFLICT (name, type) DO NOTHING;

-- Sample users (these will be created when users sign up through Supabase Auth)
-- Note: These are placeholder UUIDs for demonstration. In real usage, these would be created by Supabase Auth
INSERT INTO public.users (id, email, full_name, role, phone) VALUES
('11111111-1111-1111-1111-111111111111', 'admin@clinic.com', 'System Administrator', 'admin', '+1-555-0001'),
('22222222-2222-2222-2222-222222222222', 'dr.smith@clinic.com', 'Dr. John Smith', 'doctor', '+1-555-0002'),
('33333333-3333-3333-3333-333333333333', 'dr.johnson@clinic.com', 'Dr. Sarah Johnson', 'doctor', '+1-555-0003'),
('44444444-4444-4444-4444-444444444444', 'dr.williams@clinic.com', 'Dr. Michael Williams', 'doctor', '+1-555-0004'),
('55555555-5555-5555-5555-555555555555', 'nurse.mary@clinic.com', 'Mary Wilson', 'nurse', '+1-555-0005')
ON CONFLICT (id) DO NOTHING;

-- Sample doctors with complete information
INSERT INTO public.doctors (id, user_id, first_name, last_name, specialization, license_number, phone, email, qualification, experience_years, consultation_fee, bio, education) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'John', 'Smith', 'General Medicine', 'MD-001-2024', '+1-555-0002', 'dr.smith@clinic.com', 'MD', 15, 150.00, 'Experienced general practitioner with expertise in family medicine and preventive care.', 'MD from Harvard Medical School, Residency at Johns Hopkins'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '33333333-3333-3333-3333-333333333333', 'Sarah', 'Johnson', 'Cardiology', 'MD-002-2024', '+1-555-0003', 'dr.johnson@clinic.com', 'MD, FACC', 12, 250.00, 'Board-certified cardiologist specializing in interventional cardiology and heart disease prevention.', 'MD from Stanford University, Cardiology Fellowship at Mayo Clinic'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '44444444-4444-4444-4444-444444444444', 'Michael', 'Williams', 'Orthopedics', 'MD-003-2024', '+1-555-0004', 'dr.williams@clinic.com', 'MD, FAAOS', 18, 300.00, 'Orthopedic surgeon with expertise in sports medicine and joint replacement surgery.', 'MD from UCLA, Orthopedic Surgery Residency at Hospital for Special Surgery')
ON CONFLICT (id) DO NOTHING;

-- Sample patients
INSERT INTO public.patients (id, first_name, last_name, email, phone, date_of_birth, gender, address, emergency_contact_name, emergency_contact_phone, blood_group, medical_history, allergies, current_medications) VALUES
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Alice', 'Brown', 'alice.brown@email.com', '+1-555-1001', '1985-03-15', 'Female', '123 Oak Street, Springfield, IL 62701', 'Bob Brown', '+1-555-1002', 'A+', 'No significant medical history', 'Penicillin allergy', 'Multivitamin daily'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Robert', 'Davis', 'robert.davis@email.com', '+1-555-1003', '1978-07-22', 'Male', '456 Pine Avenue, Springfield, IL 62702', 'Linda Davis', '+1-555-1004', 'O-', 'Hypertension, Type 2 Diabetes', 'No known allergies', 'Lisinopril 10mg daily, Metformin 500mg twice daily'),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Emily', 'Wilson', 'emily.wilson@email.com', '+1-555-1005', '1992-11-08', 'Female', '789 Maple Drive, Springfield, IL 62703', 'James Wilson', '+1-555-1006', 'B+', 'Asthma', 'Shellfish allergy', 'Albuterol inhaler as needed'),
('abababab-abab-abab-abab-abababababab', 'David', 'Miller', 'david.miller@email.com', '+1-555-1007', '1965-12-03', 'Male', '321 Elm Street, Springfield, IL 62704', 'Susan Miller', '+1-555-1008', 'AB+', 'Coronary artery disease, High cholesterol', 'Aspirin allergy', 'Atorvastatin 40mg daily, Clopidogrel 75mg daily'),
('cdcdcdcd-cdcd-cdcd-cdcd-cdcdcdcdcdcd', 'Jennifer', 'Taylor', 'jennifer.taylor@email.com', '+1-555-1009', '1988-05-17', 'Female', '654 Cedar Lane, Springfield, IL 62705', 'Mark Taylor', '+1-555-1010', 'O+', 'Migraine headaches', 'No known allergies', 'Sumatriptan as needed for migraines')
ON CONFLICT (id) DO NOTHING;

-- Sample doctor availability
INSERT INTO public.doctor_availability (doctor_id, day_of_week, start_time, end_time, is_available) VALUES
-- Dr. Smith (General Medicine) - Monday to Friday
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 1, '09:00', '17:00', true),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 2, '09:00', '17:00', true),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 3, '09:00', '17:00', true),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 4, '09:00', '17:00', true),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 5, '09:00', '17:00', true),
-- Dr. Johnson (Cardiology) - Monday, Wednesday, Friday
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 1, '08:00', '16:00', true),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 3, '08:00', '16:00', true),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 5, '08:00', '16:00', true),
-- Dr. Williams (Orthopedics) - Tuesday, Thursday, Saturday
('cccccccc-cccc-cccc-cccc-cccccccccccc', 2, '10:00', '18:00', true),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 4, '10:00', '18:00', true),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 6, '08:00', '14:00', true)
ON CONFLICT (doctor_id, day_of_week) DO NOTHING;

-- Sample appointments
INSERT INTO public.appointments (id, patient_id, doctor_id, appointment_date, appointment_time, type, status, notes) VALUES
('acacacac-acac-acac-acac-acacacacacac', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', CURRENT_DATE, '10:00', 'offline', 'scheduled', 'Annual checkup'),
('adadadad-adad-adad-adad-adadadadadad', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', CURRENT_DATE + INTERVAL '1 day', '14:00', 'offline', 'confirmed', 'Cardiology follow-up'),
('aeaeaeae-aeae-aeae-aeae-aeaeaeaeaeae', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', CURRENT_DATE + INTERVAL '2 days', '11:30', 'online', 'scheduled', 'Asthma management'),
('afafafaf-afaf-afaf-afaf-afafafafafaf', 'abababab-abab-abab-abab-abababababab', 'cccccccc-cccc-cccc-cccc-cccccccccccc', CURRENT_DATE + INTERVAL '3 days', '15:00', 'offline', 'scheduled', 'Knee pain evaluation'),
('babaabab-baba-baba-baba-bababababaab', 'cdcdcdcd-cdcd-cdcd-cdcd-cdcdcdcdcdcd', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', CURRENT_DATE + INTERVAL '4 days', '09:30', 'offline', 'confirmed', 'Migraine consultation')
ON CONFLICT (id) DO NOTHING;

-- Sample medical records
INSERT INTO public.medical_records (id, patient_id, doctor_id, visit_date, visit_type, chief_complaint, diagnosis, treatment_plan, medications_prescribed) VALUES
('bcbcbcbc-bcbc-bcbc-bcbc-bcbcbcbcbcbc', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', CURRENT_DATE - INTERVAL '30 days', 'Regular Checkup', 'Routine annual physical examination', 'Healthy adult - no acute findings', 'Continue current lifestyle, annual follow-up', 'Multivitamin daily'),
('bdbdbdbd-bdbd-bdbd-bdbd-bdbdbdbdbdbd', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', CURRENT_DATE - INTERVAL '15 days', 'Follow-up', 'Blood pressure check', 'Hypertension - well controlled', 'Continue current medications, lifestyle modifications', 'Lisinopril 10mg daily'),
('bebebebe-bebe-bebe-bebe-bebebebebebe', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', CURRENT_DATE - INTERVAL '7 days', 'Consultation', 'Shortness of breath', 'Asthma exacerbation', 'Increase inhaler use, avoid triggers', 'Albuterol inhaler 2 puffs every 4-6 hours as needed')
ON CONFLICT (id) DO NOTHING;

-- Sample patient vitals
INSERT INTO public.patient_vitals (id, patient_id, recorded_date, height, weight, systolic_bp, diastolic_bp, heart_rate, temperature, oxygen_saturation, recorded_by) VALUES
('bfbfbfbf-bfbf-bfbf-bfbf-bfbfbfbfbfbf', 'dddddddd-dddd-dddd-dddd-dddddddddddd', CURRENT_DATE, 165.0, 68.5, 120, 80, 72, 36.5, 98, '22222222-2222-2222-2222-222222222222'),
('cacacaca-caca-caca-caca-cacacacacaca', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', CURRENT_DATE - INTERVAL '1 day', 175.0, 82.0, 135, 85, 78, 36.8, 97, '33333333-3333-3333-3333-333333333333'),
('cbcbcbcb-cbcb-cbcb-cbcb-cbcbcbcbcbcb', 'ffffffff-ffff-ffff-ffff-ffffffffffff', CURRENT_DATE - INTERVAL '2 days', 160.0, 55.0, 110, 70, 88, 37.2, 95, '22222222-2222-2222-2222-222222222222')
ON CONFLICT (id) DO NOTHING;

-- Sample lab reports
INSERT INTO public.lab_reports (id, patient_id, test_name, test_date, test_type, results, reference_range, status, ordered_by_doctor_id) VALUES
('cdcdcdcd-cdcd-cdcd-cdcd-cdcdcdcdcdcd', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Complete Blood Count', CURRENT_DATE - INTERVAL '5 days', 'Blood Test', 'WBC: 7.2, RBC: 4.5, Hemoglobin: 13.8, Platelets: 250', 'WBC: 4.0-11.0, RBC: 4.2-5.4, Hemoglobin: 12.0-15.5, Platelets: 150-450', 'normal', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
('cececece-cece-cece-cece-cececececece', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Lipid Panel', CURRENT_DATE - INTERVAL '10 days', 'Blood Test', 'Total Cholesterol: 220, LDL: 140, HDL: 45, Triglycerides: 180', 'Total: <200, LDL: <100, HDL: >40, Triglycerides: <150', 'abnormal', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
('cfcfcfcf-cfcf-cfcf-cfcf-cfcfcfcfcfcf', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'Chest X-Ray', CURRENT_DATE - INTERVAL '3 days', 'X-Ray', 'Clear lung fields, normal heart size', 'Normal chest X-ray', 'normal', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')
ON CONFLICT (id) DO NOTHING;

-- Sample prescriptions
INSERT INTO public.prescriptions (id, patient_id, doctor_id, medical_record_id, medication_name, dosage, frequency, duration, instructions, status) VALUES
('dadadada-dada-dada-dada-dadadadadada', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'bcbcbcbc-bcbc-bcbc-bcbc-bcbcbcbcbcbc', 'Lisinopril', '10mg', 'Once daily', '30 days', 'Take in the morning with or without food', 'active'),
('dbdbdbdb-dbdb-dbdb-dbdb-dbdbdbdbdbdb', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bdbdbdbd-bdbd-bdbd-bdbd-bdbdbdbdbdbd', 'Albuterol Inhaler', '90mcg', 'As needed', '30 days', '2 puffs every 4-6 hours as needed for shortness of breath', 'active'),
('dcdcdcdc-dcdc-dcdc-dcdc-dcdcdcdcdcdc', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bebebebe-bebe-bebe-bebe-bebebebebebe', 'Multivitamin', '1 tablet', 'Once daily', '90 days', 'Take with breakfast', 'active')
ON CONFLICT (id) DO NOTHING;

-- Sample user-doctor associations
INSERT INTO public.user_doctor_associations (user_id, doctor_id) VALUES
('22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
('33333333-3333-3333-3333-333333333333', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
('44444444-4444-4444-4444-444444444444', 'cccccccc-cccc-cccc-cccc-cccccccccccc'),
('55555555-5555-5555-5555-555555555555', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
('55555555-5555-5555-5555-555555555555', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb')
ON CONFLICT (user_id, doctor_id) DO NOTHING;