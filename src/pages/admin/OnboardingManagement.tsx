// Professional Client Application Management for Administrators
// Comprehensive review and approval workflow for new client applications

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  Users, CheckCircle, Clock, XCircle, Eye, FileText, 
  Search, Filter, Download, Mail, Phone, Building,
  AlertTriangle, Shield, Calendar, User, Edit,
  MessageSquare, Archive, Scale, DollarSign, Globe,
  CreditCard, Target, TrendingUp, Award, Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from 'sonner';
import { MapPin } from 'lucide-react';

// Mock data for pending client applications
const mockClientApplications: ClientApplication[] = [
  {
    id: 'app_001',
    application_number: 'APP-2024-001',
    status: 'submitted',
    company_name: 'TechFlow Solutions Ltd',
    business_type: 'limited_liability',
    incorporation_country: 'United Kingdom',
    registration_number: 'GB12345678',
    vat_number: 'GB123456789',
    tax_id: 'TF123456789',
    industry: 'Technology Services',
    business_description: 'Software development and IT consulting services for enterprise clients. Specializing in fintech solutions and payment processing systems.',
    website_url: 'https://techflow-solutions.co.uk',
    business_address: {
      street: '45 Tech Park Avenue',
      city: 'London',
      postalCode: 'SW1A 1AA',
      country: 'United Kingdom'
    },
    annual_revenue_range: '£1M - £5M',
    employee_count_range: '50-100',
    years_in_business: 8,
    expected_monthly_cases: 25,
    expected_average_case_value: 15000,
    primary_debtor_types: ['B2B', 'Enterprise'],
    primary_contact_name: 'Sarah Mitchell',
    primary_contact_email: 'sarah.mitchell@techflow-solutions.co.uk',
    primary_contact_phone: '+44 20 7123 4567',
    primary_contact_job_title: 'Chief Financial Officer',
    secondary_contact_name: 'James Wilson',
    secondary_contact_email: 'james.wilson@techflow-solutions.co.uk',
    secondary_contact_phone: '+44 20 7123 4568',
    secondary_contact_job_title: 'Legal Counsel',
    gdpr_representative_name: 'Emma Thompson',
    gdpr_representative_email: 'emma.thompson@techflow-solutions.co.uk',
    gdpr_representative_phone: '+44 20 7123 4569',
    dpo_name: 'Michael Davies',
    dpo_email: 'dpo@techflow-solutions.co.uk',
    dpo_phone: '+44 20 7123 4570',
    bank_name: 'Barclays Bank PLC',
    bank_country: 'United Kingdom',
    bank_iban: 'GB82BARC20035544778899',
    bank_swift: 'BARCGB22',
    account_holder_name: 'TechFlow Solutions Ltd',
    terms_accepted: true,
    terms_accepted_at: '2024-12-19T09:30:00Z',
    privacy_policy_accepted: true,
    privacy_policy_accepted_at: '2024-12-19T09:30:00Z',
    service_agreement_accepted: true,
    service_agreement_accepted_at: '2024-12-19T09:30:00Z',
    applicant_notes: 'We are looking to expand our debt collection services for our fintech clients. We have experience with B2B collections and require a professional platform.',
    created_at: '2024-12-19T09:00:00Z',
    submitted_at: '2024-12-19T09:35:00Z',
    created_by: 'user_techflow_001'
  },
  {
    id: 'app_002',
    application_number: 'APP-2024-002',
    status: 'under_review',
    company_name: 'Nordic Manufacturing AS',
    business_type: 'corporation',
    incorporation_country: 'Norway',
    registration_number: 'NO987654321',
    vat_number: 'NO987654321MVA',
    tax_id: 'NM987654321',
    industry: 'Manufacturing',
    business_description: 'Industrial equipment manufacturing and distribution across Scandinavia. We supply machinery to construction and mining companies.',
    website_url: 'https://nordic-manufacturing.no',
    business_address: {
      street: 'Industriveien 15',
      city: 'Oslo',
      postalCode: '0150',
      country: 'Norway'
    },
    annual_revenue_range: '€10M - €50M',
    employee_count_range: '200-500',
    years_in_business: 15,
    expected_monthly_cases: 45,
    expected_average_case_value: 25000,
    primary_debtor_types: ['B2B', 'Construction', 'Mining'],
    primary_contact_name: 'Lars Andersen',
    primary_contact_email: 'lars.andersen@nordic-manufacturing.no',
    primary_contact_phone: '+47 22 12 34 56',
    primary_contact_job_title: 'Finance Director',
    secondary_contact_name: 'Ingrid Olsen',
    secondary_contact_email: 'ingrid.olsen@nordic-manufacturing.no',
    secondary_contact_phone: '+47 22 12 34 57',
    secondary_contact_job_title: 'Credit Manager',
    gdpr_representative_name: 'Erik Hansen',
    gdpr_representative_email: 'erik.hansen@nordic-manufacturing.no',
    gdpr_representative_phone: '+47 22 12 34 58',
    dpo_name: 'Astrid Nordahl',
    dpo_email: 'dpo@nordic-manufacturing.no',
    dpo_phone: '+47 22 12 34 59',
    bank_name: 'DNB Bank ASA',
    bank_country: 'Norway',
    bank_iban: 'NO9386011117947',
    bank_swift: 'DNBANOKKXXX',
    account_holder_name: 'Nordic Manufacturing AS',
    terms_accepted: true,
    terms_accepted_at: '2024-12-18T14:20:00Z',
    privacy_policy_accepted: true,
    privacy_policy_accepted_at: '2024-12-18T14:20:00Z',
    service_agreement_accepted: true,
    service_agreement_accepted_at: '2024-12-18T14:20:00Z',
    applicant_notes: 'We need a robust collection platform for our B2B clients across Scandinavia. We handle high-value industrial equipment sales.',
    created_at: '2024-12-18T14:00:00Z',
    submitted_at: '2024-12-18T14:25:00Z',
    reviewed_at: '2024-12-19T08:00:00Z',
    created_by: 'user_nordic_001',
    reviewed_by: 'admin_1'
  },
  {
    id: 'app_003',
    application_number: 'APP-2024-003',
    status: 'additional_info_required',
    company_name: 'Alpine Financial Services GmbH',
    business_type: 'limited_liability',
    incorporation_country: 'Germany',
    registration_number: 'DE123456789',
    vat_number: 'DE123456789',
    tax_id: 'AF123456789',
    industry: 'Financial Services',
    business_description: 'Specialized financial services provider focusing on SME lending and invoice factoring across German-speaking markets.',
    website_url: 'https://alpine-financial.de',
    business_address: {
      street: 'Finanzstraße 42',
      city: 'Frankfurt am Main',
      postalCode: '60311',
      country: 'Germany'
    },
    annual_revenue_range: '€5M - €10M',
    employee_count_range: '100-200',
    years_in_business: 12,
    expected_monthly_cases: 60,
    expected_average_case_value: 8500,
    primary_debtor_types: ['B2B', 'SME'],
    primary_contact_name: 'Klaus Weber',
    primary_contact_email: 'klaus.weber@alpine-financial.de',
    primary_contact_phone: '+49 69 123 456 78',
    primary_contact_job_title: 'Managing Director',
    secondary_contact_name: 'Petra Schmidt',
    secondary_contact_email: 'petra.schmidt@alpine-financial.de',
    secondary_contact_phone: '+49 69 123 456 79',
    secondary_contact_job_title: 'Risk Manager',
    gdpr_representative_name: 'Hans Mueller',
    gdpr_representative_email: 'hans.mueller@alpine-financial.de',
    gdpr_representative_phone: '+49 69 123 456 80',
    dpo_name: 'Dr. Andrea Zimmermann',
    dpo_email: 'dpo@alpine-financial.de',
    dpo_phone: '+49 69 123 456 81',
    bank_name: 'Deutsche Bank AG',
    bank_country: 'Germany',
    bank_iban: 'DE89370400440532013000',
    bank_swift: 'DEUTDEFF',
    account_holder_name: 'Alpine Financial Services GmbH',
    terms_accepted: true,
    terms_accepted_at: '2024-12-17T16:45:00Z',
    privacy_policy_accepted: true,
    privacy_policy_accepted_at: '2024-12-17T16:45:00Z',
    service_agreement_accepted: true,
    service_agreement_accepted_at: '2024-12-17T16:45:00Z',
    applicant_notes: 'We require enhanced collection services for our factoring portfolio. Compliance with German and EU regulations is critical.',
    admin_notes: 'Additional documentation required for German financial services license verification.',
    created_at: '2024-12-17T16:30:00Z',
    submitted_at: '2024-12-17T16:50:00Z',
    reviewed_at: '2024-12-18T10:15:00Z',
    created_by: 'user_alpine_001',
    reviewed_by: 'admin_1'
  },
  {
    id: 'app_004',
    application_number: 'APP-2024-004',
    status: 'submitted',
    company_name: 'Mediterranean Trade Corp',
    business_type: 'corporation',
    incorporation_country: 'Spain',
    registration_number: 'ES-A12345678',
    vat_number: 'ESA12345678',
    tax_id: 'MT12345678',
    industry: 'Import/Export',
    business_description: 'International trade company specializing in Mediterranean agricultural products and food distribution across Europe.',
    website_url: 'https://med-trade.es',
    business_address: {
      street: 'Calle del Comercio 123',
      city: 'Barcelona',
      postalCode: '08001',
      country: 'Spain'
    },
    annual_revenue_range: '€20M - €50M',
    employee_count_range: '100-200',
    years_in_business: 20,
    expected_monthly_cases: 35,
    expected_average_case_value: 18000,
    primary_debtor_types: ['B2B', 'Retail', 'Distribution'],
    primary_contact_name: 'Carlos Rodriguez',
    primary_contact_email: 'carlos.rodriguez@med-trade.es',
    primary_contact_phone: '+34 93 123 45 67',
    primary_contact_job_title: 'Chief Executive Officer',
    secondary_contact_name: 'Maria Gonzalez',
    secondary_contact_email: 'maria.gonzalez@med-trade.es',
    secondary_contact_phone: '+34 93 123 45 68',
    secondary_contact_job_title: 'Financial Controller',
    gdpr_representative_name: 'Antonio Lopez',
    gdpr_representative_email: 'antonio.lopez@med-trade.es',
    gdpr_representative_phone: '+34 93 123 45 69',
    bank_name: 'Banco Santander',
    bank_country: 'Spain',
    bank_iban: 'ES9121000418450200051332',
    bank_swift: 'BSCHESMM',
    account_holder_name: 'Mediterranean Trade Corp',
    terms_accepted: true,
    terms_accepted_at: '2024-12-20T11:15:00Z',
    privacy_policy_accepted: true,
    privacy_policy_accepted_at: '2024-12-20T11:15:00Z',
    service_agreement_accepted: true,
    service_agreement_accepted_at: '2024-12-20T11:15:00Z',
    applicant_notes: 'We are expanding our collection capabilities for international trade receivables. Need multi-currency support.',
    created_at: '2024-12-20T11:00:00Z',
    submitted_at: '2024-12-20T11:20:00Z',
    created_by: 'user_medtrade_001'
  },
  {
    id: 'app_005',
    application_number: 'APP-2024-005',
    status: 'submitted',
    company_name: 'Swiss Precision Engineering SA',
    business_type: 'corporation',
    incorporation_country: 'Switzerland',
    registration_number: 'CH-020.3.123.456-7',
    vat_number: 'CHE-123.456.789',
    tax_id: 'SP123456789',
    industry: 'Precision Manufacturing',
    business_description: 'High-precision engineering and manufacturing of components for aerospace, medical devices, and luxury watch industries.',
    website_url: 'https://swiss-precision.ch',
    business_address: {
      street: 'Präzisionsweg 88',
      city: 'Zurich',
      postalCode: '8001',
      country: 'Switzerland'
    },
    annual_revenue_range: 'CHF 50M+',
    employee_count_range: '500+',
    years_in_business: 35,
    expected_monthly_cases: 15,
    expected_average_case_value: 75000,
    primary_debtor_types: ['B2B', 'Aerospace', 'Medical'],
    primary_contact_name: 'Dr. Hans Zimmermann',
    primary_contact_email: 'hans.zimmermann@swiss-precision.ch',
    primary_contact_phone: '+41 44 123 45 67',
    primary_contact_job_title: 'Chief Executive Officer',
    secondary_contact_name: 'Claudia Müller',
    secondary_contact_email: 'claudia.mueller@swiss-precision.ch',
    secondary_contact_phone: '+41 44 123 45 68',
    secondary_contact_job_title: 'Head of Finance',
    gdpr_representative_name: 'Thomas Brunner',
    gdpr_representative_email: 'thomas.brunner@swiss-precision.ch',
    gdpr_representative_phone: '+41 44 123 45 69',
    dpo_name: 'Dr. Ursula Keller',
    dpo_email: 'dpo@swiss-precision.ch',
    dpo_phone: '+41 44 123 45 70',
    bank_name: 'UBS Switzerland AG',
    bank_country: 'Switzerland',
    bank_iban: 'CH9300762011623852957',
    bank_swift: 'UBSWCHZH80A',
    account_holder_name: 'Swiss Precision Engineering SA',
    terms_accepted: true,
    terms_accepted_at: '2024-12-19T15:45:00Z',
    privacy_policy_accepted: true,
    privacy_policy_accepted_at: '2024-12-19T15:45:00Z',
    service_agreement_accepted: true,
    service_agreement_accepted_at: '2024-12-19T15:45:00Z',
    applicant_notes: 'Premium client requiring white-glove collection services for high-value B2B transactions. Discretion and professionalism are paramount.',
    created_at: '2024-12-19T15:30:00Z',
    submitted_at: '2024-12-19T15:50:00Z',
    created_by: 'user_swissprec_001'
  },
  {
    id: 'app_006',
    application_number: 'APP-2024-006',
    status: 'additional_info_required',
    company_name: 'Digital Marketing Experts SARL',
    business_type: 'limited_liability',
    incorporation_country: 'France',
    registration_number: 'FR123456789',
    vat_number: 'FR12345678901',
    tax_id: 'DM123456789',
    industry: 'Digital Marketing',
    business_description: 'Full-service digital marketing agency providing SEO, PPC, social media management, and web development services to SMEs.',
    website_url: 'https://digital-experts.fr',
    business_address: {
      street: '25 Avenue des Champs-Élysées',
      city: 'Paris',
      postalCode: '75008',
      country: 'France'
    },
    annual_revenue_range: '€2M - €5M',
    employee_count_range: '20-50',
    years_in_business: 6,
    expected_monthly_cases: 40,
    expected_average_case_value: 5500,
    primary_debtor_types: ['B2B', 'SME', 'Startups'],
    primary_contact_name: 'Pierre Dubois',
    primary_contact_email: 'pierre.dubois@digital-experts.fr',
    primary_contact_phone: '+33 1 42 12 34 56',
    primary_contact_job_title: 'Directeur Général',
    secondary_contact_name: 'Sophie Martin',
    secondary_contact_email: 'sophie.martin@digital-experts.fr',
    secondary_contact_phone: '+33 1 42 12 34 57',
    secondary_contact_job_title: 'Responsable Financière',
    gdpr_representative_name: 'Jean-Luc Bernard',
    gdpr_representative_email: 'jean-luc.bernard@digital-experts.fr',
    gdpr_representative_phone: '+33 1 42 12 34 58',
    bank_name: 'BNP Paribas',
    bank_country: 'France',
    bank_iban: 'FR1420041010050500013M02606',
    bank_swift: 'BNPAFRPP',
    account_holder_name: 'Digital Marketing Experts SARL',
    terms_accepted: true,
    terms_accepted_at: '2024-12-16T10:30:00Z',
    privacy_policy_accepted: true,
    privacy_policy_accepted_at: '2024-12-16T10:30:00Z',
    service_agreement_accepted: true,
    service_agreement_accepted_at: '2024-12-16T10:30:00Z',
    applicant_notes: 'Growing agency needing professional collection services for our diverse SME client base. French language support would be beneficial.',
    admin_notes: 'Need additional documentation for French SARL verification and proof of professional indemnity insurance.',
    created_at: '2024-12-16T10:15:00Z',
    submitted_at: '2024-12-16T10:35:00Z',
    reviewed_at: '2024-12-17T09:20:00Z',
    created_by: 'user_digitalexp_001',
    reviewed_by: 'admin_1'
  },
  {
    id: 'app_007',
    application_number: 'APP-2024-007',
    status: 'rejected',
    company_name: 'QuickCash Loans Ltd',
    business_type: 'limited_liability',
    incorporation_country: 'United Kingdom',
    registration_number: 'GB98765432',
    vat_number: 'GB987654321',
    industry: 'Payday Lending',
    business_description: 'Short-term lending and payday loan services for consumers.',
    business_address: {
      street: '123 High Street',
      city: 'Birmingham',
      postalCode: 'B1 1AA',
      country: 'United Kingdom'
    },
    annual_revenue_range: '£500K - £1M',
    employee_count_range: '10-20',
    years_in_business: 3,
    expected_monthly_cases: 200,
    expected_average_case_value: 500,
    primary_debtor_types: ['B2C', 'Consumer'],
    primary_contact_name: 'Robert Smith',
    primary_contact_email: 'robert.smith@quickcash.co.uk',
    primary_contact_phone: '+44 121 123 4567',
    primary_contact_job_title: 'Director',
    gdpr_representative_name: 'Robert Smith',
    gdpr_representative_email: 'robert.smith@quickcash.co.uk',
    bank_name: 'Metro Bank',
    bank_country: 'United Kingdom',
    bank_iban: 'GB33BUKB20201555555555',
    bank_swift: 'BUKBGB22',
    account_holder_name: 'QuickCash Loans Ltd',
    terms_accepted: true,
    terms_accepted_at: '2024-12-15T13:20:00Z',
    privacy_policy_accepted: true,
    privacy_policy_accepted_at: '2024-12-15T13:20:00Z',
    service_agreement_accepted: true,
    service_agreement_accepted_at: '2024-12-15T13:20:00Z',
    rejection_reason: 'Application rejected due to high-risk industry classification and insufficient regulatory compliance documentation. Payday lending requires specialized collection procedures not currently supported.',
    created_at: '2024-12-15T13:00:00Z',
    submitted_at: '2024-12-15T13:25:00Z',
    reviewed_at: '2024-12-16T11:30:00Z',
    created_by: 'user_quickcash_001',
    reviewed_by: 'admin_1'
  },
  {
    id: 'app_008',
    application_number: 'APP-2024-008',
    status: 'approved',
    company_name: 'Benelux Logistics BV',
    business_type: 'limited_liability',
    incorporation_country: 'Netherlands',
    registration_number: 'NL123456789B01',
    vat_number: 'NL123456789B01',
    tax_id: 'BL123456789',
    industry: 'Logistics & Transportation',
    business_description: 'International logistics and freight forwarding services across Benelux countries and Germany.',
    website_url: 'https://benelux-logistics.nl',
    business_address: {
      street: 'Logistiekweg 50',
      city: 'Rotterdam',
      postalCode: '3045 AG',
      country: 'Netherlands'
    },
    annual_revenue_range: '€10M - €20M',
    employee_count_range: '100-200',
    years_in_business: 18,
    expected_monthly_cases: 30,
    expected_average_case_value: 12000,
    primary_debtor_types: ['B2B', 'Logistics', 'Manufacturing'],
    primary_contact_name: 'Jan van der Berg',
    primary_contact_email: 'jan.vandenberg@benelux-logistics.nl',
    primary_contact_phone: '+31 10 123 45 67',
    primary_contact_job_title: 'Managing Director',
    secondary_contact_name: 'Lisa de Vries',
    secondary_contact_email: 'lisa.devries@benelux-logistics.nl',
    secondary_contact_phone: '+31 10 123 45 68',
    secondary_contact_job_title: 'Finance Manager',
    gdpr_representative_name: 'Pieter Janssen',
    gdpr_representative_email: 'pieter.janssen@benelux-logistics.nl',
    gdpr_representative_phone: '+31 10 123 45 69',
    dpo_name: 'Dr. Anne Bakker',
    dpo_email: 'dpo@benelux-logistics.nl',
    dpo_phone: '+31 10 123 45 70',
    bank_name: 'ING Bank N.V.',
    bank_country: 'Netherlands',
    bank_iban: 'NL91INGB0002445588',
    bank_swift: 'INGBNL2A',
    account_holder_name: 'Benelux Logistics BV',
    terms_accepted: true,
    terms_accepted_at: '2024-12-14T09:45:00Z',
    privacy_policy_accepted: true,
    privacy_policy_accepted_at: '2024-12-14T09:45:00Z',
    service_agreement_accepted: true,
    service_agreement_accepted_at: '2024-12-14T09:45:00Z',
    applicant_notes: 'Established logistics company seeking professional collection services for cross-border trade receivables.',
    admin_notes: 'Excellent application with complete documentation. Approved for standard service tier.',
    created_at: '2024-12-14T09:30:00Z',
    submitted_at: '2024-12-14T09:50:00Z',
    reviewed_at: '2024-12-15T14:20:00Z',
    approved_at: '2024-12-15T14:25:00Z',
    created_by: 'user_benelux_001',
    reviewed_by: 'admin_1'
  }
];

