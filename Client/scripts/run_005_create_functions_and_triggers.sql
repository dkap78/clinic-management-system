-- Execute database functions and triggers
-- This script creates utility functions and automated triggers

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

CREATE TRIGGER update_medical_visits_updated_at BEFORE UPDATE ON public.medical_visits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lab_reports_updated_at BEFORE UPDATE ON public.lab_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON public.prescriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate patient ID
CREATE OR REPLACE FUNCTION generate_patient_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.patient_id IS NULL THEN
        NEW.patient_id := 'PAT' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(NEXTVAL('patient_id_seq')::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create sequence for patient ID
CREATE SEQUENCE IF NOT EXISTS patient_id_seq START 1;

-- Create trigger for patient ID generation
CREATE TRIGGER generate_patient_id_trigger BEFORE INSERT ON public.patients
    FOR EACH ROW EXECUTE FUNCTION generate_patient_id();

-- Function to generate appointment number
CREATE OR REPLACE FUNCTION generate_appointment_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.appointment_number IS NULL THEN
        NEW.appointment_number := 'APT' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(NEXTVAL('appointment_number_seq')::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create sequence for appointment number
CREATE SEQUENCE IF NOT EXISTS appointment_number_seq START 1;

-- Create trigger for appointment number generation
CREATE TRIGGER generate_appointment_number_trigger BEFORE INSERT ON public.appointments
    FOR EACH ROW EXECUTE FUNCTION generate_appointment_number();

-- Function to calculate BMI
CREATE OR REPLACE FUNCTION calculate_bmi()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.height_cm IS NOT NULL AND NEW.weight_kg IS NOT NULL AND NEW.height_cm > 0 THEN
        NEW.bmi := ROUND((NEW.weight_kg / POWER(NEW.height_cm / 100.0, 2))::NUMERIC, 2);
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for BMI calculation
CREATE TRIGGER calculate_bmi_trigger BEFORE INSERT OR UPDATE ON public.patient_vitals
    FOR EACH ROW EXECUTE FUNCTION calculate_bmi();

-- Function to create audit log
CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO public.audit_logs (table_name, record_id, action, old_values, changed_by)
        VALUES (TG_TABLE_NAME, OLD.id, TG_OP, row_to_json(OLD), auth.uid());
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO public.audit_logs (table_name, record_id, action, old_values, new_values, changed_by)
        VALUES (TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(OLD), row_to_json(NEW), auth.uid());
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO public.audit_logs (table_name, record_id, action, new_values, changed_by)
        VALUES (TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(NEW), auth.uid());
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Create audit triggers for important tables
CREATE TRIGGER audit_users_trigger AFTER INSERT OR UPDATE OR DELETE ON public.users
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_doctors_trigger AFTER INSERT OR UPDATE OR DELETE ON public.doctors
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_patients_trigger AFTER INSERT OR UPDATE OR DELETE ON public.patients
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_appointments_trigger AFTER INSERT OR UPDATE OR DELETE ON public.appointments
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();
