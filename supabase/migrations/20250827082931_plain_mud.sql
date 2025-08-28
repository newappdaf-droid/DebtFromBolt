/*
  # Create onboarding and client management tables

  1. New Tables
    - `client_onboarding`
      - Tracks the onboarding process for new clients
      - Stores form data and completion status
    - `onboarding_documents`
      - Stores uploaded verification documents
      - Links to client onboarding records

  2. Security
    - Enable RLS on all tables
    - Add policies for user access control
*/

-- Client onboarding tracking table
CREATE TABLE IF NOT EXISTS client_onboarding (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  business_type text NOT NULL,
  registration_number text,
  vat_number text,
  industry text,
  website text,
  address jsonb DEFAULT '{}',
  phone text,
  email text NOT NULL,
  gdpr_representative_name text,
  gdpr_representative_email text,
  dpo_name text,
  dpo_email text,
  data_retention_period_months integer DEFAULT 84,
  processing_purposes text[] DEFAULT '{}',
  lawful_basis text[] DEFAULT '{}',
  terms_accepted boolean DEFAULT false,
  privacy_policy_accepted boolean DEFAULT false,
  gdpr_consent_given boolean DEFAULT false,
  contract_signed boolean DEFAULT false,
  verification_status text DEFAULT 'pending' CHECK (verification_status IN ('pending', 'in_review', 'approved', 'rejected')),
  completion_status text DEFAULT 'in_progress' CHECK (completion_status IN ('in_progress', 'completed', 'abandoned')),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Onboarding documents table
CREATE TABLE IF NOT EXISTS onboarding_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  onboarding_id uuid REFERENCES client_onboarding(id) ON DELETE CASCADE,
  document_type text NOT NULL CHECK (document_type IN ('company_registration', 'identity_verification', 'vat_certificate', 'other')),
  file_name text NOT NULL,
  file_size integer,
  mime_type text,
  storage_path text NOT NULL,
  verification_status text DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  verification_notes text,
  uploaded_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE client_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for client_onboarding
CREATE POLICY "Users can manage their own onboarding"
  ON client_onboarding
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all onboarding records"
  ON client_onboarding
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- RLS Policies for onboarding_documents
CREATE POLICY "Users can manage their onboarding documents"
  ON onboarding_documents
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM client_onboarding 
      WHERE id = onboarding_documents.onboarding_id 
      AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM client_onboarding 
      WHERE id = onboarding_documents.onboarding_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all onboarding documents"
  ON onboarding_documents
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_client_onboarding_user_id ON client_onboarding(user_id);
CREATE INDEX IF NOT EXISTS idx_client_onboarding_status ON client_onboarding(completion_status, verification_status);
CREATE INDEX IF NOT EXISTS idx_onboarding_documents_onboarding_id ON onboarding_documents(onboarding_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_client_onboarding_updated_at
  BEFORE UPDATE ON client_onboarding
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_onboarding_documents_updated_at
  BEFORE UPDATE ON onboarding_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();