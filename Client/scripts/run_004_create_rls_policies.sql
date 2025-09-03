-- Execute Row Level Security policies
-- This script creates RLS policies for data security

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_special_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnosis_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescription_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert users" ON public.users
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can update any user" ON public.users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Doctors table policies
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

-- Patients table policies
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

-- Appointments table policies
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

-- Medical records policies (doctors can only see their patients' records)
CREATE POLICY "Doctors can view their patients' medical visits" ON public.medical_visits
  FOR SELECT USING (
    doctor_id IN (
      SELECT d.id FROM public.doctors d 
      WHERE d.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('admin', 'nurse')
    )
  );

CREATE POLICY "Doctors can manage their patients' medical visits" ON public.medical_visits
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

-- Similar policies for other medical record tables
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

-- Templates policies
CREATE POLICY "Doctors can view public templates and their own" ON public.diagnosis_templates
  FOR SELECT USING (
    is_public = true OR 
    created_by IN (
      SELECT d.id FROM public.doctors d 
      WHERE d.user_id = auth.uid()
    )
  );

CREATE POLICY "Doctors can manage their own templates" ON public.diagnosis_templates
  FOR ALL USING (
    created_by IN (
      SELECT d.id FROM public.doctors d 
      WHERE d.user_id = auth.uid()
    )
  );

-- System settings policies
CREATE POLICY "Admins can manage system settings" ON public.system_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can view public settings" ON public.system_settings
  FOR SELECT USING (is_public = true);
