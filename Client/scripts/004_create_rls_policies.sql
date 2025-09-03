-- Row Level Security Policies

-- Users table policies
CREATE POLICY "Users can view their own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can update their own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can insert users" ON public.users
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Doctors table policies
CREATE POLICY "Anyone can view active doctors" ON public.doctors
  FOR SELECT USING (is_available = true);

CREATE POLICY "Doctors can view their own data" ON public.doctors
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage doctors" ON public.doctors
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Doctor schedules policies
CREATE POLICY "Anyone can view doctor schedules" ON public.doctor_schedules
  FOR SELECT USING (true);

CREATE POLICY "Doctors can manage their own schedules" ON public.doctor_schedules
  FOR ALL USING (
    doctor_id IN (
      SELECT id FROM public.doctors WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all schedules" ON public.doctor_schedules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Patients table policies
CREATE POLICY "Users can view patients they're associated with" ON public.patients
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.user_doctor_associations uda
      JOIN public.doctors d ON d.id = uda.doctor_id
      WHERE uda.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Staff and admins can insert patients" ON public.patients
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('admin', 'staff', 'doctor')
    )
  );

CREATE POLICY "Staff and admins can update patients" ON public.patients
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('admin', 'staff', 'doctor')
    )
  );

-- User-Doctor associations policies
CREATE POLICY "Users can view their associations" ON public.user_doctor_associations
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage associations" ON public.user_doctor_associations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Appointments policies
CREATE POLICY "Users can view appointments they're involved in" ON public.appointments
  FOR SELECT USING (
    patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid()) OR
    doctor_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid()) OR
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Staff and doctors can create appointments" ON public.appointments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('admin', 'staff', 'doctor')
    )
  );

CREATE POLICY "Staff and doctors can update appointments" ON public.appointments
  FOR UPDATE USING (
    created_by = auth.uid() OR
    doctor_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

-- Consultations policies
CREATE POLICY "Users can view consultations they're involved in" ON public.consultations
  FOR SELECT USING (
    patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid()) OR
    doctor_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Doctors can manage their consultations" ON public.consultations
  FOR ALL USING (
    doctor_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

-- Similar policies for other medical tables (vitals, lab reports, prescriptions, medical history)
CREATE POLICY "Medical data access" ON public.patient_vitals
  FOR ALL USING (
    patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid()) OR
    recorded_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.consultations c
      JOIN public.doctors d ON d.id = c.doctor_id
      WHERE c.id = consultation_id AND d.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

-- Templates policies (simplified - doctors can manage their own templates, admins can manage all)
CREATE POLICY "Template access" ON public.diagnosis_templates
  FOR ALL USING (
    doctor_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid()) OR
    doctor_id IS NULL OR -- Global templates
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Template access" ON public.prescription_templates
  FOR ALL USING (
    doctor_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid()) OR
    doctor_id IS NULL OR -- Global templates
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Medicines - read access for all authenticated users
CREATE POLICY "Medicine read access" ON public.medicines
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Medicine write access" ON public.medicines
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- System settings - admin only
CREATE POLICY "System settings admin only" ON public.system_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
