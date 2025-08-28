/*
  # Comprehensive B2B Client Onboarding System

  1. New Tables
    - `client_applications` - Main application data with business information
    - `application_reviews` - Admin review workflow and decisions
    - `application_documents` - Document uploads and verification
    - `gdpr_consents` - GDPR consent tracking with audit trail
    - `application_contacts` - Primary and secondary business contacts

  2. Security
    - Enable RLS on all tables
    - Add policies for applicants to manage their own applications
    - Add policies for admins to review all applications
    - Add policies for secure document access

  3. Features
    - Multi-step application process
    - Legal document acceptance tracking
    - GDPR compliance framework
    - Admin approval workflow
    - Document verification system
*/

-- Business types enum
CREATE TYPE business_type AS ENUM (
  'sole_proprietorship',
  'partnership', 
  'limited_liability',
  'corporation',
  'other'
);

-- Application status enum
CREATE TYPE application_status AS ENUM (
  'draft',
  'submitted',
  'under_review',
  'additional_info_required',
  'approved',
  'rejected'
);

-- Review status enum
CREATE TYPE review_status AS ENUM (
  'pending',
  'approved',
  'rejected',
  'needs_info'
);

-- GDPR lawful basis enum
CREATE TYPE gdpr_lawful_basis AS ENUM (
  'consent',
  'contract',
  'legal_obligation',
  'vital_interests',
  'public_task',
  'legitimate_interests'
);

-- Data processing purpose enum
CREATE TYPE data_processing_purpose AS ENUM (
  'debt_collection',
  'client_management',
  'communication',
  'legal_compliance',
  'analytics'
);

-- Main client applications table
CREATE TABLE IF NOT EXISTS client_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_number text UNIQUE NOT NULL,
  status application_status DEFAULT 'draft',
  
  -- Company Information
  company_name text NOT NULL,
  business_type business_type NOT NULL,
  incorporation_country text NOT NULL,
  registration_number text,
  vat_number text,
  tax_id text,
  industry text NOT NULL,
  business_description text,
  website_url text,
  
  -- Business Address
  business_address jsonb DEFAULT '{}',
  
  -- Business Profile
  annual_revenue_range text,
  employee_count_range text,
  years_in_business integer,
  expected_monthly_cases integer,
  expected_average_case_value numeric(12,2),
  primary_debtor_types text[] DEFAULT '{}',
  
  -- Primary Contact
  primary_contact_name text NOT NULL,
  primary_contact_email text NOT NULL,
  primary_contact_phone text,
  primary_contact_job_title text,
  
  -- Secondary Contact (Optional)
  secondary_contact_name text,
  secondary_contact_email text,
  secondary_contact_phone text,
  secondary_contact_job_title text,
  
  -- GDPR Representative
  gdpr_representative_name text,
  gdpr_representative_email text,
  gdpr_representative_phone text,
  
  -- Data Protection Officer (Optional)
  dpo_name text,
  dpo_email text,
  dpo_phone text,
  
  -- Banking Information
  bank_name text,
  bank_country text,
  bank_iban text,
  bank_swift text,
  account_holder_name text,
  
  -- Legal Agreements
  terms_accepted boolean DEFAULT false,
  terms_accepted_at timestamptz,
  terms_version text,
  privacy_policy_accepted boolean DEFAULT false,
  privacy_policy_accepted_at timestamptz,
  privacy_policy_version text,
  service_agreement_accepted boolean DEFAULT false,
  service_agreement_accepted_at timestamptz,
  service_agreement_version text,
  
  -- Application Notes
  applicant_notes text,
  admin_notes text,
  rejection_reason text,
  
  -- Audit Trail
  created_by uuid REFERENCES auth.users(id),
  reviewed_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  submitted_at timestamptz,
  reviewed_at timestamptz,
  approved_at timestamptz,
  updated_at timestamptz DEFAULT now()
);

-- Application reviews table
CREATE TABLE IF NOT EXISTS application_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES client_applications(id) ON DELETE CASCADE,
  reviewer_id uuid REFERENCES auth.users(id),
  review_type text NOT NULL, -- 'initial_review', 'compliance_check', 'final_approval'
  status review_status NOT NULL,
  comments text,
  
  -- Review Checklist
  company_info_verified boolean DEFAULT false,
  documents_verified boolean DEFAULT false,
  compliance_verified boolean DEFAULT false,
  risk_assessment_completed boolean DEFAULT false,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Application documents table