interface ClientApplication {
  id: string;
  application_number: string;
  status: 'draft' | 'submitted' | 'under_review' | 'additional_info_required' | 'approved' | 'rejected';
  company_name: string;
  business_type: string;
  incorporation_country: string;
  registration_number?: string;
  vat_number?: string;
  tax_id?: string;
  industry: string;
  business_description: string;
  website_url?: string;
  business_address: any;
  annual_revenue_range: string;
  employee_count_range: string;
  years_in_business: number;
  expected_monthly_cases: number;
  expected_average_case_value: number;
  primary_debtor_types: string[];
  primary_contact_name: string;
  primary_contact_email: string;
  primary_contact_phone?: string;
  primary_contact_job_title: string;
  secondary_contact_name?: string;
  secondary_contact_email?: string;
  secondary_contact_phone?: string;
  secondary_contact_job_title?: string;
  gdpr_representative_name: string;
  gdpr_representative_email: string;
  gdpr_representative_phone?: string;
  dpo_name?: string;
  dpo_email?: string;
  dpo_phone?: string;
  bank_name: string;
  bank_country: string;
  bank_iban: string;
  bank_swift?: string;
  account_holder_name: string;
  terms_accepted: boolean;
  terms_accepted_at?: string;
  privacy_policy_accepted: boolean;
  privacy_policy_accepted_at?: string;
  service_agreement_accepted: boolean;
  service_agreement_accepted_at?: string;
  applicant_notes?: string;
  admin_notes?: string;
  rejection_reason?: string;
  created_at: string;
  submitted_at?: string;
  reviewed_at?: string;
  approved_at?: string;
  created_by: string;
  reviewed_by?: string;
}

