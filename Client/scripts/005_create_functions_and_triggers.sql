-- Functions and triggers for the clinic management system

-- Function to auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'patient')
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Trigger to create user profile on auth user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to generate patient ID
CREATE OR REPLACE FUNCTION public.generate_patient_id()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  next_id INTEGER;
  patient_id TEXT;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(patient_id FROM 2) AS INTEGER)), 0) + 1
  INTO next_id
  FROM public.patients
  WHERE patient_id ~ '^P[0-9]+$';
  
  patient_id := 'P' || LPAD(next_id::TEXT, 4, '0');
  RETURN patient_id;
END;
$$;

-- Function to generate appointment number
CREATE OR REPLACE FUNCTION public.generate_appointment_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  next_id INTEGER;
  appointment_number TEXT;
  date_prefix TEXT;
BEGIN
  date_prefix := TO_CHAR(CURRENT_DATE, 'YYYYMMDD');
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(appointment_number FROM 10) AS INTEGER)), 0) + 1
  INTO next_id
  FROM public.appointments
  WHERE appointment_number LIKE date_prefix || '%';
  
  appointment_number := date_prefix || LPAD(next_id::TEXT, 3, '0');
  RETURN appointment_number;
END;
$$;

-- Function to generate prescription number
CREATE OR REPLACE FUNCTION public.generate_prescription_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  next_id INTEGER;
  prescription_number TEXT;
  date_prefix TEXT;
BEGIN
  date_prefix := 'RX' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD');
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(prescription_number FROM 11) AS INTEGER)), 0) + 1
  INTO next_id
  FROM public.prescriptions
  WHERE prescription_number LIKE date_prefix || '%';
  
  prescription_number := date_prefix || LPAD(next_id::TEXT, 3, '0');
  RETURN prescription_number;
END;
$$;

-- Function to calculate BMI
CREATE OR REPLACE FUNCTION public.calculate_bmi(height_cm DECIMAL, weight_kg DECIMAL)
RETURNS DECIMAL
LANGUAGE plpgsql
AS $$
BEGIN
  IF height_cm IS NULL OR weight_kg IS NULL OR height_cm <= 0 OR weight_kg <= 0 THEN
    RETURN NULL;
  END IF;
  
  RETURN ROUND((weight_kg / POWER(height_cm / 100, 2))::DECIMAL, 2);
END;
$$;

-- Trigger to auto-calculate BMI when vitals are inserted/updated
CREATE OR REPLACE FUNCTION public.auto_calculate_bmi()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.bmi := public.calculate_bmi(NEW.height_cm, NEW.weight_kg);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_auto_calculate_bmi ON public.patient_vitals;
CREATE TRIGGER trigger_auto_calculate_bmi
  BEFORE INSERT OR UPDATE ON public.patient_vitals
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_calculate_bmi();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Add updated_at triggers to relevant tables
CREATE TRIGGER trigger_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trigger_doctors_updated_at
  BEFORE UPDATE ON public.doctors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trigger_patients_updated_at
  BEFORE UPDATE ON public.patients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trigger_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trigger_consultations_updated_at
  BEFORE UPDATE ON public.consultations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
