-- Templates and system settings

-- Diagnosis templates
CREATE TABLE IF NOT EXISTS public.diagnosis_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  template_text TEXT NOT NULL,
  icd_code TEXT,
  doctor_id UUID REFERENCES public.doctors(id), -- NULL means global template
  is_active BOOLEAN DEFAULT true,
  created_by UUID NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prescription templates
CREATE TABLE IF NOT EXISTS public.prescription_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  medications JSONB NOT NULL, -- Array of medication objects with dosage, frequency, etc.
  instructions TEXT,
  doctor_id UUID REFERENCES public.doctors(id), -- NULL means global template
  is_active BOOLEAN DEFAULT true,
  created_by UUID NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medicine database
CREATE TABLE IF NOT EXISTS public.medicines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  generic_name TEXT,
  brand_names TEXT[],
  category TEXT NOT NULL,
  dosage_forms TEXT[], -- tablet, capsule, syrup, injection, etc.
  strengths TEXT[], -- 500mg, 250mg, etc.
  contraindications TEXT[],
  side_effects TEXT[],
  drug_interactions TEXT[],
  pregnancy_category TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System settings
CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  description TEXT,
  updated_by UUID NOT NULL REFERENCES public.users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.diagnosis_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescription_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_diagnosis_templates_category ON public.diagnosis_templates(category);
CREATE INDEX IF NOT EXISTS idx_diagnosis_templates_doctor_id ON public.diagnosis_templates(doctor_id);
CREATE INDEX IF NOT EXISTS idx_prescription_templates_category ON public.prescription_templates(category);
CREATE INDEX IF NOT EXISTS idx_prescription_templates_doctor_id ON public.prescription_templates(doctor_id);
CREATE INDEX IF NOT EXISTS idx_medicines_category ON public.medicines(category);
CREATE INDEX IF NOT EXISTS idx_medicines_name ON public.medicines(name);