const statusConfig = {
  draft: { 
    label: 'Draft', 
    color: 'bg-gray-100 text-gray-800', 
    icon: Edit,
    description: 'Application in progress'
  },
  submitted: { 
    label: 'Submitted', 
    color: 'bg-blue-100 text-blue-800', 
    icon: FileText,
    description: 'Awaiting initial review'
  },
  under_review: { 
    label: 'Under Review', 
    color: 'bg-yellow-100 text-yellow-800', 
    icon: Eye,
    description: 'Being reviewed by compliance team'
  },
  additional_info_required: { 
    label: 'Info Required', 
    color: 'bg-orange-100 text-orange-800', 
    icon: AlertTriangle,
    description: 'Additional information requested'
  },
  approved: { 
    label: 'Approved', 
    color: 'bg-green-100 text-green-800', 
    icon: CheckCircle,
    description: 'Application approved and active'
  },
  rejected: { 
    label: 'Rejected', 
    color: 'bg-red-100 text-red-800', 
    icon: XCircle,
    description: 'Application declined'
  }
};

const businessTypeLabels = {
  sole_proprietorship: 'Sole Proprietorship',
  partnership: 'Partnership',
  limited_liability: 'Limited Liability Company',
  corporation: 'Corporation',
  other: 'Other'
};

