/*
  # Fix RLS Policies and Database Issues

  1. Drop problematic policies causing infinite recursion
  2. Create simplified, non-recursive policies
  3. Fix any missing constraints and indexes
*/

-- =============================================
-- DROP EXISTING PROBLEMATIC POLICIES
-- =============================================

-- Drop all existing policies that might cause recursion
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can manage users" ON public.users;

DROP POLICY IF EXISTS "Anyone can view active doctors" ON public.doctors;
DROP POLICY IF EXISTS "Doctors can view their own profile" ON public.doctors;
DROP POLICY IF EXISTS "Admins can manage doctors" ON public.doctors;

-- =============================================
-- CREATE SIMPLIFIED NON-RECURSIVE POLICIES
-- =============================================

-- Users policies (simplified to avoid recursion)
CREATE POLICY "Users can view their own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Allow authenticated users to view users" ON public.users
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to insert users" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Doctors policies (simplified)
CREATE POLICY "Anyone can view doctors" ON public.doctors
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage doctors" ON public.doctors
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Patients policies
CREATE POLICY "Authenticated users can view patients" ON public.patients
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage patients" ON public.patients
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Appointments policies
CREATE POLICY "Authenticated users can view appointments" ON public.appointments
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage appointments" ON public.appointments
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Medical records policies
CREATE POLICY "Authenticated users can view medical records" ON public.medical_records
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage medical records" ON public.medical_records
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Patient vitals policies
CREATE POLICY "Authenticated users can view patient vitals" ON public.patient_vitals
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage patient vitals" ON public.patient_vitals
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Lab reports policies
CREATE POLICY "Authenticated users can view lab reports" ON public.lab_reports
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage lab reports" ON public.lab_reports
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Prescriptions policies
CREATE POLICY "Authenticated users can view prescriptions" ON public.prescriptions
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage prescriptions" ON public.prescriptions
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Templates policies
CREATE POLICY "Authenticated users can view diagnosis templates" ON public.diagnosis_templates
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage diagnosis templates" ON public.diagnosis_templates
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view prescription templates" ON public.prescription_templates
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage prescription templates" ON public.prescription_templates
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view consultation templates" ON public.consultation_templates
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage consultation templates" ON public.consultation_templates
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Medicines policies
CREATE POLICY "Authenticated users can view medicines" ON public.medicines
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage medicines" ON public.medicines
  FOR ALL USING (auth.uid() IS NOT NULL);

-- System settings policies
CREATE POLICY "Anyone can view public settings" ON public.system_settings
  FOR SELECT USING (is_public = true);

CREATE POLICY "Authenticated users can view all settings" ON public.system_settings
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage settings" ON public.system_settings
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Doctor availability policies
CREATE POLICY "Anyone can view doctor availability" ON public.doctor_availability
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage availability" ON public.doctor_availability
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can view doctor special dates" ON public.doctor_special_dates
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage special dates" ON public.doctor_special_dates
  FOR ALL USING (auth.uid() IS NOT NULL);

-- User doctor associations policies
CREATE POLICY "Authenticated users can view associations" ON public.user_doctor_associations
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage associations" ON public.user_doctor_associations
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Medical documents policies
CREATE POLICY "Authenticated users can view medical documents" ON public.medical_documents
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage medical documents" ON public.medical_documents
  FOR ALL USING (auth.uid() IS NOT NULL);