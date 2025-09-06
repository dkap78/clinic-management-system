-- Seed initial data for the clinic management system

-- Insert system settings
INSERT INTO public.system_settings (setting_key, setting_value, description, updated_by) VALUES
('clinic_name', '"MediCare Clinic"', 'Name of the clinic', '00000000-0000-0000-0000-000000000000'),
('clinic_address', '"123 Health Street, Medical City, MC 12345"', 'Clinic address', '00000000-0000-0000-0000-000000000000'),
('clinic_phone', '"+1-555-0123"', 'Clinic phone number', '00000000-0000-0000-0000-000000000000'),
('appointment_duration', '30', 'Default appointment duration in minutes', '00000000-0000-0000-0000-000000000000'),
('max_appointments_per_day', '20', 'Maximum appointments per doctor per day', '00000000-0000-0000-0000-000000000000')
ON CONFLICT (setting_key) DO NOTHING;

-- Insert common medicines
INSERT INTO public.medicines (name, generic_name, category, dosage_forms, strengths, contraindications, side_effects) VALUES
('Paracetamol', 'Acetaminophen', 'Analgesic/Antipyretic', ARRAY['tablet', 'syrup', 'injection'], ARRAY['500mg', '650mg', '125mg/5ml'], ARRAY['Severe liver disease'], ARRAY['Nausea', 'Skin rash']),
('Ibuprofen', 'Ibuprofen', 'NSAID', ARRAY['tablet', 'capsule', 'syrup'], ARRAY['200mg', '400mg', '600mg'], ARRAY['Peptic ulcer', 'Severe heart failure'], ARRAY['Stomach upset', 'Dizziness']),
('Amoxicillin', 'Amoxicillin', 'Antibiotic', ARRAY['capsule', 'tablet', 'syrup'], ARRAY['250mg', '500mg', '125mg/5ml'], ARRAY['Penicillin allergy'], ARRAY['Diarrhea', 'Nausea', 'Skin rash']),
('Omeprazole', 'Omeprazole', 'Proton Pump Inhibitor', ARRAY['capsule', 'tablet'], ARRAY['20mg', '40mg'], ARRAY['Hypersensitivity'], ARRAY['Headache', 'Diarrhea', 'Abdominal pain']),
('Metformin', 'Metformin', 'Antidiabetic', ARRAY['tablet'], ARRAY['500mg', '850mg', '1000mg'], ARRAY['Diabetic ketoacidosis', 'Severe kidney disease'], ARRAY['Nausea', 'Diarrhea', 'Metallic taste'])
ON CONFLICT (name) DO NOTHING;

-- Insert common diagnosis templates
INSERT INTO public.diagnosis_templates (name, category, template_text, icd_code, created_by) VALUES
('Common Cold', 'Respiratory', 'Patient presents with symptoms consistent with viral upper respiratory tract infection. Symptoms include nasal congestion, rhinorrhea, mild sore throat, and low-grade fever.', 'J00', '00000000-0000-0000-0000-000000000000'),
('Hypertension', 'Cardiovascular', 'Patient diagnosed with essential hypertension. Blood pressure readings consistently elevated above 140/90 mmHg. Recommend lifestyle modifications and antihypertensive medication.', 'I10', '00000000-0000-0000-0000-000000000000'),
('Type 2 Diabetes', 'Endocrine', 'Patient diagnosed with Type 2 Diabetes Mellitus. HbA1c levels elevated. Recommend dietary modifications, regular exercise, and antidiabetic medication.', 'E11', '00000000-0000-0000-0000-000000000000'),
('Gastritis', 'Gastrointestinal', 'Patient presents with symptoms of gastritis including epigastric pain, nausea, and bloating. Recommend proton pump inhibitor and dietary modifications.', 'K29.7', '00000000-0000-0000-0000-000000000000'),
('Migraine', 'Neurological', 'Patient presents with recurrent headaches consistent with migraine. Unilateral throbbing pain with associated nausea and photophobia.', 'G43.9', '00000000-0000-0000-0000-000000000000')
ON CONFLICT (name, category) DO NOTHING;

-- Insert common prescription templates
INSERT INTO public.prescription_templates (name, category, medications, instructions, created_by) VALUES
('Common Cold Treatment', 'Respiratory', 
'[{"name": "Paracetamol", "dosage": "500mg", "frequency": "TID", "duration": "5 days", "instructions": "Take after meals"}, {"name": "Cetirizine", "dosage": "10mg", "frequency": "OD", "duration": "5 days", "instructions": "Take at bedtime"}]',
'Rest, increase fluid intake, avoid cold foods', '00000000-0000-0000-0000-000000000000'),

('Hypertension Management', 'Cardiovascular',
'[{"name": "Amlodipine", "dosage": "5mg", "frequency": "OD", "duration": "30 days", "instructions": "Take in the morning"}, {"name": "Metoprolol", "dosage": "25mg", "frequency": "BID", "duration": "30 days", "instructions": "Take with meals"}]',
'Monitor blood pressure regularly, low salt diet, regular exercise', '00000000-0000-0000-0000-000000000000'),

('Diabetes Management', 'Endocrine',
'[{"name": "Metformin", "dosage": "500mg", "frequency": "BID", "duration": "30 days", "instructions": "Take with meals"}]',
'Follow diabetic diet, regular blood sugar monitoring, exercise regularly', '00000000-0000-0000-0000-000000000000'),

('Gastritis Treatment', 'Gastrointestinal',
'[{"name": "Omeprazole", "dosage": "20mg", "frequency": "OD", "duration": "14 days", "instructions": "Take before breakfast"}, {"name": "Sucralfate", "dosage": "1g", "frequency": "QID", "duration": "14 days", "instructions": "Take 1 hour before meals and at bedtime"}]',
'Avoid spicy foods, eat small frequent meals, avoid NSAIDs', '00000000-0000-0000-0000-000000000000')

ON CONFLICT (name, category) DO NOTHING;

-- Consultation templates seed
INSERT INTO public.consultation_templates (name, type, content) VALUES
('Common Cold Template', 'diagnosis', 'Symptoms: ...\nDiagnosis: Common Cold\nPlan: Rest, hydration'),
('Hypertension Follow-up', 'followup', 'Check BP, adjust meds if needed'),
('Diabetes Visit', 'treatment', 'Review HbA1c, diet, and exercise');

-- Seed minimal sample users/doctors/patients for UI testing (requires existing auth users)
-- If using raw Supabase without auth users, comment out users insert
INSERT INTO public.users (id, email, full_name, role)
VALUES
('00000000-0000-0000-0000-000000000000', 'admin@example.com', 'Admin User', 'admin')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.doctors (id, user_id, specialization, license_number, is_available)
VALUES
('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'General Medicine', 'LIC-0001', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.patients (id, first_name, last_name, email, phone, date_of_birth, gender)
VALUES
('22222222-2222-2222-2222-222222222222', 'John', 'Doe', 'john.doe@example.com', '+1-555-0100', '1985-01-10', 'Male'),
('33333333-3333-3333-3333-333333333333', 'Jane', 'Smith', 'jane.smith@example.com', '+1-555-0101', '1990-07-20', 'Female')
ON CONFLICT (id) DO NOTHING;

-- Simple availability for demo doctor
INSERT INTO public.doctor_schedules (doctor_id, day_of_week, start_time, end_time, is_available)
VALUES
('11111111-1111-1111-1111-111111111111', 1, '09:00', '17:00', true),
('11111111-1111-1111-1111-111111111111', 3, '09:00', '17:00', true)
ON CONFLICT DO NOTHING;
