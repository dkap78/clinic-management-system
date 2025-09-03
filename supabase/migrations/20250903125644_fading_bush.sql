/*
  # Sample Data for Hospital Management System

  1. System Settings
  2. Sample Users (Admin, Doctors, Staff)
  3. Sample Patients
  4. Sample Appointments
  5. Sample Medical Records
  6. Sample Templates
  7. Sample Medicines
*/

-- =============================================
-- SYSTEM SETTINGS
-- =============================================

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

-- =============================================
-- SAMPLE MEDICINES
-- =============================================

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

-- =============================================
-- DIAGNOSIS TEMPLATES
-- =============================================

INSERT INTO public.diagnosis_templates (name, category, template_text, icd_code) VALUES
('Common Cold', 'Respiratory', 'Patient presents with symptoms consistent with viral upper respiratory tract infection. Symptoms include nasal congestion, rhinorrhea, mild sore throat, and low-grade fever. Physical examination reveals clear nasal discharge and mild throat erythema. No signs of bacterial infection.', 'J00'),
('Hypertension', 'Cardiovascular', 'Patient diagnosed with essential hypertension. Blood pressure readings consistently elevated above 140/90 mmHg on multiple occasions. No evidence of secondary causes. Recommend lifestyle modifications including diet, exercise, and stress management along with antihypertensive medication.', 'I10'),
('Type 2 Diabetes', 'Endocrine', 'Patient diagnosed with Type 2 Diabetes Mellitus. HbA1c levels elevated above 6.5%. Fasting glucose consistently above 126 mg/dL. Recommend dietary modifications, regular exercise, blood glucose monitoring, and antidiabetic medication. Patient education on diabetes management provided.', 'E11.9'),
('Gastritis', 'Gastrointestinal', 'Patient presents with symptoms of gastritis including epigastric pain, nausea, and bloating. Physical examination reveals epigastric tenderness. Recommend proton pump inhibitor therapy, dietary modifications, and avoidance of NSAIDs and alcohol.', 'K29.7'),
('Migraine', 'Neurological', 'Patient presents with recurrent headaches consistent with migraine without aura. Unilateral throbbing pain with associated nausea and photophobia. Duration 4-72 hours. Recommend trigger identification, lifestyle modifications, and appropriate abortive therapy.', 'G43.9'),
('Anxiety Disorder', 'Psychiatric', 'Patient presents with symptoms of generalized anxiety disorder including excessive worry, restlessness, fatigue, and difficulty concentrating. Symptoms present for more than 6 months and significantly impact daily functioning. Recommend counseling and consider anxiolytic medication.', 'F41.1')
ON CONFLICT (name, category) DO NOTHING;

-- =============================================
-- PRESCRIPTION TEMPLATES
-- =============================================

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

-- =============================================
-- CONSULTATION TEMPLATES
-- =============================================

INSERT INTO public.consultation_templates (name, type, content) VALUES
('General Checkup', 'diagnosis', 'Patient appears well. Vital signs stable. No acute distress noted. Physical examination unremarkable. Continue current medications and lifestyle modifications. Routine follow-up recommended.'),
('Follow-up Visit', 'diagnosis', 'Patient returns for follow-up. Symptoms have improved since last visit. Current treatment plan appears effective. Continue current regimen with minor adjustments as needed.'),
('Acute Illness', 'diagnosis', 'Patient presents with acute onset of symptoms. Physical examination reveals findings consistent with clinical presentation. Appropriate treatment initiated. Patient advised to return if symptoms worsen.'),
('Chronic Disease Management', 'treatment', 'Continue current management plan. Monitor disease progression and medication effectiveness. Lifestyle modifications reinforced. Regular follow-up scheduled to assess treatment response.'),
('Medication Review', 'prescription', 'Current medications reviewed for effectiveness and side effects. Dosage adjustments made as appropriate. Patient counseled on proper medication administration and potential side effects.'),
('Preventive Care', 'followup', 'Preventive care measures discussed including screening recommendations, vaccinations, and lifestyle modifications. Patient education provided on disease prevention strategies.')
ON CONFLICT (name, type) DO NOTHING;