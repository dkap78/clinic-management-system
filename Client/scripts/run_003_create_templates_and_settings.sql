-- Execute templates and settings tables creation
-- This script creates tables for diagnosis templates, prescription templates, and system settings

-- Diagnosis templates table
CREATE TABLE IF NOT EXISTS public.diagnosis_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_by UUID REFERENCES public.doctors(id) ON DELETE CASCADE,
  template_name TEXT NOT NULL,
  specialization TEXT,
  chief_complaint TEXT,
  diagnosis TEXT NOT NULL,
  treatment_plan TEXT,
  follow_up_instructions TEXT,
  is_public BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prescription templates table
CREATE TABLE IF NOT EXISTS public.prescription_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_by UUID REFERENCES public.doctors(id) ON DELETE CASCADE,
  template_name TEXT NOT NULL,
  specialization TEXT,
  medications JSONB NOT NULL, -- Array of medication objects
  is_public BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System settings table
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

-- Audit log table for tracking changes
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')) NOT NULL,
  old_values JSONB,
  new_values JSONB,
  changed_by UUID REFERENCES public.users(id),
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for templates and settings
CREATE INDEX IF NOT EXISTS idx_diagnosis_templates_created_by ON public.diagnosis_templates(created_by);
CREATE INDEX IF NOT EXISTS idx_diagnosis_templates_specialization ON public.diagnosis_templates(specialization);
CREATE INDEX IF NOT EXISTS idx_prescription_templates_created_by ON public.prescription_templates(created_by);
CREATE INDEX IF NOT EXISTS idx_prescription_templates_specialization ON public.prescription_templates(specialization);
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON public.system_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON public.audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_changed_by ON public.audit_logs(changed_by);
