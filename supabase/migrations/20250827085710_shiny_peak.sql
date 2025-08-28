/*
  # Professional B2B Client Onboarding System

  1. New Tables
    - `client_applications` - Main application records with business data
    - `application_documents` - Document uploads for verification
    - `application_consents` - GDPR consent tracking
    - `application_reviews` - Admin review process tracking

  2. Security
    - Enable RLS on all tables
    - Add policies for applicants and admins
    - Secure document access controls

  3. Business Logic
    - Application status workflow
    - Document verification requirements
    - Consent audit trail
*/

-- Application status enum
CREATE TYPE application_status AS ENUM (
  'draft',
  'submitted',
  'under_review',
  'additional_info_required',
  'approved',
  'rejected'
);

-- Business type enum (matching existing companies table)
CREATE TYPE business_entity_type AS ENUM (
  'corporation',
  'partnership',
  'sole_proprietorship',
  'limited_liability',
  'other'
);

-- Document type enum for verification
CREATE TYPE verification_document_type AS ENUM (
  'company_registration',
  'vat_certificate',
  'authorized_signatory_id',
  'power_of_attorney',
  'bank_statement',
  'other'
);

-- Main client applications table
CREATE TABLE IF NOT EXISTS client_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Application metadata
  application_number text UNIQUE NOT NULL DEFAULT 'APP-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('application_sequence')::text, 6, '0'),
  status application_status DEFAULT 'draft',
  submitted_at timestamptz,
  reviewed_at timestamptz,
  approved_at timestamptz,
  
  -- Company information
  company_name text NOT NULL,
  business_type business_entity_type NOT NULL,
  registration_number text,
  vat_number text,
  tax_id text,
  incorporation_date date,
  incorporation_country text NOT NULL,
  
  -- Business address
  business_address jsonb NOT NULL DEFAULT '{}',
  
  -- Contact information
  primary_contact_name text NOT NULL,
  primary_contact_title text,
  primary_contact_email text NOT NULL,
  primary_contact_phone text,
  
  -- Secondary contact (optional)
  secondary_contact_name text,
  secondary_contact_title text,
  secondary_contact_email text,
  secondary_contact_phone text,
  
  -- Business details
  industry text,
  annual_revenue_range text,
  employee_count_range text,
  website text,
  business_description text,
  
  -- Expected collection volume
  expected_monthly_cases integer,
  expected_average_case_value numeric(12,2),
  primary_debtor_types text[], -- ['B2B', 'B2C']
  
  -- Banking information
  bank_name text,
  bank_account_holder text,
  bank_iban text,
  bank_swift text,
  
  -- GDPR compliance
  gdpr_representative_name text NOT NULL,
  gdpr_representative_email text NOT NULL,
  gdpr_representative_phone text,
  dpo_name text,
  dpo_email text,
  dpo_phone text,
  data_retention_period_months integer DEFAULT 84,
  
  -- Legal agreements
  terms_accepted boolean DEFAULT false,
  terms_accepted_at timestamptz,
  terms_version text,
  privacy_policy_accepted boolean DEFAULT false,
  privacy_policy_accepted_at timestamptz,
  privacy_policy_version text,
  service_agreement_accepted boolean DEFAULT false,
  service_agreement_accepted_at timestamptz,
  service_agreement_version text,
  
  -- Application notes
  applicant_notes text,
  admin_notes text,
  rejection_reason text,
  
  -- Audit fields
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  reviewed_by uuid REFERENCES auth.users(id)
);

-- Create sequence for application numbers
CREATE SEQUENCE IF NOT EXISTS application_sequence START 1;

-- Application documents table
CREATE TABLE IF NOT EXISTS application_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES client_applications(id) ON DELETE CASCADE,
  
  document_type verification_document_type NOT NULL,
  file_name text NOT NULL,
  file_size integer NOT NULL,
  mime_type text NOT NULL,
  storage_path text NOT NULL,
  
  -- Verification status
  is_verified boolean DEFAULT false,
  verified_at timestamptz,
  verified_by uuid REFERENCES auth.users(id),
  verification_notes text,
  
  -- Audit fields
  uploaded_at timestamptz DEFAULT now(),
  uploaded_by uuid REFERENCES auth.users(id)
);

-- GDPR consent tracking
CREATE TABLE IF NOT EXISTS application_consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES client_applications(id) ON DELETE CASCADE,
  
  consent_type text NOT NULL, -- 'processing', 'marketing', 'third_party_sharing'
  purpose data_processing_purpose NOT NULL,
  lawful_basis gdpr_lawful_basis NOT NULL,
  
  consent_given boolean NOT NULL,
  consent_text text NOT NULL,
  consent_version text NOT NULL DEFAULT '1.0',
  
  -- Technical details for audit
  ip_address inet,
  user_agent text,
  
  -- Audit fields
  given_at timestamptz DEFAULT now(),
  withdrawn_at timestamptz,
  withdrawal_reason text
);

-- Application review tracking
CREATE TABLE IF NOT EXISTS application_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES client_applications(id) ON DELETE CASCADE,
  
  reviewer_id uuid NOT NULL REFERENCES auth.users(id),
  review_type text NOT NULL, -- 'initial', 'document_verification', 'final_approval'
  
  status text NOT NULL, -- 'pending', 'approved', 'rejected', 'needs_info'
  comments text,
  
  -- Specific review areas
  company_info_verified boolean DEFAULT false,
  documents_verified boolean DEFAULT false,
  compliance_verified boolean DEFAULT false,
  risk_assessment_completed boolean DEFAULT false,
  
  -- Audit fields
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Enable RLS
ALTER TABLE client_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for client_applications
CREATE POLICY "Users can create their own applications"
  ON client_applications
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can view their own applications"
  ON client_applications
  FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Users can update their own draft applications"
  ON client_applications
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid() AND status = 'draft')
  WITH CHECK (created_by = auth.uid());

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

CREATE POLICY "Admins can update applications for review"
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

-- RLS Policies for application_consents
CREATE POLICY "Users can manage consents for their applications"
  ON application_consents
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM client_applications 
      WHERE id = application_id 
      AND created_by = auth.uid()
    )
  );

CREATE POLICY "Admins and DPOs can view all consents"
  ON application_consents
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'dpo')
    )
  );

-- RLS Policies for application_reviews
CREATE POLICY "Admins can manage all reviews"
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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_client_applications_status ON client_applications(status);
CREATE INDEX IF NOT EXISTS idx_client_applications_created_by ON client_applications(created_by);
CREATE INDEX IF NOT EXISTS idx_client_applications_submitted_at ON client_applications(submitted_at);
CREATE INDEX IF NOT EXISTS idx_application_documents_application_id ON application_documents(application_id);
CREATE INDEX IF NOT EXISTS idx_application_consents_application_id ON application_consents(application_id);
CREATE INDEX IF NOT EXISTS idx_application_reviews_application_id ON application_reviews(application_id);

-- Triggers for updated_at
CREATE TRIGGER update_client_applications_updated_at
  BEFORE UPDATE ON client_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate application reference numbers
CREATE OR REPLACE FUNCTION generate_application_reference()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.application_number IS NULL THEN
    NEW.application_number := 'APP-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('application_sequence')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_application_reference_trigger
  BEFORE INSERT ON client_applications
  FOR EACH ROW EXECUTE FUNCTION generate_application_reference();