export default function OnboardingManagement() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<ClientApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<ClientApplication[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<ClientApplication | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Review form state
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | 'request_info'>('approve');
  const [reviewNotes, setReviewNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Use mock data instead of loading from Supabase for demo
    setApplications(mockClientApplications);
    setLoading(false);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [applications, statusFilter, industryFilter, searchQuery]);

  const applyFilters = () => {
    let filtered = [...applications];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    if (industryFilter !== 'all') {
      filtered = filtered.filter(app => app.industry === industryFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(app => 
        app.company_name.toLowerCase().includes(query) ||
        app.primary_contact_email.toLowerCase().includes(query) ||
        app.primary_contact_name.toLowerCase().includes(query) ||
        app.application_number.toLowerCase().includes(query)
      );
    }

    setFilteredApplications(filtered);
  };

  const handleReviewSubmit = async () => {
    if (!selectedApplication || !user?.id) return;

    if (reviewAction === 'reject' && !rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      const updateData: any = {
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        admin_notes: reviewNotes.trim() || null
      };

      switch (reviewAction) {
        case 'approve':
          updateData.status = 'approved';
          updateData.approved_at = new Date().toISOString();
          break;
        case 'reject':
          updateData.status = 'rejected';
          updateData.rejection_reason = rejectionReason.trim();
          break;
        case 'request_info':
          updateData.status = 'additional_info_required';
          break;
      }

      const { error } = await supabase
        .from('client_applications')
        .update(updateData)
        .eq('id', selectedApplication.id);

      if (error) throw error;

      // Update local state
      setApplications(prev => 
        prev.map(app => 
          app.id === selectedApplication.id 
            ? { ...app, ...updateData }
            : app
        )
      );

      // Create review record
      const { error: reviewError } = await supabase
        .from('application_reviews')
        .insert({
          application_id: selectedApplication.id,
          reviewer_id: user.id,
          review_type: 'final_approval',
          status: reviewAction === 'approve' ? 'approved' : reviewAction === 'reject' ? 'rejected' : 'needs_info',
          comments: reviewNotes.trim() || null,
          company_info_verified: true,
          documents_verified: reviewAction === 'approve',
          compliance_verified: reviewAction === 'approve',
          risk_assessment_completed: true,
          completed_at: new Date().toISOString()
        });

      if (reviewError) console.error('Failed to create review record:', reviewError);

      setShowReviewDialog(false);
      setReviewNotes('');
      setRejectionReason('');
      
      toast.success(`Application ${reviewAction === 'approve' ? 'approved' : reviewAction === 'reject' ? 'rejected' : 'marked for additional info'}`);
    } catch (error) {
      console.error('Failed to update application:', error);
      toast.error('Failed to update application status');
    }
  };

  const exportApplications = () => {
    const csvContent = [
      ['Application Number', 'Company Name', 'Contact Name', 'Email', 'Status', 'Industry', 'Revenue Range', 'Expected Cases', 'Submitted Date'].join(','),
      ...filteredApplications.map(app => [
        app.application_number,
        `"${app.company_name}"`,
        `"${app.primary_contact_name}"`,
        app.primary_contact_email,
        app.status,
        `"${app.industry}"`,
        `"${app.annual_revenue_range}"`,
        app.expected_monthly_cases,
        app.submitted_at ? new Date(app.submitted_at).toLocaleDateString() : 'Not submitted'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `client-applications-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Applications exported to CSV');
  };

  const stats = {
    total: applications.length,
    submitted: applications.filter(a => a.status === 'submitted').length,
    under_review: applications.filter(a => a.status === 'under_review').length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
    pending_review: applications.filter(a => ['submitted', 'under_review'].includes(a.status)).length
  };

  const uniqueIndustries = [...new Set(applications.map(a => a.industry).filter(Boolean))];

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Client Application Management</h1>
          <p className="text-muted-foreground">
            Review and approve new client onboarding applications
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportApplications}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          {stats.pending_review > 0 && (
            <Badge variant="outline" className="text-sm py-2 px-4 border-warning text-warning">
              {stats.pending_review} Pending Review
            </Badge>
          )}
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        <Card className="card-professional">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Applications</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-professional">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <FileText className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Submitted</p>
                <p className="text-2xl font-bold">{stats.submitted}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-professional">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <Eye className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Under Review</p>
                <p className="text-2xl font-bold">{stats.under_review}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-professional">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold">{stats.approved}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-professional">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <XCircle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rejected</p>
                <p className="text-2xl font-bold">{stats.rejected}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-professional">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold">{stats.pending_review}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="card-professional">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by company name, contact, email, or application number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="additional_info_required">Info Required</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              <Select value={industryFilter} onValueChange={setIndustryFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Industries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  {uniqueIndustries.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card className="card-professional">
        <CardHeader>
          <CardTitle>Client Applications ({filteredApplications.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto"></div>
              <p className="text-muted-foreground mt-2">Loading applications...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Application</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Business Profile</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                      No applications found matching your criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredApplications.map((application) => {
                    const StatusIcon = statusConfig[application.status].icon;
                    
                    return (
                      <TableRow key={application.id} className="hover:bg-muted/30">
                        <TableCell>
                          <div>
                            <p className="font-medium">{application.application_number}</p>
                            <p className="text-xs text-muted-foreground">
                              {businessTypeLabels[application.business_type as keyof typeof businessTypeLabels]}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <Building className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{application.company_name}</p>
                              <p className="text-xs text-muted-foreground">{application.incorporation_country}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium">{application.primary_contact_name}</p>
                            <p className="text-xs text-muted-foreground">{application.primary_contact_email}</p>
                            <p className="text-xs text-muted-foreground">{application.primary_contact_job_title}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {application.industry}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="flex items-center gap-1 mb-1">
                              <TrendingUp className="h-3 w-3" />
                              <span className="text-xs">{application.annual_revenue_range}</span>
                            </div>
                            <div className="flex items-center gap-1 mb-1">
                              <Target className="h-3 w-3" />
                              <span className="text-xs">{application.expected_monthly_cases} cases/month</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              <span className="text-xs">€{application.expected_average_case_value?.toLocaleString()}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusConfig[application.status].color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig[application.status].label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {application.submitted_at ? (
                            <span className="text-sm">
                              {format(new Date(application.submitted_at), 'MMM dd, yyyy')}
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground italic">Not submitted</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedApplication(application);
                                setShowDetailDialog(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {['submitted', 'under_review'].includes(application.status) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedApplication(application);
                                  setShowReviewDialog(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Application Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Application Details - {selectedApplication?.company_name}</DialogTitle>
          </DialogHeader>
          
          {selectedApplication && (
            <Tabs defaultValue="company" className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="company">Company</TabsTrigger>
                <TabsTrigger value="contacts">Contacts</TabsTrigger>
                <TabsTrigger value="business">Business</TabsTrigger>
                <TabsTrigger value="banking">Banking</TabsTrigger>
                <TabsTrigger value="gdpr">GDPR</TabsTrigger>
                <TabsTrigger value="agreements">Agreements</TabsTrigger>
              </TabsList>
              
              <ScrollArea className="h-96 mt-4">
                <TabsContent value="company" className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Building className="h-5 w-5" />
                          Company Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div><strong>Legal Name:</strong> {selectedApplication.company_name}</div>
                        <div><strong>Business Type:</strong> {businessTypeLabels[selectedApplication.business_type as keyof typeof businessTypeLabels]}</div>
                        <div><strong>Industry:</strong> {selectedApplication.industry}</div>
                        <div><strong>Incorporation Country:</strong> {selectedApplication.incorporation_country}</div>
                        <div><strong>Registration Number:</strong> {selectedApplication.registration_number || 'Not provided'}</div>
                        <div><strong>VAT Number:</strong> {selectedApplication.vat_number || 'Not provided'}</div>
                        <div><strong>Website:</strong> {selectedApplication.website_url || 'Not provided'}</div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <MapPin className="h-5 w-5" />
                          Business Address
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm space-y-1">
                          {selectedApplication.business_address?.street && (
                            <div>{selectedApplication.business_address.street}</div>
                          )}
                          <div>
                            {selectedApplication.business_address?.city}
                            {selectedApplication.business_address?.postalCode && 
                              `, ${selectedApplication.business_address.postalCode}`
                            }
                          </div>
                          <div>{selectedApplication.business_address?.country}</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Business Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{selectedApplication.business_description}</p>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="contacts" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <User className="h-5 w-5" />
                          Primary Contact
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div><strong>Name:</strong> {selectedApplication.primary_contact_name}</div>
                        <div><strong>Job Title:</strong> {selectedApplication.primary_contact_job_title}</div>
                        <div><strong>Email:</strong> {selectedApplication.primary_contact_email}</div>
                        <div><strong>Phone:</strong> {selectedApplication.primary_contact_phone || 'Not provided'}</div>
                      </CardContent>
                    </Card>
                    
                    {(selectedApplication.secondary_contact_name || selectedApplication.secondary_contact_email) && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Secondary Contact
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div><strong>Name:</strong> {selectedApplication.secondary_contact_name || 'Not provided'}</div>
                          <div><strong>Job Title:</strong> {selectedApplication.secondary_contact_job_title || 'Not provided'}</div>
                          <div><strong>Email:</strong> {selectedApplication.secondary_contact_email || 'Not provided'}</div>
                          <div><strong>Phone:</strong> {selectedApplication.secondary_contact_phone || 'Not provided'}</div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="business" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <TrendingUp className="h-5 w-5" />
                          Financial Profile
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div><strong>Annual Revenue:</strong> {selectedApplication.annual_revenue_range}</div>
                        <div><strong>Employees:</strong> {selectedApplication.employee_count_range}</div>
                        <div><strong>Years in Business:</strong> {selectedApplication.years_in_business}</div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Target className="h-5 w-5" />
                          Collection Profile
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div><strong>Expected Monthly Cases:</strong> {selectedApplication.expected_monthly_cases}</div>
                        <div><strong>Average Case Value:</strong> €{selectedApplication.expected_average_case_value?.toLocaleString()}</div>
                        <div>
                          <strong>Debtor Types:</strong>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedApplication.primary_debtor_types?.map((type) => (
                              <Badge key={type} variant="outline" className="text-xs">
                                {type}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="banking" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Banking Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div><strong>Bank Name:</strong> {selectedApplication.bank_name}</div>
                        <div><strong>Bank Country:</strong> {selectedApplication.bank_country}</div>
                        <div><strong>IBAN:</strong> {selectedApplication.bank_iban}</div>
                        <div><strong>SWIFT/BIC:</strong> {selectedApplication.bank_swift || 'Not provided'}</div>
                        <div className="col-span-2"><strong>Account Holder:</strong> {selectedApplication.account_holder_name}</div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="gdpr" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        GDPR Representative
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div><strong>Name:</strong> {selectedApplication.gdpr_representative_name}</div>
                      <div><strong>Email:</strong> {selectedApplication.gdpr_representative_email}</div>
                      <div><strong>Phone:</strong> {selectedApplication.gdpr_representative_phone || 'Not provided'}</div>
                    </CardContent>
                  </Card>
                  
                  {(selectedApplication.dpo_name || selectedApplication.dpo_email) && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <User className="h-5 w-5" />
                          Data Protection Officer
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div><strong>Name:</strong> {selectedApplication.dpo_name || 'Not provided'}</div>
                        <div><strong>Email:</strong> {selectedApplication.dpo_email || 'Not provided'}</div>
                        <div><strong>Phone:</strong> {selectedApplication.dpo_phone || 'Not provided'}</div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
                
                <TabsContent value="agreements" className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-6 text-center">
                        <div className={`p-3 rounded-lg mb-3 ${selectedApplication.terms_accepted ? 'bg-success/10' : 'bg-destructive/10'}`}>
                          {selectedApplication.terms_accepted ? (
                            <CheckCircle className="h-6 w-6 text-success mx-auto" />
                          ) : (
                            <XCircle className="h-6 w-6 text-destructive mx-auto" />
                          )}
                        </div>
                        <p className="font-medium">Terms of Service</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {selectedApplication.terms_accepted ? 'Accepted' : 'Not Accepted'}
                        </p>
                        {selectedApplication.terms_accepted_at && (
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(selectedApplication.terms_accepted_at), 'MMM dd, yyyy HH:mm')}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-6 text-center">
                        <div className={`p-3 rounded-lg mb-3 ${selectedApplication.privacy_policy_accepted ? 'bg-success/10' : 'bg-destructive/10'}`}>
                          {selectedApplication.privacy_policy_accepted ? (
                            <CheckCircle className="h-6 w-6 text-success mx-auto" />
                          ) : (
                            <XCircle className="h-6 w-6 text-destructive mx-auto" />
                          )}
                        </div>
                        <p className="font-medium">Privacy Policy</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {selectedApplication.privacy_policy_accepted ? 'Accepted' : 'Not Accepted'}
                        </p>
                        {selectedApplication.privacy_policy_accepted_at && (
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(selectedApplication.privacy_policy_accepted_at), 'MMM dd, yyyy HH:mm')}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-6 text-center">
                        <div className={`p-3 rounded-lg mb-3 ${selectedApplication.service_agreement_accepted ? 'bg-success/10' : 'bg-destructive/10'}`}>
                          {selectedApplication.service_agreement_accepted ? (
                            <CheckCircle className="h-6 w-6 text-success mx-auto" />
                          ) : (
                            <XCircle className="h-6 w-6 text-destructive mx-auto" />
                          )}
                        </div>
                        <p className="font-medium">Service Agreement</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {selectedApplication.service_agreement_accepted ? 'Accepted' : 'Not Accepted'}
                        </p>
                        {selectedApplication.service_agreement_accepted_at && (
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(selectedApplication.service_agreement_accepted_at), 'MMM dd, yyyy HH:mm')}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                  
                  {selectedApplication.applicant_notes && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Applicant Notes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">{selectedApplication.applicant_notes}</p>
                      </CardContent>
                    </Card>
                  )}
                  
                  {selectedApplication.admin_notes && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Admin Notes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">{selectedApplication.admin_notes}</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </ScrollArea>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Application</DialogTitle>
          </DialogHeader>
          
          {selectedApplication && (
            <div className="space-y-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Building className="h-6 w-6 text-primary" />
                    <div>
                      <h4 className="font-semibold">{selectedApplication.company_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedApplication.application_number} • {selectedApplication.industry}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><strong>Contact:</strong> {selectedApplication.primary_contact_name}</div>
                    <div><strong>Revenue:</strong> {selectedApplication.annual_revenue_range}</div>
                    <div><strong>Expected Cases:</strong> {selectedApplication.expected_monthly_cases}/month</div>
                    <div><strong>Avg Value:</strong> €{selectedApplication.expected_average_case_value?.toLocaleString()}</div>
                  </div>
                </CardContent>
              </Card>
              
              <div>
                <Label className="text-sm font-medium">Review Decision</Label>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  <Button
                    variant={reviewAction === 'approve' ? 'default' : 'outline'}
                    onClick={() => setReviewAction('approve')}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Approve
                  </Button>
                  <Button
                    variant={reviewAction === 'request_info' ? 'default' : 'outline'}
                    onClick={() => setReviewAction('request_info')}
                    className="flex items-center gap-2"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    Request Info
                  </Button>
                  <Button
                    variant={reviewAction === 'reject' ? 'destructive' : 'outline'}
                    onClick={() => setReviewAction('reject')}
                    className="flex items-center gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </Button>
                </div>
              </div>
              
              <div>
                <Label htmlFor="reviewNotes" className="text-sm font-medium">
                  Review Notes
                </Label>
                <Textarea
                  id="reviewNotes"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add notes about your review decision..."
                  rows={3}
                />
              </div>
              
              {reviewAction === 'reject' && (
                <div>
                  <Label htmlFor="rejectionReason" className="text-sm font-medium">
                    Rejection Reason <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="rejectionReason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Please provide a detailed reason for rejection..."
                    rows={3}
                  />
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReviewDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleReviewSubmit}
              variant={reviewAction === 'reject' ? 'destructive' : 'default'}
            >
              {reviewAction === 'approve' ? 'Approve Application' : 
               reviewAction === 'reject' ? 'Reject Application' : 
               'Request Additional Info'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}