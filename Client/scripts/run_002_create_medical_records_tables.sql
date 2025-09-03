-- Execute medical records tables creation
-- This script creates tables for medical history, vitals, and lab reports

-- Medical history/visits table
CREATE TABLE IF NOT EXISTS public.medical_visits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  visit_date DATE NOT NULL,
  chief_complaint TEXT,
  history_of_present_illness TEXT,
  physical_examination TEXT,
  diagnosis TEXT,
  treatment_plan TEXT,
  follow_up_instructions TEXT,
  next_visit_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patient vitals table
CREATE TABLE IF NOT EXISTS public.patient_vitals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  visit_id UUID REFERENCES public.medical_visits(id) ON DELETE CASCADE,
  recorded_by UUID REFERENCES public.users(id),
  height_cm DECIMAL(5,2),
  weight_kg DECIMAL(5,2),
  bmi DECIMAL(4,2),
  systolic_bp INTEGER,
  diastolic_bp INTEGER,
  heart_rate INTEGER,
  temperature_celsius DECIMAL(4,2),
  respiratory_rate INTEGER,
  oxygen_saturation INTEGER,
  blood_sugar DECIMAL(5,2),
  notes TEXT,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lab reports table
CREATE TABLE IF NOT EXISTS public.lab_reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  visit_id UUID REFERENCES public.medical_visits(id) ON DELETE SET NULL,
  ordered_by UUID REFERENCES public.doctors(id),
  report_type TEXT NOT NULL,
  test_name TEXT NOT NULL,
  test_date DATE NOT NULL,
  result_value TEXT,
  reference_range TEXT,
  unit TEXT,
  status TEXT CHECK (status IN ('pending', 'completed', 'cancelled')) DEFAULT 'pending',
  abnormal_flag BOOLEAN DEFAULT false,
  lab_technician TEXT,
  report_file_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prescriptions table
CREATE TABLE IF NOT EXISTS public.prescriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE,
  visit_id UUID REFERENCES public.medical_visits(id) ON DELETE CASCADE,
  medication_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  duration TEXT NOT NULL,
  instructions TEXT,
  quantity INTEGER,
  refills INTEGER DEFAULT 0,
  status TEXT CHECK (status IN ('active', 'completed', 'discontinued')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medical documents/files table
CREATE TABLE IF NOT EXISTS public.medical_documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  visit_id UUID REFERENCES public.medical_visits(id) ON DELETE SET NULL,
  uploaded_by UUID REFERENCES public.users(id),
  document_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for medical records
CREATE INDEX IF NOT EXISTS idx_medical_visits_patient_id ON public.medical_visits(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_visits_doctor_id ON public.medical_visits(doctor_id);
CREATE INDEX IF NOT EXISTS idx_medical_visits_date ON public.medical_visits(visit_date);
CREATE INDEX IF NOT EXISTS idx_patient_vitals_patient_id ON public.patient_vitals(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_vitals_visit_id ON public.patient_vitals(visit_id);
CREATE INDEX IF NOT EXISTS idx_lab_reports_patient_id ON public.lab_reports(patient_id);
CREATE INDEX IF NOT EXISTS idx_lab_reports_status ON public.lab_reports(status);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_id ON public.prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_status ON public.prescriptions(status);