CREATE TABLE IF NOT EXISTS application_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES client_applications(id) ON DELETE CASCADE,
  document_type text NOT NULL, -- 'company_registration', 'vat_certificate', 'id_verification', 'bank_statement', 'other'
  file_name text NOT NULL,
  file_size integer,
  mime_type text,
  storage_path text NOT NULL,
  upload_status text DEFAULT 'pending', -- 'pending', 'uploaded', 'verified', 'rejected'
  verification_notes text,
  
  -- Audit Trail
  uploaded_by uuid REFERENCES auth.users(id),
  verified_by uuid REFERENCES auth.users(id),
  uploaded_at timestamptz DEFAULT now(),
  verified_at timestamptz
);

-- GDPR consents table (enhanced)
CREATE TABLE IF NOT EXISTS gdpr_consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES client_applications(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  
  -- Consent Details
  purpose data_processing_purpose NOT NULL,
  lawful_basis gdpr_lawful_basis NOT NULL,
  consent_given boolean NOT NULL,
  consent_text text NOT NULL,
  consent_version text NOT NULL,
  
  -- Technical Details
  ip_address inet,
  user_agent text,
  consent_timestamp timestamptz DEFAULT now(),
  
  -- Withdrawal
  withdrawn_at timestamptz,
  withdrawal_reason text,
  
  -- Data Retention
  retention_period_months integer DEFAULT 84, -- 7 years default
  
  -- Audit Trail
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Application contacts table
CREATE TABLE IF NOT EXISTS application_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES client_applications(id) ON DELETE CASCADE,
  contact_type text NOT NULL, -- 'primary', 'secondary', 'gdpr_representative', 'dpo'
  
  -- Contact Information
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  job_title text,
  department text,
  
  -- Address (if different from business address)
  address jsonb DEFAULT '{}',
  
  -- Preferences
  preferred_contact_method text DEFAULT 'email', -- 'email', 'phone', 'both'
  language_preference text DEFAULT 'en',
  
  -- Audit Trail
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE client_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE gdpr_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_contacts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for client_applications
CREATE POLICY "Users can create their own applications"
  ON client_applications
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can view their own applications"
  ON client_applications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Users can update their own draft applications"
  ON client_applications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by AND status = 'draft')
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins can view all applications"
  ON client_applications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all applications"
  ON client_applications
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- RLS Policies for application_reviews
CREATE POLICY "Admins can manage reviews"
  ON application_reviews
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

CREATE POLICY "Users can view reviews of their applications"
  ON application_reviews
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM client_applications 
      WHERE id = application_id 
      AND created_by = auth.uid()
    )
  );

-- RLS Policies for application_documents
CREATE POLICY "Users can manage documents for their applications"
  ON application_documents
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM client_applications 
      WHERE id = application_id 
      AND created_by = auth.uid()
    )
  );

CREATE POLICY "Admins can view all application documents"
  ON application_documents
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- RLS Policies for gdpr_consents
CREATE POLICY "Users can manage their own consents"
  ON gdpr_consents
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all consents"
  ON gdpr_consents
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- RLS Policies for application_contacts
CREATE POLICY "Users can manage contacts for their applications"
  ON application_contacts
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM client_applications 
      WHERE id = application_id 
      AND created_by = auth.uid()
    )
  );

CREATE POLICY "Admins can view all application contacts"
  ON application_contacts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_client_applications_status ON client_applications(status);
CREATE INDEX IF NOT EXISTS idx_client_applications_created_by ON client_applications(created_by);
CREATE INDEX IF NOT EXISTS idx_client_applications_submitted_at ON client_applications(submitted_at);
CREATE INDEX IF NOT EXISTS idx_application_reviews_application_id ON application_reviews(application_id);
CREATE INDEX IF NOT EXISTS idx_application_documents_application_id ON application_documents(application_id);
CREATE INDEX IF NOT EXISTS idx_gdpr_consents_application_id ON gdpr_consents(application_id);
CREATE INDEX IF NOT EXISTS idx_application_contacts_application_id ON application_contacts(application_id);

-- Function to generate application numbers
CREATE OR REPLACE FUNCTION generate_application_number()
RETURNS text AS $$
DECLARE
  year_suffix text;
  sequence_num text;
BEGIN
  year_suffix := EXTRACT(year FROM now())::text;
  sequence_num := LPAD((EXTRACT(epoch FROM now()) % 1000000)::text, 6, '0');
  RETURN 'APP-' || year_suffix || '-' || sequence_num;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate application numbers
CREATE OR REPLACE FUNCTION set_application_number()
RETURNS trigger AS $$
BEGIN
  IF NEW.application_number IS NULL OR NEW.application_number = '' THEN
    NEW.application_number := generate_application_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_application_number
  BEFORE INSERT ON client_applications
  FOR EACH ROW
  EXECUTE FUNCTION set_application_number();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_client_applications_updated_at
  BEFORE UPDATE ON client_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gdpr_consents_updated_at
  BEFORE UPDATE ON gdpr_consents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_application_contacts_updated_at
  BEFORE UPDATE ON application_contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();