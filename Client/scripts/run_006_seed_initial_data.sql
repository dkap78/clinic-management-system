-- Execute initial data seeding
-- This script creates initial system data and sample records

-- Insert default system settings
INSERT INTO public.system_settings (setting_key, setting_value, description, is_public) VALUES
('clinic_name', '"MediCare Clinic"', 'Name of the clinic', true),
('clinic_address', '"123 Healthcare Street, Medical City, MC 12345"', 'Clinic address', true),
('clinic_phone', '"+1-555-0123"', 'Clinic phone number', true),
('clinic_email', '"info@medicare-clinic.com"', 'Clinic email address', true),
('appointment_duration', '30', 'Default appointment duration in minutes', false),
('working_hours_start', '"09:00"', 'Default working hours start time', false),
('working_hours_end', '"17:00"', 'Default working hours end time', false),
('max_appointments_per_slot', '1', 'Maximum appointments per time slot', false)
ON CONFLICT (setting_key) DO NOTHING;

-- Insert sample specializations for reference
INSERT INTO public.system_settings (setting_key, setting_value, description, is_public) VALUES
('specializations', '["General Medicine", "Cardiology", "Dermatology", "Orthopedics", "Pediatrics", "Gynecology", "Neurology", "Psychiatry", "Ophthalmology", "ENT"]', 'Available medical specializations', true)
ON CONFLICT (setting_key) DO NOTHING;

-- Insert sample diagnosis templates
INSERT INTO public.diagnosis_templates (template_name, specialization, chief_complaint, diagnosis, treatment_plan, follow_up_instructions, is_public) VALUES
('Common Cold', 'General Medicine', 'Cough, runny nose, sore throat', 'Upper respiratory tract infection (Common Cold)', 'Rest, increased fluid intake, symptomatic treatment with paracetamol for fever', 'Return if symptoms worsen or persist beyond 7 days', true),
('Hypertension Follow-up', 'Cardiology', 'Routine blood pressure check', 'Essential Hypertension - controlled', 'Continue current antihypertensive medication, lifestyle modifications', 'Follow-up in 3 months, monitor BP at home', true),
('Skin Rash', 'Dermatology', 'Itchy skin rash', 'Contact Dermatitis', 'Topical corticosteroid cream, avoid allergens', 'Return in 1 week if no improvement', true),
('Back Pain', 'Orthopedics', 'Lower back pain', 'Mechanical Low Back Pain', 'NSAIDs, physiotherapy, ergonomic advice', 'Follow-up in 2 weeks, continue physiotherapy', true),
('Routine Checkup', 'Pediatrics', 'Routine health checkup', 'Healthy child - routine examination', 'Continue current diet and activities, vaccinations up to date', 'Next routine checkup in 6 months', true);

-- Insert sample prescription templates
INSERT INTO public.prescription_templates (template_name, specialization, medications, is_public) VALUES
('Common Cold Treatment', 'General Medicine', '[
  {"name": "Paracetamol", "dosage": "500mg", "frequency": "Every 6 hours", "duration": "5 days", "instructions": "Take with food"},
  {"name": "Cetirizine", "dosage": "10mg", "frequency": "Once daily", "duration": "5 days", "instructions": "Take at bedtime"}
]', true),
('Hypertension Management', 'Cardiology', '[
  {"name": "Amlodipine", "dosage": "5mg", "frequency": "Once daily", "duration": "30 days", "instructions": "Take in the morning"},
  {"name": "Metoprolol", "dosage": "25mg", "frequency": "Twice daily", "duration": "30 days", "instructions": "Take with meals"}
]', true),
('Skin Infection Treatment', 'Dermatology', '[
  {"name": "Hydrocortisone Cream", "dosage": "1%", "frequency": "Twice daily", "duration": "7 days", "instructions": "Apply thin layer to affected area"},
  {"name": "Cetirizine", "dosage": "10mg", "frequency": "Once daily", "duration": "7 days", "instructions": "For itching relief"}
]', true);

-- Note: Actual user and doctor data should be created through the application
-- to ensure proper authentication integration with Supabase Auth
